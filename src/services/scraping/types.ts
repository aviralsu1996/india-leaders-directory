import type { ProviderScrapeResult, SupabaseLeader } from '../../types';

export interface ScrapeProvider {
  readonly name: string;
  readonly priority: number;
  canHandle(leader: SupabaseLeader): boolean;
  scrape(leader: SupabaseLeader): Promise<ProviderScrapeResult>;
}

export interface SyncQueueItem {
  id?: string;
  leader_id: string;
  leader_slug: string;
  provider: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  attempts: number;
  max_attempts: number;
  last_error?: string;
  payload?: Record<string, unknown>;
  scheduled_at?: string;
}

export interface PipelineLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  provider: string;
  leaderSlug: string;
  message: string;
  details?: Record<string, unknown>;
}

export const PROVIDER_PRIORITY = {
  lok_sabha: 1,
  rajya_sabha: 2,
  pmo: 3,
  ministry: 4,
  state_gov: 5,
  wikipedia: 6,
} as const;

export type ProviderName = keyof typeof PROVIDER_PRIORITY;

export const EMPTY_SCRAPE_RESULT = (source: string): ProviderScrapeResult => ({
  officialImage: null,
  officialProfileUrl: null,
  wikipediaUrl: null,
  officialWebsite: null,
  verificationStatus: 'unverified',
  source,
});
