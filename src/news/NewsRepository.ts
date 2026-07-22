import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { NewsItem } from './types';

// Let's seed some mock news items for demonstration when Supabase is not configured
const DEFAULT_PRELOADED_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    leader_slug: 'narendra-modi',
    title: 'PM Narendra Modi chairs high-level meeting on infrastructure development',
    summary: 'The Prime Minister evaluated progress on key transport corridors and green energy corridor pipelines, urging quick completion timelines.',
    content: 'Prime Minister Narendra Modi on Wednesday chaired a high-level review meeting to assess the progress of major infrastructure projects. Over 15 national highway links, 5 major railway network expansions, and state-wide solar corridors were discussed under the Gati Shakti master plan.',
    source: 'Press Trust of India',
    source_url: 'https://example.com/news/modi-infra-meeting',
    image_url: '',
    category: 'Governance',
    published_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    is_pinned: true,
    is_featured: true,
    status: 'Approved'
  },
  {
    id: 'news-2',
    leader_slug: 'narendra-modi',
    title: 'India launches digital literacy drive across 50,000 rural panchayats',
    summary: 'The new directive launched by the cabinet seeks to introduce computer literacy hubs and high-speed fiber channels in remote villages.',
    content: 'Under the direct guidance of PM Narendra Modi, the Ministry of Electronics & IT initiated the rural digital empowerment scheme. This will create high-tech community labs in over 50,000 villages across 12 states by March 2027.',
    source: 'National News Grid',
    source_url: 'https://example.com/news/digital-panchayat',
    image_url: '',
    category: 'Development',
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_pinned: false,
    is_featured: false,
    status: 'Approved'
  }
];

export class NewsRepository {
  private getLocalNews(): NewsItem[] {
    const raw = localStorage.getItem('know_your_minister_news');
    if (!raw) {
      localStorage.setItem('know_your_minister_news', JSON.stringify(DEFAULT_PRELOADED_NEWS));
      return DEFAULT_PRELOADED_NEWS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_PRELOADED_NEWS;
    }
  }

  private saveLocalNews(news: NewsItem[]) {
    localStorage.setItem('know_your_minister_news', JSON.stringify(news));
  }

  async getLeaderNews(leaderSlug: string): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('news')
          .select('*')
          .eq('leader_slug', leaderSlug)
          .eq('status', 'Approved')
          .order('is_pinned', { ascending: false })
          .order('published_at', { ascending: false });

        if (!error && data) {
          return data as NewsItem[];
        }
        console.warn('Supabase query for news failed, falling back to local storage:', error);
      }
    }

    // Fallback: Filter local news
    return this.getLocalNews()
      .filter(item => item.leader_slug === leaderSlug && item.status === 'Approved')
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1;
        }
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }

  async getAllNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as NewsItem[];
        }
        console.warn('Supabase query for all news failed, using local fallback:', error);
      }
    }

    return this.getLocalNews().sort((a, b) => {
      return new Date(b.created_at || b.published_at).getTime() - new Date(a.created_at || a.published_at).getTime();
    });
  }

  async createNewsItem(item: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('news')
          .insert([item])
          .select()
          .single();

        if (!error && data) {
          return data as NewsItem;
        }
        console.warn('Supabase news insert failed, using local fallback:', error);
      }
    }

    const local = this.getLocalNews();
    const newItem: NewsItem = {
      ...item,
      id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    local.unshift(newItem);
    this.saveLocalNews(local);
    return newItem;
  }

  async updateNewsItem(id: string, updates: Partial<NewsItem>): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('news')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as NewsItem;
        }
        console.warn('Supabase news update failed, using local fallback:', error);
      }
    }

    const local = this.getLocalNews();
    const idx = local.findIndex(item => item.id === id);
    if (idx === -1) {
      throw new Error(`News item with ID ${id} not found`);
    }
    const updated = {
      ...local[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    local[idx] = updated;
    this.saveLocalNews(local);
    return updated;
  }

  async deleteNewsItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb
          .from('news')
          .delete()
          .eq('id', id);

        if (!error) {
          return true;
        }
        console.warn('Supabase news deletion failed, using local fallback:', error);
      }
    }

    const local = this.getLocalNews();
    const filtered = local.filter(item => item.id !== id);
    if (filtered.length === local.length) {
      return false;
    }
    this.saveLocalNews(filtered);
    return true;
  }

  async bulkSyncNews(items: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        // Upsert based on title and source_url if we want deduplication
        const { data, error } = await sb
          .from('news')
          .insert(items)
          .select();

        if (!error && data) {
          return data as NewsItem[];
        }
        console.warn('Supabase bulk news sync failed, using local fallback:', error);
      }
    }

    const local = this.getLocalNews();
    const savedItems: NewsItem[] = [];

    items.forEach(item => {
      // Basic client-side deduplication
      const exists = local.some(l => l.title === item.title || (item.source_url && l.source_url === item.source_url));
      if (!exists) {
        const newItem: NewsItem = {
          ...item,
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        local.unshift(newItem);
        savedItems.push(newItem);
      }
    });

    if (savedItems.length > 0) {
      this.saveLocalNews(local);
    }
    return savedItems;
  }
}
export const newsRepository = new NewsRepository();
