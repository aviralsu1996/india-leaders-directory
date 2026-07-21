import type { SyncQueueItem } from './types';

export class RetryQueue {
  private queue: SyncQueueItem[] = [];
  private processing = false;

  enqueue(item: Omit<SyncQueueItem, 'status' | 'attempts'>): SyncQueueItem {
    const entry: SyncQueueItem = {
      ...item,
      status: 'queued',
      attempts: 0,
      max_attempts: item.max_attempts ?? 3,
      scheduled_at: item.scheduled_at ?? new Date().toISOString(),
    };
    this.queue.push(entry);
    this.queue.sort((a, b) => a.priority - b.priority);
    return entry;
  }

  enqueueBatch(items: Omit<SyncQueueItem, 'status' | 'attempts'>[]): SyncQueueItem[] {
    return items.map((item) => this.enqueue(item));
  }

  peek(): SyncQueueItem | undefined {
    return this.queue.find((i) => i.status === 'queued');
  }

  dequeue(): SyncQueueItem | undefined {
    const idx = this.queue.findIndex((i) => i.status === 'queued');
    if (idx === -1) return undefined;
    const item = this.queue[idx];
    item.status = 'processing';
    item.attempts += 1;
    return item;
  }

  complete(id: string): void {
    const item = this.queue.find((i) => i.id === id || i.leader_slug === id);
    if (item) item.status = 'completed';
  }

  fail(id: string, error: string): void {
    const item = this.queue.find((i) => i.id === id || i.leader_slug === id);
    if (!item) return;
    item.last_error = error;
    if (item.attempts >= item.max_attempts) {
      item.status = 'failed';
    } else {
      item.status = 'queued';
      item.scheduled_at = new Date(Date.now() + item.attempts * 60_000).toISOString();
    }
  }

  getFailed(): SyncQueueItem[] {
    return this.queue.filter((i) => i.status === 'failed');
  }

  getQueued(): SyncQueueItem[] {
    return this.queue.filter((i) => i.status === 'queued');
  }

  getAll(): SyncQueueItem[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.processing = false;
  }

  isProcessing(): boolean {
    return this.processing;
  }

  setProcessing(value: boolean): void {
    this.processing = value;
  }

  size(): number {
    return this.queue.length;
  }
}

export const retryQueue = new RetryQueue();
