import { NewsItem, NewsProvider } from '../types';

export class MediastackProvider implements NewsProvider {
  name = 'Mediastack';

  async fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: { constituency?: string; party?: string; portfolio?: string }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]> {
    try {
      const apiKey = (import.meta as any).env?.VITE_MEDIASTACK_API_KEY || '';
      if (!apiKey) {
        throw new Error('Mediastack API key is not configured');
      }

      const query = encodeURIComponent(leaderName);
      const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&keywords=${query}&languages=en&countries=in&limit=10`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Mediastack returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.data) {
        return [];
      }

      return data.data.map((article: any) => ({
        leader_slug: leaderSlug,
        title: article.title || '',
        summary: article.description || '',
        content: article.description || '',
        source: article.source || 'Mediastack',
        source_url: article.url || '',
        image_url: article.image || '',
        category: article.category || 'Politics',
        published_at: article.published_at || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[MediastackProvider] fetch failed:', err.message);
      throw err;
    }
  }
}
