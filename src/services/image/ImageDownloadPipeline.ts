/**
 * ImageDownloadPipeline — downloads a verified image candidate (from
 * ImageSourcingService / LeaderDataImportService) and re-hosts it in
 * Supabase Storage instead of leaving leaders.image pointing at an external
 * URL that could disappear, rate-limit, or change later.
 *
 * Flow: download -> verify it's actually an image -> content-hash it ->
 * check for a duplicate elsewhere in the dataset -> upload to Supabase
 * Storage -> update leaders.image with the Supabase-hosted URL -> log to
 * audit_logs. On any failure, enqueues a sync_queue entry so a scheduled
 * retry can pick it back up instead of the candidate being silently lost.
 *
 * This is additive: ImageSourcingService.applyImageCandidate (Phase 5) is
 * unchanged and still available for callers that just want the hotlinked
 * URL stored directly. The admin "Scan Missing Images" action (ImageSync.tsx)
 * uses this pipeline instead, since production use should re-host images.
 */
import { storageService } from '../storage/storageService';
import { hashBlob } from '../../lib/imageUtils';
import { dbService } from '../../lib/supabaseClient';
import { isPlaceholderImage } from '../../lib/imageUtils';
import { duplicateDetector } from '../scraping/DuplicateDetector';
import { auditLogRepository } from '../audit/AuditLogRepository';
import { syncQueueRepository } from '../audit/SyncQueueRepository';
import type { ImageCandidate } from './ImageSourcingService';
import type { SupabaseLeader } from '../../types';

export interface DownloadOutcome {
  applied: boolean;
  reason?: string;
  publicUrl?: string;
}

export class ImageDownloadPipeline {
  /**
   * Downloads and re-hosts a single candidate. `allLeaders` is used only for
   * duplicate-image detection (comparing the new candidate's content hash
   * against every other leader's stored image_hash) — pass the current
   * leader list from the caller so this never issues its own full-table scan.
   */
  async downloadAndStore(candidate: ImageCandidate, allLeaders: SupabaseLeader[]): Promise<DownloadOutcome> {
    // Re-verify right before doing any work — a stale candidate should never
    // clobber an image someone else already verified in the meantime.
    const current = await dbService.getLeaderBySlug(candidate.leaderSlug);
    if (!current) return this.fail(candidate, 'Leader no longer exists');
    if (!isPlaceholderImage(current.image)) {
      return this.fail(candidate, 'Leader already has a verified image — not overwritten', 'info');
    }

    let response: Response;
    try {
      response = await fetch(candidate.candidateUrl, { referrerPolicy: 'no-referrer' });
    } catch (err: any) {
      return this.failAndQueue(candidate, `Download failed: ${err.message || err}`);
    }
    if (!response.ok) {
      return this.failAndQueue(candidate, `Download failed: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return this.failAndQueue(candidate, `Response was not an image (content-type: ${contentType || 'unknown'})`);
    }

    const blob = await response.blob();
    const hash = await hashBlob(blob);

    const duplicate = allLeaders.find(
      (l) => l.image_hash === hash && l.slug !== candidate.leaderSlug
    );
    if (duplicate) {
      await auditLogRepository.log({
        leader_id: current.id,
        leader_slug: current.slug,
        action: 'image_download',
        provider: candidate.source,
        status: 'warning',
        message: `Skipped ${candidate.leaderName}: candidate image is byte-identical to ${duplicate.name}'s existing photo — likely a shared placeholder/logo from the source site, not a real portrait.`,
        details: { candidateUrl: candidate.candidateUrl, hash, conflictsWith: duplicate.slug },
      });
      return { applied: false, reason: `Duplicate of ${duplicate.name}'s image — needs manual review` };
    }

    const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg';
    const fileName = `${candidate.leaderSlug}-${hash.slice(0, 16)}.${extension}`;

    const upload = await storageService.upload({
      folder: 'profile',
      fileName,
      file: blob,
      contentType,
      upsert: true,
    });

    if (!upload.success) {
      return this.failAndQueue(candidate, `Supabase Storage upload failed: ${upload.error}`);
    }

    await dbService.updateLeader(current.id, {
      image: upload.publicUrl,
      image_source: candidate.source,
      image_hash: hash,
      official_profile_url: candidate.profileUrl || current.official_profile_url,
      verified: true,
      last_verified: new Date().toISOString(),
    });

    await auditLogRepository.log({
      leader_id: current.id,
      leader_slug: current.slug,
      action: 'image_download',
      provider: candidate.source,
      status: 'success',
      message: `Downloaded and stored a verified portrait for ${candidate.leaderName} via ${candidate.source}.`,
      details: { storagePath: upload.path, sourceUrl: candidate.candidateUrl },
    });

    return { applied: true, publicUrl: upload.publicUrl };
  }

  /** Re-attempts every queued/failed image_download job in sync_queue. */
  async retryQueuedDownloads(allLeaders: SupabaseLeader[]): Promise<{ retried: number; succeeded: number }> {
    const queued = (await syncQueueRepository.getAll({ status: 'queued' })).filter(
      (j) => j.provider === 'image_download'
    );

    let succeeded = 0;
    for (const job of queued) {
      if (!job.id) continue;
      await syncQueueRepository.markStatus(job.id, 'processing');
      const payload = job.payload as { candidateUrl?: string; source?: string; leaderName?: string } | undefined;
      if (!payload?.candidateUrl) {
        await syncQueueRepository.markStatus(job.id, 'failed', { last_error: 'Missing candidate URL in queue payload' });
        continue;
      }

      const outcome = await this.downloadAndStore(
        {
          leaderId: job.leader_id || '',
          leaderSlug: job.leader_slug,
          leaderName: payload.leaderName || job.leader_slug,
          candidateUrl: payload.candidateUrl,
          source: payload.source || job.provider,
          profileUrl: null,
        },
        allLeaders
      );

      if (outcome.applied) {
        succeeded++;
        await syncQueueRepository.markStatus(job.id, 'completed', { processed_at: new Date().toISOString() });
      } else {
        await syncQueueRepository.markStatus(job.id, 'failed', { last_error: outcome.reason });
      }
    }

    return { retried: queued.length, succeeded };
  }

  private async fail(
    candidate: ImageCandidate,
    reason: string,
    level: 'info' | 'warning' | 'error' = 'error'
  ): Promise<DownloadOutcome> {
    await auditLogRepository.log({
      leader_slug: candidate.leaderSlug,
      action: 'image_download',
      provider: candidate.source,
      status: level,
      message: `${candidate.leaderName}: ${reason}`,
    });
    return { applied: false, reason };
  }

  private async failAndQueue(candidate: ImageCandidate, reason: string): Promise<DownloadOutcome> {
    await this.fail(candidate, reason, 'error');
    await syncQueueRepository.enqueue({
      leader_id: candidate.leaderId || null,
      leader_slug: candidate.leaderSlug,
      provider: 'image_download',
      priority: 5,
      last_error: reason,
      payload: { candidateUrl: candidate.candidateUrl, source: candidate.source, leaderName: candidate.leaderName },
    });
    return { applied: false, reason };
  }
}

export const imageDownloadPipeline = new ImageDownloadPipeline();
