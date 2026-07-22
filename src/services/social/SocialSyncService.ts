/**
 * SocialSyncService — admin-facing wrapper around the existing socialVerifier.
 *
 * socialVerifier only ever validates URLs already on a leader's record
 * (format + a "suspicious" blocklist) — it never invents or fetches new
 * links, by design ("Never generates fake links" per its own header). This
 * service adds the audit-logging layer so a run shows up in the admin
 * dashboard's Logs/Failed Jobs, and a summary count for the Social Sync tab.
 *
 * Filling in a MISSING social link from an official source (as opposed to
 * validating an existing one) is handled by LeaderDataImportService, which
 * already covers twitter/facebook/instagram/youtube as importable fields —
 * reused here rather than duplicated.
 */
import { socialVerifier } from './socialVerifier';
import type { SocialVerificationResult } from './socialVerifier';
import { auditLogRepository } from '../audit/AuditLogRepository';
import type { SupabaseLeader } from '../../types';

export interface SocialAuditSummary {
  totalChecked: number;
  leadersWithInvalidLinks: number;
  leadersMissingAllSocial: number;
  results: SocialVerificationResult[];
}

export class SocialSyncService {
  /** Read-only: validates every leader's existing social links, never modifies anything. */
  async runAudit(leaders: SupabaseLeader[]): Promise<SocialAuditSummary> {
    const results = socialVerifier.verifyAll(leaders);

    const leadersWithInvalidLinks = results.filter((r) => r.links.some((l) => l.url && !l.verified)).length;
    const leadersMissingAllSocial = results.filter((r) => !r.hasAnyVerified).length;

    for (const result of results) {
      const invalid = result.links.filter((l) => l.url && !l.verified);
      if (invalid.length === 0) continue;
      await auditLogRepository.log({
        leader_id: result.leaderId,
        leader_slug: result.leaderSlug,
        action: 'social_audit',
        status: 'warning',
        message: `${result.leaderName}: ${invalid.length} social link(s) failed validation (${invalid
          .map((l) => `${l.platform}:${l.reason}`)
          .join(', ')}).`,
      });
    }

    await auditLogRepository.log({
      action: 'social_audit',
      status: 'info',
      message: `Social link audit complete: ${leadersWithInvalidLinks} leader(s) with invalid links, ${leadersMissingAllSocial} leader(s) with no verified social presence at all, out of ${leaders.length} checked.`,
    });

    return {
      totalChecked: leaders.length,
      leadersWithInvalidLinks,
      leadersMissingAllSocial,
      results,
    };
  }
}

export const socialSyncService = new SocialSyncService();
