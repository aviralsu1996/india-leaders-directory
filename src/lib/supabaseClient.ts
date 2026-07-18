import { createClient } from '@supabase/supabase-js';
import { SupabaseLeader } from '../types';
import { initialDirectoryLeaders } from '../directoryLeadersData';

// Read client-side environment keys (prefixed with VITE_ per guidelines)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

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
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Filter leaders locally on the client-side as a high-reliability fallback.
 */
function getLocalFallbackLeaders(filters: {
  category?: string;
  state?: string;
  party?: string;
  featured?: boolean;
  status?: string;
  search?: string;
} = {}): SupabaseLeader[] {
  let filtered = [...initialDirectoryLeaders];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(l => l.category === filters.category);
  }
  if (filters.state && filters.state !== 'all') {
    filtered = filtered.filter(l => (l.state || '').toLowerCase() === (filters.state as string).toLowerCase());
  }
  if (filters.party && filters.party !== 'all') {
    filtered = filtered.filter(l => (l.party || '').toLowerCase() === (filters.party as string).toLowerCase());
  }
  if (filters.featured !== undefined) {
    filtered = filtered.filter(l => !!l.featured === !!filters.featured);
  }
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(l => l.status === filters.status);
  }
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    filtered = filtered.filter(l => 
      (l.name || '').toLowerCase().includes(query) ||
      (l.designation || '').toLowerCase().includes(query) ||
      (l.constituency || '').toLowerCase().includes(query) ||
      (l.bio || '').toLowerCase().includes(query)
    );
  }
  return filtered;
}

/**
 * Robust Database Service
 * Proxies calls directly to real Supabase if keys are available,
 * otherwise routes them to the fast local Express JSON store to maintain
 * 100% functionality and state preservation in the preview environment.
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
        console.warn('Supabase getLeaders failed, falling back to REST:', error);
      } else {
        return data as SupabaseLeader[];
      }
    }

    // Fallback REST API with high-resiliency local fallback
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.state) params.append('state', filters.state);
      if (filters.party) params.append('party', filters.party);
      if (filters.featured) params.append('featured', 'true');
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/directory/leaders?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError('Expected JSON response from server');
      }
      const json = await res.json();
      return json.success ? json.data : getLocalFallbackLeaders(filters);
    } catch (err) {
      console.warn('REST API fetch for leaders failed, using local fallback:', err);
      return getLocalFallbackLeaders(filters);
    }
  },

  // Retrieve single leader
  async getLeaderBySlug(slug: string): Promise<SupabaseLeader | null> {
    const normalized = String(slug || '').trim();
    if (!normalized) return null;

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      try {
        const { data, error } = await sb.from('leaders').select('*').or(`slug.eq.${normalized},id.eq.${normalized}`).single();
        if (!error && data) {
          return data as SupabaseLeader;
        }
      } catch (supabaseErr) {
        console.warn('Supabase getLeaderBySlug query failed, falling back to REST/local lookup:', supabaseErr);
      }
    }

    try {
      // Fallback REST API
      const res = await fetch(`/api/directory/leaders/${encodeURIComponent(normalized)}`);
      if (res.status === 404) return null;
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError('Expected JSON response from server');
      }
      const json = await res.json();
      if (json.success) return json.data;
    } catch (err) {
      console.warn('REST API fetch for single leader failed, using local fallback:', err);
    }

    // Local fallback with robust lookup
    const lookupKey = normalized.toLowerCase();
    const leader = initialDirectoryLeaders.find((l) => {
      const slugMatch = l.slug?.toLowerCase() === lookupKey;
      const idMatch = l.id?.toLowerCase() === lookupKey;
      const nameSlugMatch = l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === lookupKey;
      const nameMatch = l.name.toLowerCase() === lookupKey;
      return slugMatch || idMatch || nameSlugMatch || nameMatch;
    });
    return leader || null;
  },

  // Create leader
  async createLeader(leader: Omit<SupabaseLeader, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseLeader> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      const { data, error } = await sb.from('leaders').insert([leader]).select().single();
      if (!error && data) {
        return data as SupabaseLeader;
      }
      console.warn('Supabase createLeader failed, falling back to REST:', error);
    }

    // Fallback REST API
    const res = await fetch('/api/directory/leaders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leader)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create leader');
    return json.data;
  },

  // Update leader
  async updateLeader(id: string, updates: Partial<SupabaseLeader>): Promise<SupabaseLeader> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      const { data, error } = await sb.from('leaders').update(updates).eq('id', id).select().single();
      if (!error && data) {
        return data as SupabaseLeader;
      }
      console.warn('Supabase updateLeader failed, falling back to REST:', error);
    }

    // Fallback REST API
    const res = await fetch(`/api/directory/leaders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update leader');
    return json.data;
  },

  // Delete leader
  async deleteLeader(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      const { error } = await sb.from('leaders').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteLeader failed, falling back to REST:', error);
    }

    // Fallback REST API
    const res = await fetch(`/api/directory/leaders/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    return !!json.success;
  },

  // Bulk Delete
  async bulkDelete(ids: string[]): Promise<boolean> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      const { error } = await sb.from('leaders').delete().in('id', ids);
      if (!error) return true;
      console.warn('Supabase bulkDelete failed, falling back to REST:', error);
    }

    // Fallback REST API
    const res = await fetch('/api/directory/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    return !!json.success;
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
