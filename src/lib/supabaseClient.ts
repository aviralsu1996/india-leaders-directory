import { createClient } from '@supabase/supabase-js';
import { SupabaseLeader } from '../types';

// Runtime env detection (browser or Node)
const browserEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;

export const supabaseUrl = (browserEnv?.VITE_SUPABASE_URL as string) || (nodeEnv?.VITE_SUPABASE_URL as string) || '';
export const supabaseAnonKey = (browserEnv?.VITE_SUPABASE_ANON_KEY as string) || (nodeEnv?.VITE_SUPABASE_ANON_KEY as string) || '';

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

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getLocalLeaders(): SupabaseLeader[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem('know_your_minister_leaders') || '[]';
    return JSON.parse(raw) as SupabaseLeader[];
  } catch (e) {
    return [];
  }
}

function saveLocalLeaders(list: SupabaseLeader[]) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem('know_your_minister_leaders', JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export function isPlaceholderImage(url?: string) {
  if (!url) return true;
  const lower = String(url).toLowerCase();
  return lower.includes('placeholder') || lower.includes('avatar') || lower.trim() === '';
}

export function isPlaceholderCover(url?: string) {
  if (!url) return true;
  const lower = String(url).toLowerCase();
  return lower.includes('placeholder') || lower.includes('unsplash.com/photo-1540910419892-4a36d2c3266c') || lower.trim() === '';
}

function getCoverForLeader(category?: string, state?: string) {
  const idx = ((category || '') + (state || '')).split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
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
  } catch (e) {
    return null;
  }
}

// Browser-only image compressor to WebP (graceful no-op on server)
export function compressToWebP(imageSrc: string, width = 500, height = 500, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    if (!hasWindow()) return resolve(imageSrc);
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
        canvas.toBlob((blob) => {
          if (!blob) return resolve(imageSrc);
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/webp', quality);
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    } catch (e) {
      resolve(imageSrc);
    }
  });
}

// --- Public DB service ---
export const dbService = {
  // Fetch list of leaders with optional filters
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
      let query: any = sb.from('leaders').select('*');
      if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
      if (filters.state && filters.state !== 'all') query = query.eq('state', filters.state);
      if (filters.party && filters.party !== 'all') query = query.eq('party', filters.party);
      if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`name.ilike.%${filters.search}%,designation.ilike.%${filters.search}%,constituency.ilike.%${filters.search}%`);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase getLeaders failed:', error);
        return [];
      }
      return (data || []) as SupabaseLeader[];
    }
    // fallback: local leaders (browser only)
    return getLocalLeaders();
  },

  async getLeaderBySlug(slug: string): Promise<SupabaseLeader | null> {
    const normalized = String(slug || '').trim();
    if (!normalized) return null;
    if (!isSupabaseConfigured) return getLocalLeaders().find(l => l.slug === normalized) || null;
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').select('*').or(`slug.eq.${normalized},id.eq.${normalized}`).maybeSingle();
    if (error) { console.warn('Supabase getLeaderBySlug failed:', error); return null; }
    return data as SupabaseLeader | null;
  },

  async searchLeaders(queryStr: string, limit = 20, offset = 0): Promise<{ data: SupabaseLeader[]; count: number }> {
    if (!isSupabaseConfigured) return { data: [], count: 0 };
    const sb = getSupabase();
    const ilike = `%${queryStr}%`;
    const q = sb.from('leaders').select('*', { count: 'exact' }).or(`name.ilike.${ilike},designation.ilike.${ilike},constituency.ilike.${ilike}`).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) { console.warn('Supabase searchLeaders failed:', error); return { data: [], count: 0 }; }
    return { data: (data || []) as SupabaseLeader[], count: (count as number) || (data || []).length };
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
    if (!isSupabaseConfigured) return [];
    const sb = getSupabase();
    const state = leader.state || '';
    const category = leader.category || '';
    let query: any = sb.from('leaders').select('*').neq('id', leader.id).order('created_at', { ascending: false });
    if (state) query = query.eq('state', state);
    if (category) query = query.eq('category', category);
    const { data, error } = await query.range(0, limit - 1);
    if (error) { console.warn('Supabase getRelatedLeaders failed:', error); return []; }
    return (data || []) as SupabaseLeader[];
  },

  async createLeader(leader: Omit<SupabaseLeader, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseLeader> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').insert([leader]).select().single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  async updateLeader(id: string, updates: Partial<SupabaseLeader>): Promise<SupabaseLeader> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { data, error } = await sb.from('leaders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as SupabaseLeader;
  },

  async deleteLeader(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { error } = await sb.from('leaders').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async bulkDelete(ids: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const sb = getSupabase();
    const { error } = await sb.from('leaders').delete().in('id', ids);
    if (error) throw error;
    return true;
  },

  async bulkImportCSV(csvText: string): Promise<{ success: boolean; importedCount: number; logs: string[]; data: SupabaseLeader[] }> {
    const logs: string[] = ['[INIT] Parsing CSV text...'];
    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const imported: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const row: any = {};
        headers.forEach((h, idx) => row[h] = cols[idx] || '');
        if (row.name) {
          const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          imported.push({ slug, name: row.name, designation: row.designation || 'Leader', category: row.category || 'Cabinet Minister', state: row.state || 'Delhi', constituency: row.constituency || 'General', party: row.party || 'Independent', gender: row.gender || 'Male', bio: row.bio || `Profile of ${row.name}`, education: row.education || 'Graduate', profession: row.profession || 'Public Service', featured: row.featured === 'true' || row.featured === '1', status: 'Published' });
        }
      }
      if (isSupabaseConfigured) {
        const sb = getSupabase();
        const { data, error } = await sb.from('leaders').insert(imported).select();
        if (!error && data) return { success: true, importedCount: data.length, logs, data: data as SupabaseLeader[] };
        logs.push(`[WARN] Supabase bulk import failed: ${error?.message || 'Unknown error'}`);
      }
      // fallback: save to local storage
      const leaders = getLocalLeaders();
      const withIds = imported.map((l, i) => ({ ...l, id: `leader-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
      const updatedList = [...withIds, ...leaders];
      saveLocalLeaders(updatedList as SupabaseLeader[]);
      return { success: true, importedCount: withIds.length, logs: [...logs, `[SUCCESS] Imported ${withIds.length} leaders to Local Storage`], data: withIds };
    } catch (err: any) {
      return { success: false, importedCount: 0, logs: [...logs, `[ERROR] ${err.message || String(err)}`], data: [] };
    }
  },

  async triggerSync(leaderId?: string): Promise<{ success: boolean; processed: number; logs: string[] }> {
    const logs: string[] = ['[START] Starting image processing pipeline...'];
    let processed = 0;
    try {
      let targetLeaders: SupabaseLeader[] = [];
      if (leaderId) {
        const single = await this.getLeaderBySlug(leaderId);
        if (single) targetLeaders = [single];
      } else {
        targetLeaders = await this.getLeaders();
      }
      for (const leader of targetLeaders) {
        let updated = false;
        const updates: Partial<SupabaseLeader> = {};
        if (isPlaceholderCover(leader.cover_image)) { updates.cover_image = getCoverForLeader(leader.category, leader.state); updated = true; }
        if (isPlaceholderImage(leader.image)) { const wikiUrl = await searchWikipediaPortrait(leader.name); if (wikiUrl) { updates.image = wikiUrl; updated = true; } }
        if (updated) { await this.updateLeader(leader.id, updates); processed++; }
      }
      logs.push(`[SUCCESS] Image synchronization complete. Processed ${processed}`);
      return { success: true, processed, logs };
    } catch (err: any) { logs.push(`[ERROR] ${String(err)}`); return { success: false, processed, logs }; }
  },

  async scanMissingImages(): Promise<{ success: boolean; scanned: number; added: number; failed: number; results: any[] }> {
    let scanned = 0, added = 0, failed = 0; const results: any[] = [];
    try {
      const allLeaders = await this.getLeaders(); scanned = allLeaders.length;
      for (const leader of allLeaders) {
        if (isPlaceholderImage(leader.image)) {
          const wikiUrl = await searchWikipediaPortrait(leader.name);
          if (wikiUrl) { await this.updateLeader(leader.id, { image: wikiUrl }); added++; results.push({ name: leader.name, status: 'Success', url: wikiUrl }); }
          else { failed++; results.push({ name: leader.name, status: 'Not Found' }); }
        }
      }
      return { success: true, scanned, added, failed, results };
    } catch (err) { return { success: false, scanned, added, failed, results }; }
  },

  async generateMissingCovers(): Promise<{ success: boolean; scanned: number; generated: number }> {
    let scanned = 0, generated = 0;
    try {
      const allLeaders = await this.getLeaders(); scanned = allLeaders.length;
      for (const leader of allLeaders) {
        if (isPlaceholderCover(leader.cover_image)) { const resolved = getCoverForLeader(leader.category, leader.state); await this.updateLeader(leader.id, { cover_image: resolved }); generated++; }
      }
      return { success: true, scanned, generated };
    } catch (err) { return { success: false, scanned, generated };
    }
  },

  async getSystemLogs(): Promise<{ success: boolean; logs: any[] }> {
    const defaultLogs = [ { id: 1, type: 'INFO', message: 'System initialized', created_at: new Date().toISOString() } ];
    return { success: true, logs: defaultLogs };
  },

  async addSystemLog(type: string, message: string, details?: string) {
    const entry = { id: Date.now(), type, message, details, created_at: new Date().toISOString() };
    return { success: true, log: entry };
  },

  async triggerGitHubCommit(summary?: string) { return { success: true, commitSha: 'mocksha', branch: 'main', message: summary || 'Auto commit' }; },
  async triggerVercelDeploy() { return { success: true, deployId: 'dep_mock', url: 'https://riva-directory-gov.vercel.app', status: 'queued' }; },

  async submitContact(contact: { name: string; email: string; subject: string; message: string; category?: string }) {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      const { data, error } = await sb.from('contacts').insert([contact]);
      if (!error) return { success: true, message: 'Your request has been queued.' };
      console.warn('Supabase submitContact failed:', error);
    }
    if (hasWindow()) {
      try {
        const stored = window.localStorage.getItem('know_your_minister_contacts') || '[]';
        const messages = JSON.parse(stored);
        messages.unshift({ id: `contact-${Date.now()}`, ...contact, created_at: new Date().toISOString() });
        window.localStorage.setItem('know_your_minister_contacts', JSON.stringify(messages));
      } catch (e) { /* ignore */ }
    }
    return { success: true, message: 'Saved locally.' };
  }
};
