import { NewsItem, NewsProvider } from '../types';

export class NewsAPIProvider implements NewsProvider {
  name = 'NewsAPI';

  async fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: { constituency?: string; party?: string; portfolio?: string }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]> {
    try {
      const apiKey = (import.meta as any).env?.VITE_NEWS_API_KEY || '';
      if (!apiKey) {
        throw new Error('NewsAPI key is not configured');
      }

      const query = encodeURIComponent(`"${leaderName}"`);
      const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`NewsAPI returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.status !== 'ok' || !data.articles) {
        return [];
      }

      return data.articles.map((article: any) => ({
        leader_slug: leaderSlug,
        title: article.title || '',
        summary: article.description || '',
        content: article.content || '',
        source: article.source?.name || 'NewsAPI',
        source_url: article.url || '',
        image_url: article.urlToImage || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500',
        category: 'Politics',
        published_at: article.publishedAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[NewsAPIProvider] fetch failed:', err.message);
      throw err;
    }
  }
}
