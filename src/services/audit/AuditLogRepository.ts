/**
 * AuditLogRepository — persists pipeline audit entries to the real
 * public.audit_logs table (added in migration 002, never actually wired up
 * until now — dbService.addSystemLog()/getSystemLogs() were pure in-memory
 * mocks that never touched Supabase at all).
 *
 * Same graceful-degradation pattern used elsewhere in this codebase
 * (NewsRepository): try Supabase first, fall back to an in-memory list on
 * any failure (including RLS rejecting the write) so the admin UI never
 * crashes, while making the failure visible via console.warn.
 *
 * KNOWN LIMITATION: audit_logs' RLS write policy is `TO authenticated`
 * (see migration 002), but this app's admin panel does not use real Supabase
 * Auth — it's a client-side password gate only. Unless a real Supabase Auth
 * session is established, writes here will be rejected by RLS and silently
 * fall back to the in-memory list (see final report).
 */
import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export interface AuditLogEntry {
  id?: string;
  leader_id?: string | null;
  leader_slug?: string | null;
  action: string;
  provider?: string | null;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
  created_at?: string;
}

const MAX_MEMORY_LOGS = 500;

export class AuditLogRepository {
  private memoryLogs: AuditLogEntry[] = [];

  async log(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<AuditLogEntry> {
    const withTimestamp: AuditLogEntry = { ...entry, created_at: new Date().toISOString() };

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('audit_logs').insert([entry]).select().single();
        if (!error && data) return data as AuditLogEntry;
        console.warn('audit_logs insert failed (RLS or connectivity) — falling back to in-memory log:', error);
      }
    }

    this.memoryLogs.unshift(withTimestamp);
    if (this.memoryLogs.length > MAX_MEMORY_LOGS) this.memoryLogs.pop();
    return withTimestamp;
  }

  async getRecent(filter?: {
    leaderSlug?: string;
    action?: string;
    status?: AuditLogEntry['status'];
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const limit = filter?.limit ?? 100;

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        let query = sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (filter?.leaderSlug) query = query.eq('leader_slug', filter.leaderSlug);
        if (filter?.action) query = query.eq('action', filter.action);
        if (filter?.status) query = query.eq('status', filter.status);
        const { data, error } = await query;
        if (!error && data) return data as AuditLogEntry[];
        console.warn('audit_logs read failed (RLS or connectivity) — falling back to in-memory log:', error);
      }
    }

    return this.memoryLogs
      .filter((l) => !filter?.leaderSlug || l.leader_slug === filter.leaderSlug)
      .filter((l) => !filter?.action || l.action === filter.action)
      .filter((l) => !filter?.status || l.status === filter.status)
      .slice(0, limit);
  }

  async getFailedJobs(limit = 100): Promise<AuditLogEntry[]> {
    return this.getRecent({ status: 'error', limit });
  }
}

export const auditLogRepository = new AuditLogRepository();
