import type { ImageValidationResult } from '../../types';

interface CacheEntry {
  result: ImageValidationResult;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000;
const STORAGE_KEY = 'ild_image_cache_v1';

export class ImageCache {
  private memory = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
    this.hydrateFromStorage();
  }

  get(url: string): ImageValidationResult | null {
    const entry = this.memory.get(url);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memory.delete(url);
      return null;
    }
    return entry.result;
  }

  set(url: string, result: ImageValidationResult): void {
    this.memory.set(url, { result, expiresAt: Date.now() + this.ttlMs });
    this.persistToStorage();
  }

  has(url: string): boolean {
    return this.get(url) !== null;
  }

  invalidate(url: string): void {
    this.memory.delete(url);
    this.persistToStorage();
  }

  clear(): void {
    this.memory.clear();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  size(): number {
    this.evictExpired();
    return this.memory.size;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memory) {
      if (now > entry.expiresAt) this.memory.delete(key);
    }
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
      const now = Date.now();
      for (const [key, entry] of Object.entries(parsed)) {
        if (entry.expiresAt > now) this.memory.set(key, entry);
      }
    } catch {
      /* ignore corrupt cache */
    }
  }

  private persistToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      this.evictExpired();
      const obj: Record<string, CacheEntry> = {};
      this.memory.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      /* storage full */
    }
  }
}

export const imageCache = new ImageCache();
