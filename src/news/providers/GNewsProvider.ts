import { NewsItem, NewsProvider } from '../types';

export class GNewsProvider implements NewsProvider {
  name = 'GNews API';

  async fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: { constituency?: string; party?: string; portfolio?: string }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]> {
    try {
      const apiKey = (import.meta as any).env?.VITE_GNEWS_API_KEY || '';
      if (!apiKey) {
        throw new Error('GNews API key is not configured');
      }

      const query = encodeURIComponent(`"${leaderName}"`);
      const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&country=in&max=10&apikey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`GNews API returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.articles) {
        return [];
      }

      return data.articles.map((article: any) => ({
        leader_slug: leaderSlug,
        title: article.title || '',
        summary: article.description || '',
        content: article.content || '',
        source: article.source?.name || 'GNews',
        source_url: article.url || '',
        image_url: article.image || '',
        category: 'Politics',
        published_at: article.publishedAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[GNewsProvider] fetch failed:', err.message);
      throw err;
    }
  }
}
