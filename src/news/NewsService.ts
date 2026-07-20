import { GoogleRSSProvider } from './providers/GoogleRSSProvider';
import { PIBRSSProvider } from './providers/PIBRSSProvider';
import { GovPressProvider } from './providers/GovPressProvider';
import { GNewsProvider } from './providers/GNewsProvider';
import { NewsAPIProvider } from './providers/NewsAPIProvider';
import { MediastackProvider } from './providers/MediastackProvider';
import { newsRepository } from './NewsRepository';
import { NewsItem, NewsProvider } from './types';
import { SupabaseLeader } from '../types';

export class NewsService {
  private providers: NewsProvider[] = [];

  constructor() {
    // Register news providers in order of fallback preference
    this.providers = [
      new GoogleRSSProvider(),
      new PIBRSSProvider(),
      new GovPressProvider(),
      new GNewsProvider(),
      new NewsAPIProvider(),
      new MediastackProvider(),
    ];
  }

  /**
   * Fetch and synchronize news for a political leader.
   * Leverages the sequential provider fallback strategy (switching if a provider fails).
   */
  async syncLeaderNews(leader: SupabaseLeader): Promise<{ success: boolean; count: number; providerUsed: string; logs: string[] }> {
    const logs: string[] = [`[INIT] Starting news synchronization for ${leader.name}`];
    let fetchedArticles: Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[] = [];
    let providerUsed = 'None';

    // Options for matching and querying
    const options = {
      constituency: leader.constituency,
      party: leader.party,
      portfolio: leader.designation,
    };

    // Try providers sequentially
    for (const provider of this.providers) {
      try {
        logs.push(`[TRY] Attempting to fetch news using: ${provider.name}`);
        const articles = await provider.fetchLeaderNews(leader.name, leader.slug, options);
        
        if (articles && articles.length > 0) {
          fetchedArticles = articles;
          providerUsed = provider.name;
          logs.push(`[SUCCESS] Retrieved ${articles.length} news items from ${provider.name}`);
          break; // Successfully fetched, stop fallback chain
        } else {
          logs.push(`[WARN] ${provider.name} returned 0 articles`);
        }
      } catch (err: any) {
        logs.push(`[ERROR] ${provider.name} failed: ${err.message || err}`);
        logs.push(`[FALLBACK] Switching to next provider in chain...`);
      }
    }

    if (fetchedArticles.length === 0) {
      logs.push(`[FAIL] All news providers exhausted or returned no content for ${leader.name}`);
      return { success: false, count: 0, providerUsed: 'None', logs };
    }

    // Match and filter news items carefully
    // We automatically match news with leaders using: Name, Aliases, Constituency, Party, Portfolio
    const nameKeywords = leader.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const partyKeywords = leader.party ? leader.party.toLowerCase().split(/\s+/).filter(w => w.length > 2) : [];
    const constituencyKeywords = leader.constituency ? leader.constituency.toLowerCase().split(/\s+/).filter(w => w.length > 2) : [];
    const portfolioKeywords = leader.designation ? leader.designation.toLowerCase().split(/\s+/).filter(w => w.length > 2) : [];

    logs.push(`[MATCH] Filtering articles for relevance using matching constraints...`);

    const matchedArticles = fetchedArticles.filter(art => {
      const fullText = `${art.title} ${art.summary} ${art.content}`.toLowerCase();
      
      // Simple relevance score: Must contain the leader's main name parts
      const hasName = nameKeywords.every(word => fullText.includes(word));
      if (hasName) return true;

      // Or must contain at least 2 key terms (Name part + Party or Constituency or Designation)
      const matchesNamePart = nameKeywords.some(word => fullText.includes(word));
      if (matchesNamePart) {
        const matchesParty = partyKeywords.some(w => fullText.includes(w));
        const matchesConstituency = constituencyKeywords.some(w => fullText.includes(w));
        const matchesPortfolio = portfolioKeywords.some(w => fullText.includes(w));
        if (matchesParty || matchesConstituency || matchesPortfolio) {
          return true;
        }
      }

      return false;
    });

    logs.push(`[MATCH] Out of ${fetchedArticles.length} fetched, ${matchedArticles.length} matched criteria for ${leader.name}`);

    if (matchedArticles.length === 0) {
      return { success: true, count: 0, providerUsed, logs };
    }

    // Map and sanitize before batch inserting
    const normalizedItems = matchedArticles.map(art => ({
      leader_slug: leader.slug,
      title: art.title,
      summary: art.summary,
      content: art.content || art.summary,
      source: art.source,
      source_url: art.source_url,
      image_url: art.image_url || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500',
      category: art.category || 'Politics',
      published_at: art.published_at || new Date().toISOString(),
      is_pinned: false,
      is_featured: false,
      status: 'Approved' as const, // Automatically approve synced news, but editable by admin
    }));

    const saved = await newsRepository.bulkSyncNews(normalizedItems);
    logs.push(`[SAVED] Successfully saved/deduplicated ${saved.length} news articles into Supabase/Local Storage`);

    return {
      success: true,
      count: saved.length,
      providerUsed,
      logs
    };
  }
}

export const newsService = new NewsService();
