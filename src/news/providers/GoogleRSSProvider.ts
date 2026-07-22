import { NewsItem, NewsProvider } from '../types';

export class GoogleRSSProvider implements NewsProvider {
  name = 'Google News RSS';

  async fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: { constituency?: string; party?: string; portfolio?: string }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]> {
    try {
      const query = encodeURIComponent(`${leaderName} ${options?.portfolio || ''}`.trim());
      // Google News RSS feed url
      const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
      
      // Since frontend cannot fetch RSS due to CORS, if we are in an Edge Function or Node, we can fetch directly.
      // For Vercel-compatible client/edge execution, we can use a free RSS-to-JSON proxy or fetch directly when executed in standard environments.
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Google RSS returned status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.status !== 'ok' || !data.items) {
        return [];
      }

      return data.items.map((item: any) => ({
        leader_slug: leaderSlug,
        title: item.title || '',
        summary: item.description || item.content || '',
        content: item.content || item.description || '',
        source: item.author || 'Google News RSS',
        source_url: item.link || '',
        image_url: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500',
        category: 'Politics',
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[GoogleRSSProvider] fetch failed:', err.message);
      throw err;
    }
  }
}
