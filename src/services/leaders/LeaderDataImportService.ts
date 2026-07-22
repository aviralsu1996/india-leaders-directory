/**
 * LeaderDataImportService — full-record official leader data import.
 *
 * Runs the shared LEADER_PROVIDER_CHAIN (../leaders/providers.ts) in priority
 * order and merges results into a leader record field-by-field: a field is
 * only ever filled if it is CURRENTLY EMPTY on the leader — a populated
 * field, verified or not, is never overwritten. Because the merge walks
 * providers in priority order and only fills gaps, higher-priority official
 * sources win for any field they supply, and Wikipedia Commons (last in the
 * chain) only ever fills whatever is still missing after every official
 * source has been tried — i.e. genuinely "fallback only".
 *
 * Like ImageSourcingService, this only ever *finds* candidates
 * (findMergedLeaderData / scanForMissingDataCandidates) — applyLeaderImport
 * is a separate, explicit step that re-verifies each field is still empty
 * immediately before writing, and logs every applied change to audit_logs.
 */
import { dbService } from '../../lib/supabaseClient';
import { auditLogRepository } from '../audit/AuditLogRepository';
import { LEADER_PROVIDER_CHAIN } from './providers';
import type { ProviderScrapeResult, SupabaseLeader } from '../../types';

/** Leader fields this pipeline is allowed to fill, mapped to the scrape result field that supplies them. */
const IMPORTABLE_FIELDS: Array<{ leaderField: keyof SupabaseLeader; scrapeField: keyof ProviderScrapeResult }> = [
  { leaderField: 'designation', scrapeField: 'designation' },
  { leaderField: 'ministry', scrapeField: 'ministry' },
  { leaderField: 'constituency', scrapeField: 'constituency' },
  { leaderField: 'state', scrapeField: 'state' },
  { leaderField: 'party', scrapeField: 'party' },
  { leaderField: 'bio', scrapeField: 'bio' },
  { leaderField: 'image', scrapeField: 'officialImage' },
  { leaderField: 'cover_image', scrapeField: 'coverImage' },
  { leaderField: 'website', scrapeField: 'officialWebsite' },
  { leaderField: 'email', scrapeField: 'email' },
  { leaderField: 'twitter', scrapeField: 'twitter' },
  { leaderField: 'facebook', scrapeField: 'facebook' },
  { leaderField: 'instagram', scrapeField: 'instagram' },
  { leaderField: 'youtube', scrapeField: 'youtube' },
];

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

export interface LeaderFieldUpdate {
  field: string;
  newValue: string;
  source: string;
}

export interface LeaderImportCandidate {
  leaderId: string;
  leaderSlug: string;
  leaderName: string;
  updates: LeaderFieldUpdate[];
}

export class LeaderDataImportService {
  /**
   * Runs every provider (no early exit) and merges whatever fields each one
   * supplies, in priority order, filling only fields still empty on the
   * leader. Returns the merge result plus a per-field source map.
   */
  async findMergedLeaderData(
    leader: SupabaseLeader
  ): Promise<{ merged: Partial<SupabaseLeader>; sources: Record<string, string> }> {
    const merged: Partial<SupabaseLeader> = {};
    const sources: Record<string, string> = {};

    const stillNeeded = () =>
      IMPORTABLE_FIELDS.some(
        ({ leaderField }) => isEmpty(leader[leaderField]) && isEmpty((merged as Record<string, unknown>)[leaderField])
      );

    for (const provider of LEADER_PROVIDER_CHAIN) {
      if (!stillNeeded()) break; // every importable field is already filled — no need to try lower-priority sources

      let result: ProviderScrapeResult | null = null;
      try {
        result = await provider(leader);
      } catch {
        continue; // a single provider failing should never abort the chain
      }
      if (!result) continue;

      for (const { leaderField, scrapeField } of IMPORTABLE_FIELDS) {
        if (!isEmpty(leader[leaderField])) continue; // already populated on the leader — never touch
        if (!isEmpty((merged as Record<string, unknown>)[leaderField])) continue; // already filled by a higher-priority provider

        const scraped = result[scrapeField];
        if (typeof scraped === 'string' && !isEmpty(scraped)) {
          (merged as Record<string, unknown>)[leaderField] = scraped;
          sources[leaderField] = result.source;
        }
      }
    }

    return { merged, sources };
  }

  /**
   * Scans a leader list and finds candidate field updates, WITHOUT writing
   * anything. Only leaders missing at least one importable field are
   * considered, and only their empty fields are ever proposed for filling.
   */
  async scanForMissingDataCandidates(
    leaders: SupabaseLeader[],
    onProgress?: (current: number, total: number, fieldsFound: number) => void
  ): Promise<LeaderImportCandidate[]> {
    const targets = leaders.filter((l) => IMPORTABLE_FIELDS.some(({ leaderField }) => isEmpty(l[leaderField])));
    const candidates: LeaderImportCandidate[] = [];

    for (let i = 0; i < targets.length; i++) {
      const leader = targets[i];
      const { merged, sources } = await this.findMergedLeaderData(leader);
      const updates: LeaderFieldUpdate[] = Object.entries(merged)
        .filter(([, value]) => typeof value === 'string' && !isEmpty(value))
        .map(([field, value]) => ({ field, newValue: value as string, source: sources[field] }));

      if (updates.length > 0) {
        candidates.push({ leaderId: leader.id, leaderSlug: leader.slug, leaderName: leader.name, updates });
      }
      onProgress?.(i + 1, targets.length, updates.length);
    }

    return candidates;
  }

  /**
   * Applies a candidate's field updates. Re-fetches the leader and re-checks
   * EACH field individually is still empty right before writing, so nothing
   * an admin (or a concurrent import run) has filled in the meantime is ever
   * overwritten. Logs every applied field to audit_logs, and every skipped
   * field (already filled since the scan) as an info entry.
   */
  async applyLeaderImport(candidate: LeaderImportCandidate): Promise<{ fieldsApplied: number; fieldsSkipped: number }> {
    const current = await dbService.getLeaderBySlug(candidate.leaderSlug);
    if (!current) {
      await auditLogRepository.log({
        leader_slug: candidate.leaderSlug,
        action: 'leader_import',
        status: 'error',
        message: `Leader ${candidate.leaderName} no longer exists — import skipped.`,
      });
      return { fieldsApplied: 0, fieldsSkipped: candidate.updates.length };
    }

    const fieldSources: Record<string, string> = { ...(current.field_sources || {}) };
    const writable: Partial<SupabaseLeader> = {};
    let fieldsApplied = 0;
    let fieldsSkipped = 0;

    for (const update of candidate.updates) {
      const currentValue = (current as unknown as Record<string, unknown>)[update.field];
      if (!isEmpty(currentValue)) {
        fieldsSkipped++;
        await auditLogRepository.log({
          leader_id: current.id,
          leader_slug: current.slug,
          action: 'leader_import',
          provider: update.source,
          status: 'info',
          message: `Skipped ${update.field} for ${current.name} — already populated since the scan ran.`,
        });
        continue;
      }
      (writable as Record<string, unknown>)[update.field] = update.newValue;
      fieldSources[update.field] = update.source;
      fieldsApplied++;
    }

    if (fieldsApplied > 0) {
      await dbService.updateLeader(current.id, {
        ...writable,
        field_sources: fieldSources,
        verified: true,
        last_verified: new Date().toISOString(),
      });

      await auditLogRepository.log({
        leader_id: current.id,
        leader_slug: current.slug,
        action: 'leader_import',
        status: 'success',
        message: `Imported ${fieldsApplied} field(s) for ${current.name} from official sources.`,
        details: { fields: candidate.updates.map((u) => u.field), sources: fieldSources },
      });
    }

    return { fieldsApplied, fieldsSkipped };
  }
}

export const leaderDataImportService = new LeaderDataImportService();
