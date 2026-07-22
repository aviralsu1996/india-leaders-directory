/**
 * SyncQueueRepository — persists retry-able sync jobs to the real
 * public.sync_queue table (added in migration 002, never wired up until now).
 * Same Supabase-first, in-memory-fallback pattern as AuditLogRepository — see
 * that file's KNOWN LIMITATION note about RLS requiring an authenticated
 * Supabase session this app doesn't currently establish.
 */
import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export interface SyncQueueEntry {
  id?: string;
  leader_id?: string | null;
  leader_slug: string;
  provider: string;
  priority?: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  attempts?: number;
  max_attempts?: number;
  last_error?: string | null;
  payload?: Record<string, unknown>;
  scheduled_at?: string;
  processed_at?: string | null;
}

export class SyncQueueRepository {
  private memoryQueue: SyncQueueEntry[] = [];

  async enqueue(entry: Omit<SyncQueueEntry, 'status' | 'attempts'>): Promise<SyncQueueEntry> {
    const record: SyncQueueEntry = {
      ...entry,
      status: 'queued',
      attempts: 0,
      max_attempts: entry.max_attempts ?? 3,
      priority: entry.priority ?? 5,
    };

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('sync_queue').insert([record]).select().single();
        if (!error && data) return data as SyncQueueEntry;
        console.warn('sync_queue insert failed (RLS or connectivity) — falling back to in-memory queue:', error);
      }
    }

    this.memoryQueue.push(record);
    return record;
  }

  async markStatus(
    id: string,
    status: SyncQueueEntry['status'],
    updates: Partial<Pick<SyncQueueEntry, 'last_error' | 'attempts' | 'processed_at'>> = {}
  ): Promise<void> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from('sync_queue').update({ status, ...updates }).eq('id', id);
        if (!error) return;
        console.warn('sync_queue update failed (RLS or connectivity) — falling back to in-memory queue:', error);
      }
    }

    const item = this.memoryQueue.find((i) => i.id === id);
    if (item) Object.assign(item, { status, ...updates });
  }

  async getAll(filter?: { status?: SyncQueueEntry['status']; limit?: number }): Promise<SyncQueueEntry[]> {
    const limit = filter?.limit ?? 200;

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        let query = sb.from('sync_queue').select('*').order('scheduled_at', { ascending: true }).limit(limit);
        if (filter?.status) query = query.eq('status', filter.status);
        const { data, error } = await query;
        if (!error && data) return data as SyncQueueEntry[];
        console.warn('sync_queue read failed (RLS or connectivity) — falling back to in-memory queue:', error);
      }
    }

    return this.memoryQueue.filter((i) => !filter?.status || i.status === filter.status).slice(0, limit);
  }

  async getFailed(): Promise<SyncQueueEntry[]> {
    return this.getAll({ status: 'failed' });
  }

  /** Re-queues a failed job for another attempt (used by the admin "Retry" button). */
  async retry(id: string): Promise<void> {
    await this.markStatus(id, 'queued', { last_error: null });
  }
}

export const syncQueueRepository = new SyncQueueRepository();
