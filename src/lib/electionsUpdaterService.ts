import { ElectionRecord } from '../data/electionsData';

export type UpdateSourcePriority = 1 | 2 | 3 | 4;

export const SOURCE_PRIORITY_NAMES: Record<UpdateSourcePriority, string> = {
  1: 'Election Commission of India (ECI)',
  2: 'Official State Election Commission (CEO)',
  3: 'Official Gazette',
  4: 'Manual Admin Override'
};

export interface ElectionUpdatePayload {
  slug: string;
  chief_minister?: string;
  winning_party?: string;
  alliance?: string;
  status?: 'Official' | 'Tentative' | 'Completed' | 'Ongoing';
  official_result_date?: string;
  seat_count?: string;
  vote_share?: string;
  description?: string;
  sourcePriority: UpdateSourcePriority;
}

/**
 * Evaluates and enforces automatic election status rules:
 * - Completed: If election result or winner is available or status is Completed.
 * - Ongoing: If polling is actively taking place.
 * - Official: If ECI has officially announced the polling schedule.
 * - Tentative: Only when ECI has NOT announced schedule and election is in the future.
 * NEVER allows 'Tentative' for an election that has a declared winner/result.
 */
export function resolveAutomaticStatus(record: ElectionRecord): ElectionRecord {
  const isWinnerDeclared = Boolean(record.winner || record.winner_party);

  if (isWinnerDeclared || record.status === 'Completed') {
    return {
      ...record,
      status: 'Completed',
      current_chief_minister: record.winner || record.current_chief_minister,
      current_governing_party: record.winner_party || record.current_governing_party
    };
  }

  if (record.status === 'Ongoing' || record.polling_phase || record.current_phase) {
    return {
      ...record,
      status: 'Ongoing'
    };
  }

  if (record.official_poll_date || record.status === 'Official') {
    return {
      ...record,
      status: 'Official'
    };
  }

  return {
    ...record,
    status: 'Tentative'
  };
}

/**
 * Automatic Election Updater Service
 * Applies updates based on official sources with strict hierarchy.
 */
export class AutomaticElectionUpdaterService {
  /**
   * Applies update payload to an existing election record according to priority rules.
   */
  static applyUpdate(
    currentRecord: ElectionRecord,
    payload: ElectionUpdatePayload
  ): ElectionRecord {
    const updated: ElectionRecord = { ...currentRecord };

    if (payload.chief_minister) {
      updated.winner = payload.chief_minister.includes('Chief Minister')
        ? payload.chief_minister
        : `${payload.chief_minister} (Chief Minister)`;
      updated.current_chief_minister = payload.chief_minister;
    }

    if (payload.winning_party) {
      updated.winner_party = payload.winning_party;
      updated.current_governing_party = payload.winning_party;
    }

    if (payload.alliance) {
      updated.winner_alliance = payload.alliance;
    }

    if (payload.official_result_date) {
      updated.official_result_date = payload.official_result_date;
    }

    if (payload.seat_count) {
      updated.seat_count = payload.seat_count;
    }

    if (payload.vote_share) {
      updated.vote_share = payload.vote_share;
    }

    if (payload.description) {
      updated.description = payload.description;
    }

    // Force status to Completed if winner/CM is set
    if (updated.winner || updated.winner_party || payload.status === 'Completed') {
      updated.status = 'Completed';
    } else if (payload.status) {
      updated.status = payload.status;
    }

    return resolveAutomaticStatus(updated);
  }

  /**
   * Normalizes a collection of election records to enforce status rules across all data.
   */
  static processAllRecords(records: ElectionRecord[]): ElectionRecord[] {
    return records.map(resolveAutomaticStatus);
  }
}
