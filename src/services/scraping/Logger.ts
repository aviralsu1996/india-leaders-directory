import type { PipelineLogEntry } from './types';

const MAX_LOGS = 500;

export class PipelineLogger {
  private logs: PipelineLogEntry[] = [];
  private listeners: ((entry: PipelineLogEntry) => void)[] = [];

  info(provider: string, leaderSlug: string, message: string, details?: Record<string, unknown>): void {
    this.add('info', provider, leaderSlug, message, details);
  }

  warn(provider: string, leaderSlug: string, message: string, details?: Record<string, unknown>): void {
    this.add('warn', provider, leaderSlug, message, details);
  }

  error(provider: string, leaderSlug: string, message: string, details?: Record<string, unknown>): void {
    this.add('error', provider, leaderSlug, message, details);
  }

  debug(provider: string, leaderSlug: string, message: string, details?: Record<string, unknown>): void {
    this.add('debug', provider, leaderSlug, message, details);
  }

  getLogs(filter?: { provider?: string; level?: PipelineLogEntry['level'] }): PipelineLogEntry[] {
    return this.logs.filter((l) => {
      if (filter?.provider && l.provider !== filter.provider) return false;
      if (filter?.level && l.level !== filter.level) return false;
      return true;
    });
  }

  subscribe(listener: (entry: PipelineLogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  clear(): void {
    this.logs = [];
  }

  private add(
    level: PipelineLogEntry['level'],
    provider: string,
    leaderSlug: string,
    message: string,
    details?: Record<string, unknown>
  ): void {
    const entry: PipelineLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      provider,
      leaderSlug,
      message,
      details,
    };
    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) this.logs.pop();
    this.listeners.forEach((l) => l(entry));
  }
}

export const pipelineLogger = new PipelineLogger();
