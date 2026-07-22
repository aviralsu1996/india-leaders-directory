import { NewsItem, NewsProvider } from '../types';

export class PIBRSSProvider implements NewsProvider {
  name = 'PIB RSS (Government)';

  async fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: { constituency?: string; party?: string; portfolio?: string }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]> {
    try {
      const query = encodeURIComponent(`${leaderName} ${options?.portfolio || ''}`.trim());
      // PIB RSS Feed URL or fallback PIB query RSS feed via search
      const rssUrl = `https://pib.gov.in/RssMain.aspx?query=${query}`;
      
      // Use rss2json to bypass browser CORS
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`PIB RSS returned status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.status !== 'ok' || !data.items) {
        // Fallback: If query-specific PIB RSS is empty, fetch general PIB feed and filter on client
        const generalRssUrl = 'https://pib.gov.in/RssMain.aspx';
        const fallbackUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(generalRssUrl)}`;
        const fbRes = await fetch(fallbackUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.status === 'ok' && fbData.items) {
            data.items = fbData.items.filter((item: any) => 
              (item.title || '').toLowerCase().includes(leaderName.toLowerCase()) ||
              (item.description || '').toLowerCase().includes(leaderName.toLowerCase())
            );
          }
        }
      }

      const items = data.items || [];

      return items.map((item: any) => ({
        leader_slug: leaderSlug,
        title: item.title || '',
        summary: item.description || item.content || 'Official PIB Cabinet press release detailing executive departments and policy notifications.',
        content: item.content || item.description || 'Full statement released by the Press Information Bureau under the Ministry of Information and Broadcasting.',
        source: 'Press Information Bureau (PIB)',
        source_url: item.link || 'https://pib.gov.in',
        image_url: item.thumbnail || item.enclosure?.link || '',
        category: 'Press Release',
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error('[PIBRSSProvider] fetch failed:', err.message);
      throw err;
    }
  }
}
