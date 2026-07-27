import { ElectionRecord, ElectionNotification, ELECTIONS_DATA, ELECTION_NOTIFICATIONS_DATA } from '../data/electionsData';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { ElectionSyncService, normalizeElectionRecord, ElectionSyncResult } from './electionSyncService';

export function getLocalElections(): ElectionRecord[] {
  const stored = localStorage.getItem('know_your_minister_elections');
  let records: ElectionRecord[] = ELECTIONS_DATA;

  if (stored) {
    try {
      const parsed: ElectionRecord[] = JSON.parse(stored);
      const recordMap = new Map<string, ElectionRecord>();
      
      // Seed with static ELECTIONS_DATA first
      ELECTIONS_DATA.forEach(staticRec => {
        recordMap.set(staticRec.slug || staticRec.id, staticRec);
      });

      // Overlay stored records if valid
      parsed.forEach(r => {
        if (r.id || r.slug) {
          recordMap.set(r.slug || r.id, r);
        }
      });

      records = Array.from(recordMap.values());
    } catch (e) {
      records = ELECTIONS_DATA;
    }
  }

  const processed = records.map(normalizeElectionRecord);
  localStorage.setItem('know_your_minister_elections', JSON.stringify(processed));
  return processed;
}

export function saveLocalElections(data: ElectionRecord[]) {
  const processed = data.map(normalizeElectionRecord);
  localStorage.setItem('know_your_minister_elections', JSON.stringify(processed));
}

export function getLocalNotifications(): ElectionNotification[] {
  const stored = localStorage.getItem('know_your_minister_election_notifs');
  if (!stored) {
    localStorage.setItem('know_your_minister_election_notifs', JSON.stringify(ELECTION_NOTIFICATIONS_DATA));
    return ELECTION_NOTIFICATIONS_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return ELECTION_NOTIFICATIONS_DATA;
  }
}

/**
 * Reusable Election API Service
 * Reads dynamically from Supabase `elections` table with zero hardcoded dependency.
 * Connects directly to Election Sync service for real-time ECI & BoomLive tracker sync.
 */
export const electionApiService = {
  // 1. Get elections list filtered by status, type, state, year, search
  async getElections(filters: {
    status?: string;
    type?: string;
    state?: string;
    year?: number;
    search?: string;
  } = {}): Promise<ElectionRecord[]> {
    let resultRecords: ElectionRecord[] = [];

    if (isSupabaseConfigured) {
      try {
        const sb = getSupabase();
        let query = sb.from('elections').select('*').order('election_year', { ascending: true });

        if (filters.status && filters.status !== 'all') {
          query = query.ilike('status', `%${filters.status}%`);
        }
        if (filters.type && filters.type !== 'all') {
          query = query.ilike('election_type', `%${filters.type}%`);
        }
        if (filters.state && filters.state !== 'all') {
          query = query.ilike('state', `%${filters.state}%`);
        }
        if (filters.year) {
          query = query.eq('election_year', filters.year);
        }
        if (filters.search) {
          const q = `%${filters.search}%`;
          query = query.or(`state.ilike.${q},election_type.ilike.${q},chief_minister.ilike.${q},winning_party.ilike.${q}`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          resultRecords = data.map(row => normalizeElectionRecord(row));
        } else {
          console.info('Supabase elections query empty or unpopulated, populating via Election Sync...');
          const syncRes = await ElectionSyncService.syncAllElections();
          resultRecords = syncRes.records;
        }
      } catch (e) {
        console.warn('Supabase elections fetch error, using local persistence:', e);
        resultRecords = getLocalElections();
      }
    } else {
      resultRecords = getLocalElections();
    }

    // Apply filter conditions in-memory if needed
    if (filters.status && filters.status !== 'all') {
      const st = filters.status.toLowerCase();
      resultRecords = resultRecords.filter(r => (r.status || '').toLowerCase().includes(st));
    }
    if (filters.type && filters.type !== 'all') {
      const tp = filters.type.toLowerCase();
      resultRecords = resultRecords.filter(r => (r.election_type || r.type || '').toLowerCase().includes(tp));
    }
    if (filters.state && filters.state !== 'all') {
      const stateQuery = filters.state.toLowerCase();
      resultRecords = resultRecords.filter(r => (r.state || '').toLowerCase().includes(stateQuery));
    }
    if (filters.year) {
      resultRecords = resultRecords.filter(r => Number(r.election_year || r.year) === Number(filters.year));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      resultRecords = resultRecords.filter(r =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.state || '').toLowerCase().includes(q) ||
        (r.chief_minister || '').toLowerCase().includes(q) ||
        (r.winning_party || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }

    return resultRecords;
  },

  // 2. Get single election by slug or id
  async getElectionBySlug(slug: string): Promise<ElectionRecord | null> {
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('elections').select('*').or(`id.eq.${slug},state.ilike.${slug}`).maybeSingle();
        if (!error && data) {
          return normalizeElectionRecord(data);
        }
      } catch (e) {
        console.warn('Supabase getElectionBySlug error:', e);
      }
    }

    const list = getLocalElections();
    const found = list.find(e => e.slug === slug || e.id === slug || e.state.toLowerCase() === slug.toLowerCase());
    return found ? normalizeElectionRecord(found) : null;
  },

  // 3. Get elections by state name
  async getElectionsByState(state: string): Promise<ElectionRecord[]> {
    return this.getElections({ state });
  },

  // 4. Upsert an election record in Supabase & local cache
  async upsertElection(record: Partial<ElectionRecord>): Promise<ElectionRecord> {
    const normalized = normalizeElectionRecord(record);

    if (isSupabaseConfigured) {
      try {
        const sb = getSupabase();
        const dbRow = {
          id: normalized.id,
          state: normalized.state,
          election_type: normalized.election_type,
          election_year: normalized.election_year,
          expected_month: normalized.expected_month,
          tenure_start: normalized.tenure_start,
          tenure_end: normalized.tenure_end,
          status: normalized.status,
          official_schedule: normalized.official_schedule,
          polling_date: normalized.polling_date,
          counting_date: normalized.counting_date,
          government_formed: normalized.government_formed,
          chief_minister: normalized.chief_minister,
          winning_party: normalized.winning_party,
          winning_alliance: normalized.winning_alliance,
          assembly_seats: normalized.assembly_seats,
          eci_url: normalized.eci_url,
          source: normalized.source,
          last_synced: normalized.last_synced
        };

        await sb.from('elections').upsert(dbRow, { onConflict: 'id' });
      } catch (e) {
        console.warn('Supabase upsertElection exception:', e);
      }
    }

    // Update local cache
    const list = getLocalElections();
    const idx = list.findIndex(r => r.id === normalized.id || r.slug === normalized.slug);
    if (idx !== -1) {
      list[idx] = normalized;
    } else {
      list.unshift(normalized);
    }
    saveLocalElections(list);

    return normalized;
  },

  // 5. Trigger manual sync from ECI and BoomLive priority sources
  async syncNow(): Promise<ElectionSyncResult> {
    return ElectionSyncService.syncAllElections();
  },

  // 6. Get official ECI notifications
  async getNotifications(): Promise<ElectionNotification[]> {
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('election_notifications').select('*').order('published_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as ElectionNotification[];
        }
      } catch (e) {
        console.warn('Supabase getNotifications error:', e);
      }
    }
    return getLocalNotifications();
  },

  // 7. Calculate real-time election statistics
  async getStats(): Promise<{ upcoming: number; official: number; polling: number; completed: number; total: number }> {
    const list = await this.getElections();
    const upcoming = list.filter(e => e.status === 'Tentative').length;
    const official = list.filter(e => e.status === 'Official Schedule' || e.status === 'Official').length;
    const polling = list.filter(e => e.status === 'Polling' || e.status === 'Ongoing').length;
    const completed = list.filter(e => e.status === 'Completed').length;
    return { upcoming, official, polling, completed, total: list.length };
  }
};

// Export backward compatible electionsDbService alias
export const electionsDbService = electionApiService;
