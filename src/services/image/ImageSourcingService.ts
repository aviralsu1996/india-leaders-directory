/**
 * ImageSourcingService — safe, priority-ordered pipeline for finding a verified
 * profile photo for a leader who is currently missing one.
 *
 * The actual provider chain (Lok Sabha -> Rajya Sabha -> PMO -> Cabinet
 * Secretariat -> Ministry -> State Govt -> Election Commission -> Wikipedia
 * Commons) lives in ../leaders/providers.ts, shared with LeaderDataImportService
 * so there is exactly one implementation of "where do we get verified data
 * from" instead of two copies drifting apart. This class narrows those
 * full-record results down to just the image field.
 *
 * This module only ever *finds candidates* — it never writes to the database.
 * Callers (admin UI actions) decide whether/when to apply a candidate via
 * `applyImageCandidate`, which re-checks the leader is still missing an image
 * at write time so a candidate found from a stale scan can't clobber an image
 * an admin added in the meantime.
 */
import { dbService } from '../../lib/supabaseClient';
import { isPlaceholderImage } from '../../lib/imageUtils';
import { LEADER_PROVIDER_CHAIN } from '../leaders/providers';
import type { ProviderScrapeResult, SupabaseLeader } from '../../types';

export interface ImageCandidate {
  leaderId: string;
  leaderSlug: string;
  leaderName: string;
  candidateUrl: string;
  source: string;
  profileUrl: string | null;
}

export class ImageSourcingService {
  /** Try each provider in priority order; returns the first one with a verified image. */
  async findVerifiedImageCandidate(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
    for (const provider of LEADER_PROVIDER_CHAIN) {
      try {
        const result = await provider(leader);
        if (result?.officialImage) return result;
      } catch {
        // A single provider failing should never abort the chain.
      }
    }
    return null;
  }

  /**
   * Scans a leader list for missing images and finds candidates, WITHOUT writing
   * anything to the database. Only leaders currently classified as missing/
   * placeholder are considered — a leader with any existing non-placeholder
   * image is never touched.
   */
  async scanForMissingImageCandidates(
    leaders: SupabaseLeader[],
    onProgress?: (current: number, total: number, found: boolean) => void
  ): Promise<ImageCandidate[]> {
    const missing = leaders.filter((l) => isPlaceholderImage(l.image));
    const candidates: ImageCandidate[] = [];

    for (let i = 0; i < missing.length; i++) {
      const leader = missing[i];
      const result = await this.findVerifiedImageCandidate(leader);
      const found = !!result?.officialImage;
      if (result?.officialImage) {
        candidates.push({
          leaderId: leader.id,
          leaderSlug: leader.slug,
          leaderName: leader.name,
          candidateUrl: result.officialImage,
          source: result.source,
          profileUrl: result.officialProfileUrl,
        });
      }
      onProgress?.(i + 1, missing.length, found);
    }
    return candidates;
  }

  /**
   * Applies a single candidate to the database. Re-checks the leader's current
   * image is still a placeholder immediately before writing, so a candidate
   * computed earlier in a scan can never overwrite an image added since.
   */
  async applyImageCandidate(candidate: ImageCandidate): Promise<{ applied: boolean; reason?: string }> {
    const current = await dbService.getLeaderBySlug(candidate.leaderSlug);
    if (!current) return { applied: false, reason: 'Leader no longer exists' };
    if (!isPlaceholderImage(current.image)) {
      return { applied: false, reason: 'Leader already has a verified image — not overwritten' };
    }

    await dbService.updateLeader(current.id, {
      image: candidate.candidateUrl,
      image_source: candidate.source,
      official_profile_url: candidate.profileUrl || current.official_profile_url,
      verified: true,
      last_verified: new Date().toISOString(),
    });

    return { applied: true };
  }
}

export const imageSourcingService = new ImageSourcingService();
