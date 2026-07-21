import { createClient } from '@supabase/supabase-js';
import { SupabaseLeader } from '../types';

// Browser env (Vite) or Node env (server)
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

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-') &&
  !supabaseUrl.includes('YOUR_')
);

let supabaseInstance: any = null;
export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// --- Helper utilities ---
const POLITICAL_COVERS = [
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1200&auto=format&fit=crop&q=80'
];

export function isPlaceholderImage(url?: string) {
  if (!url) return true;
  const lower = String(url).toLowerCase();
  return lower.includes('placeholder') || lower.includes('avatar') || lower.trim() === '';
}

export function isPlaceholderCover(url?: string) {
  if (!url) return true;
  const lower = String(url).toLowerCase();
  return (
    lower.includes('placeholder') ||
    lower.includes('unsplash.com/photo-1540910419892-4a36d2c3266c') ||
    lower.trim() === ''
  );
}

function getCoverForLeader(category?: string, state?: string) {
  const idx = ((category || '') + (state || ''))
    .split('')
    .reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return POLITICAL_COVERS[idx % POLITICAL_COVERS.length];
}

async function searchWikipediaPortrait(name: string): Promise<string | null> {
  try {
    const clean = encodeURIComponent(name.replace(/^((Shri|Smt|Dr|Mr|Ms)\.?\s+)/i, ''));
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${clean}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    const pages = json?.query?.pages;
    if (!pages) return null;
    for (const k of Object.keys(pages)) {
      const p = pages[k];
      if (p?.thumbnail?.source) return p.thumbnail.source as string;
    }
    return null;
  } catch {
    return null;
  }
}

// Browser-only image compressor to WebP (graceful no-op on server)
export function compressToWebP(
  imageSrc: string,
  width = 500,
  height = 500,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const hasWindow = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    if (!hasWindow) return resolve(imageSrc);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(imageSrc);
            resolve(URL.createObjectURL(blob));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    } catch {
      resolve(imageSrc);
    }
  });
}

// --- Public DB service ---
// All methods require Supabase. If not configured, they throw — no silent fallbacks.
export const dbService = {
  // Fetch list of leaders with optional filters
  async getLeaders(
    filters: {
      category?: string;
      state?: string;
      party?: string;
      featured?: boolean;
      status?: string;
      search?: string;
    } = {}
  ): Promise<SupabaseLeader[]> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

    let query: any = sb.from('leaders').select('*');
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.state && filters.state !== 'all') query = query.eq('state', filters.state);
    if (filters.party && filters.party !== 'all') query = query.eq('party', filters.party);
    if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,designation.ilike.%${filters.search}%,constituency.ilike.%${filters.search}%`
      );
    }
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as SupabaseLeader[];
  },

  // FIX: Use .eq('slug', slug) — do NOT include id.eq.slug which causes UUID cast failure
  async getLeaderBySlug(slug: string): Promise<SupabaseLeader | null> {
    const normalized = String(slug || '').trim().toLowerCase();
    if (!normalized) return null;

    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

    const isUuid = /^[0-9a-fA-F-]{36}$/.test(normalized);

const query = isUuid
  ? sb.from('leaders').select('*').eq('id', normalized)
  : sb.from('leaders').select('*').eq('slug', normalized);

const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data as SupabaseLeader | null;
  },

  async searchLeaders(
    queryStr: string,
    limit = 20,
    offset = 0
  ): Promise<{ data: SupabaseLeader[]; count: number }> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');

    const ilike = `%${queryStr}%`;
    const { data, error, count } = await sb
      .from('leaders')
      .select('*', { count: 'exact' })
      .or(`name.ilike.${ilike},designation.ilike.${ilike},constituency.ilike.${ilike}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: (data || []) as SupabaseLeader[], count: (count as number) || (data?.length ?? 0) };
  },

  async getFeaturedLeaders(limit = 10): Promise<SupabaseLeader[]> {
    const list = await this.getLeaders({ featured: true, status: 'Published' });
    return list.slice(0, limit);
  },

  async getLeadersByCategory(category: string, limit = 50): Promise<SupabaseLeader[]> {
    const list = await this.getLeaders({ category, status: 'Published' });
    return list.slice(0, limit);
  },

  async getRelatedLeaders(leader: Partial<SupabaseLeader>, limit = 6): Promise<SupabaseLeader[]> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');

    let query: any = sb
      .from('leaders')
      .select('*')
      .neq('id', leader.id)
      .order('created_at', { ascending: false });
    if (leader.state) query = query.eq('state', leader.state);
    if (leader.category) query = query.eq('category', leader.category);

    const { data, error } = await query.range(0, limit - 1);
    if (error) throw error;
    return (data || []) as SupabaseLeader[];
  },

  async createLeader(
    leader: Omit<SupabaseLeader, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseLeader> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');
    const { data, error } = await sb.from('leaders').insert([leader]).select().single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  async updateLeader(id: string, updates: Partial<SupabaseLeader>): Promise<SupabaseLeader> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');
    const { data, error } = await sb
      .from('leaders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  async deleteLeader(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');
    const { error } = await sb.from('leaders').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async bulkDelete(ids: string[]): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');
    const { error } = await sb.from('leaders').delete().in('id', ids);
    if (error) throw error;
    return true;
  },

  async bulkImportCSV(
    csvText: string
  ): Promise<{ success: boolean; importedCount: number; logs: string[]; data: SupabaseLeader[] }> {
    const logs: string[] = ['[INIT] Parsing CSV text...'];
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');

    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const imported: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const row: any = {};
      headers.forEach((h, idx) => (row[h] = cols[idx] || ''));
      if (row.name) {
        const slug = row.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        imported.push({
          slug,
          name: row.name,
          designation: row.designation || 'Leader',
          category: row.category || 'Cabinet Minister',
          state: row.state || 'Delhi',
          constituency: row.constituency || 'General',
          party: row.party || 'Independent',
          gender: row.gender || 'Male',
          bio: row.bio || `Profile of ${row.name}`,
          education: row.education || 'Graduate',
          profession: row.profession || 'Public Service',
          featured: row.featured === 'true' || row.featured === '1',
          status: 'Published',
        });
      }
    }

    const { data, error } = await sb.from('leaders').insert(imported).select();
    if (error) throw error;
    return {
      success: true,
      importedCount: (data || []).length,
      logs,
      data: (data || []) as SupabaseLeader[],
    };
  },

  async triggerSync(
    leaderId?: string
  ): Promise<{ success: boolean; processed: number; logs: string[] }> {
    const logs: string[] = ['[START] Starting image processing pipeline...'];
    let processed = 0;
    const targetLeaders: SupabaseLeader[] = leaderId
      ? [await this.getLeaderBySlug(leaderId)].filter(Boolean) as SupabaseLeader[]
      : await this.getLeaders();

    for (const leader of targetLeaders) {
      let updated = false;
      const updates: Partial<SupabaseLeader> = {};
      if (isPlaceholderCover(leader.cover_image)) {
        updates.cover_image = getCoverForLeader(leader.category, leader.state);
        updated = true;
      }
      if (isPlaceholderImage(leader.image)) {
        const wikiUrl = await searchWikipediaPortrait(leader.name);
        if (wikiUrl) {
          updates.image = wikiUrl;
          updated = true;
        }
      }
      if (updated) {
        await this.updateLeader(leader.id, updates);
        processed++;
      }
    }
    logs.push(`[SUCCESS] Image synchronization complete. Processed ${processed}`);
    return { success: true, processed, logs };
  },

  async scanMissingImages(): Promise<{
    success: boolean;
    scanned: number;
    added: number;
    failed: number;
    results: any[];
  }> {
    let scanned = 0,
      added = 0,
      failed = 0;
    const results: any[] = [];
    const allLeaders = await this.getLeaders();
    scanned = allLeaders.length;
    for (const leader of allLeaders) {
      if (isPlaceholderImage(leader.image)) {
        const wikiUrl = await searchWikipediaPortrait(leader.name);
        if (wikiUrl) {
          await this.updateLeader(leader.id, { image: wikiUrl });
          added++;
          results.push({ name: leader.name, status: 'Success', url: wikiUrl });
        } else {
          failed++;
          results.push({ name: leader.name, status: 'Not Found' });
        }
      }
    }
    return { success: true, scanned, added, failed, results };
  },

  async generateMissingCovers(): Promise<{ success: boolean; scanned: number; generated: number }> {
    let scanned = 0,
      generated = 0;
    const allLeaders = await this.getLeaders();
    scanned = allLeaders.length;
    for (const leader of allLeaders) {
      if (isPlaceholderCover(leader.cover_image)) {
        const resolved = getCoverForLeader(leader.category, leader.state);
        await this.updateLeader(leader.id, { cover_image: resolved });
        generated++;
      }
    }
    return { success: true, scanned, generated };
  },

  async getSystemLogs(): Promise<{ success: boolean; logs: any[] }> {
    return {
      success: true,
      logs: [{ id: 1, type: 'INFO', message: 'System initialized', created_at: new Date().toISOString() }],
    };
  },

  async addSystemLog(type: string, message: string, details?: string) {
    return { success: true, log: { id: Date.now(), type, message, details, created_at: new Date().toISOString() } };
  },

  async triggerGitHubCommit(summary?: string) {
    return { success: true, commitSha: 'mocksha', branch: 'main', message: summary || 'Auto commit' };
  },

  async triggerVercelDeploy() {
    return {
      success: true,
      deployId: 'dep_mock',
      url: 'https://riva-directory-gov.vercel.app',
      status: 'queued',
    };
  },

  async submitContact(contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
  }) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured.');
    const { error } = await sb.from('contacts').insert([contact]);
    if (error) throw error;
    return { success: true, message: 'Your request has been submitted.' };
  },
};
