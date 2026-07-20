import { createClient } from '@supabase/supabase-js';
import { SupabaseLeader } from '../types';

// Use environment values from browser or Node runtime.
const browserEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;

export const supabaseUrl =
  (browserEnv?.VITE_SUPABASE_URL as string) ||
  (nodeEnv?.VITE_SUPABASE_URL as string) ||
  '';

export const supabaseAnonKey =
  (browserEnv?.VITE_SUPABASE_ANON_KEY as string) ||
  (nodeEnv?.VITE_SUPABASE_ANON_KEY as string) ||
  '';

// Determine if Supabase is fully configured (ensuring it is a real URL and not a dummy/placeholder key)
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseUrl.includes('your-') &&
  !supabaseUrl.includes('YOUR_')
);

// Lazy initialize the Supabase client
let supabaseInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// No local JSON fallbacks — Supabase is the single source of truth.
// If Supabase is not configured, methods will return empty results and
// emit console warnings so that UI can display proper error states.
/**
 * Supabase Database Service
 * All leader data is read from and written to Supabase.
 * Supabase is the single source of truth.
 */
export const dbService = {
  // Fetch list of leaders
  async getLeaders(filters: {
    category?: string;
    state?: string;
    party?: string;
    featured?: boolean;
    status?: string;
    search?: string;
  } = {}): Promise<SupabaseLeader[]> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      let query = sb.from('leaders').select('*');

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.state && filters.state !== 'all') {
        query = query.eq('state', filters.state);
      }
      if (filters.party && filters.party !== 'all') {
        query = query.eq('party', filters.party);
      }
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,designation.ilike.%${filters.search}%,constituency.ilike.%${filters.search}%`);
      }

      // Order by latest
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase getLeaders failed:', error);
        return [];
      }
      return data as SupabaseLeader[];
    }

    console.warn('Supabase is not configured; returning empty leader list.');
    return [];
  },

  // Retrieve single leader
  async getLeaderBySlug(slug: string): Promise<SupabaseLeader | null> {
    const normalized = String(slug || '').trim();
    if (!normalized) return null;

    if (!isSupabaseConfigured) {
      console.warn('Supabase is not configured; cannot load leader by slug.');
      return null;
    }
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').select('*').or(`slug.eq.${normalized},id.eq.${normalized}`).maybeSingle();
    if (error) {
      console.warn('Supabase getLeaderBySlug failed:', error);
      return null;
    }
    return data as SupabaseLeader | null;
  },

  // Search leaders with pagination
  async searchLeaders(query: string, limit = 20, offset = 0): Promise<{ data: SupabaseLeader[]; count: number }> {
    if (!isSupabaseConfigured) return { data: [], count: 0 };
    const sb = getSupabase();
    const ilike = `%${query}%`;
    const q = sb.from('leaders').select('*', { count: 'exact' }).or(`name.ilike.${ilike},designation.ilike.${ilike},constituency.ilike.${ilike}`)
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) {
      console.warn('Supabase searchLeaders failed:', error);
      return { data: [], count: 0 };
    }
    return { data: data as SupabaseLeader[], count: (count as number) || (data || []).length };
  },

  // Get featured leaders
  async getFeaturedLeaders(limit = 10): Promise<SupabaseLeader[]> {
    return await this.getLeaders({ featured: true, status: 'Published' }).then(d => d.slice(0, limit));
  },

  // Get leaders by category
  async getLeadersByCategory(category: string, limit = 50): Promise<SupabaseLeader[]> {
    return await this.getLeaders({ category, status: 'Published' }).then(d => d.slice(0, limit));
  },

  // Get related leaders (by state or category)
  async getRelatedLeaders(leader: Partial<SupabaseLeader>, limit = 6): Promise<SupabaseLeader[]> {
    if (!isSupabaseConfigured) return [];
    const sb = getSupabase();
    const state = leader.state || '';
    const category = leader.category || '';
    let query = sb.from('leaders').select('*').neq('id', leader.id).order('created_at', { ascending: false });
    if (state) query = query.eq('state', state);
    if (category) query = query.eq('category', category);
    const { data, error } = await query.range(0, limit - 1);
    if (error) {
      console.warn('Supabase getRelatedLeaders failed:', error);
      return [];
    }
    return data as SupabaseLeader[];
  },

  // Create leader
  async createLeader(leader: Omit<SupabaseLeader, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseLeader> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').insert([leader]).select().single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  // Update leader
  async updateLeader(id: string, updates: Partial<SupabaseLeader>): Promise<SupabaseLeader> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  // Delete leader
  async deleteLeader(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { error } = await sb.from('leaders').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Bulk Delete
  async bulkDelete(ids: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { error } = await sb.from('leaders').delete().in('id', ids);
    if (error) throw error;
    return true;
  },

  // Bulk Import CSV
  async bulkImportCSV(csvText: string): Promise<{ success: boolean; importedCount: number; logs: string[]; data: SupabaseLeader[] }> {
    const res = await fetch('/api/directory/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText })
    });
    return await res.json();
  },

  // Trigger automation sync
  async triggerSync(leaderId?: string): Promise<{ success: boolean; processed: number; logs: string[] }> {
    const res = await fetch('/api/directory/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaderId })
    });
    return await res.json();
  },

  // Automated Profile Image Search & Sync
  async scanMissingImages(): Promise<{ success: boolean; scanned: number; added: number; failed: number; results: any[] }> {
    const res = await fetch('/api/directory/scan-missing-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  // Automated Cover Image Generator
  async generateMissingCovers(): Promise<{ success: boolean; scanned: number; generated: number }> {
    const res = await fetch('/api/directory/generate-missing-covers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  // Fetch System logs
  async getSystemLogs(): Promise<{ success: boolean; logs: any[] }> {
    const res = await fetch('/api/directory/system-logs');
    return await res.json();
  },

  // Add system log entry
  async addSystemLog(type: string, message: string, details?: string): Promise<{ success: boolean; log: any }> {
    const res = await fetch('/api/directory/add-system-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, message, details })
    });
    return await res.json();
  },

  // Automatically commit changes to GitHub
  async triggerGitHubCommit(summary?: string): Promise<{ success: boolean; commitSha: string; branch: string; message: string }> {
    const res = await fetch('/api/directory/github-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary })
    });
    return await res.json();
  },

  // Trigger Vercel Production deployment automatically
  async triggerVercelDeploy(): Promise<{ success: boolean; deployId: string; url: string; status: string }> {
    const res = await fetch('/api/directory/vercel-deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  }
};
