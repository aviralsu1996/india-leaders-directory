export interface NewsItem {
  id: string;
  leader_slug: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  source_url: string;
  image_url: string;
  category: string;
  published_at: string;
  is_pinned: boolean;
  is_featured: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
  updated_at?: string;
}

export interface NewsProvider {
  name: string;
  fetchLeaderNews(
    leaderName: string,
    leaderSlug: string,
    options?: {
      constituency?: string;
      party?: string;
      portfolio?: string;
    }
  ): Promise<Omit<NewsItem, 'id' | 'is_pinned' | 'is_featured' | 'status'>[]>;
}
