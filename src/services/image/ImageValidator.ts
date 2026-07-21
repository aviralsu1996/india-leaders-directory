import {
  classifyImageUrl,
  getDirectImageUrl,
  hashString,
  isMissingImage,
  isPlaceholderImage,
  isUnsplashImage,
} from '../../lib/imageUtils';
import type { ImageValidationResult } from '../../types';

const VALIDATION_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

export class ImageValidator {
  private cache = new Map<string, ImageValidationResult>();

  async validate(url?: string | null, retries = MAX_RETRIES): Promise<ImageValidationResult> {
    const direct = getDirectImageUrl(url);
    const classification = classifyImageUrl(direct);

    if (classification !== 'valid') {
      return {
        url: direct,
        status: classification,
        isAccessible: false,
      };
    }

    const cached = this.cache.get(direct);
    if (cached) return cached;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.probeUrl(direct);
        this.cache.set(direct, result);
        return result;
      } catch {
        if (attempt < retries) {
          await this.delay(500 * (attempt + 1));
        }
      }
    }

    const broken: ImageValidationResult = {
      url: direct,
      status: 'broken',
      isAccessible: false,
    };
    this.cache.set(direct, broken);
    return broken;
  }

  async validateBatch(
    urls: (string | null | undefined)[],
    concurrency = 5
  ): Promise<ImageValidationResult[]> {
    const unique = [...new Set(urls.filter(Boolean) as string[])];
    const results: ImageValidationResult[] = [];
    for (let i = 0; i < unique.length; i += concurrency) {
      const batch = unique.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((u) => this.validate(u)));
      results.push(...batchResults);
    }
    return results;
  }

  isMissing(url?: string | null): boolean {
    return isMissingImage(url);
  }

  isPlaceholder(url?: string | null): boolean {
    return isPlaceholderImage(url);
  }

  isUnsplash(url?: string | null): boolean {
    return isUnsplashImage(url);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async probeUrl(url: string): Promise<ImageValidationResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      });

      const contentType = response.headers?.get?.('content-type') || undefined;
      const hash = await hashString(url);

      if (response.type === 'opaque') {
        return { url, status: 'valid', isAccessible: true, contentType, hash };
      }

      if (!response.ok) {
        return { url, status: 'broken', isAccessible: false, hash };
      }

      return { url, status: 'valid', isAccessible: true, contentType, hash };
    } catch {
      return this.validateViaImageElement(url);
    } finally {
      clearTimeout(timer);
    }
  }

  private validateViaImageElement(url: string): Promise<ImageValidationResult> {
    return new Promise((resolve) => {
      if (typeof Image === 'undefined') {
        resolve({ url, status: 'valid', isAccessible: true });
        return;
      }
      const img = new Image();
      const timer = setTimeout(() => {
        resolve({ url, status: 'broken', isAccessible: false });
      }, VALIDATION_TIMEOUT_MS);

      img.onload = async () => {
        clearTimeout(timer);
        const hash = await hashString(url);
        resolve({ url, status: 'valid', isAccessible: true, hash });
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve({ url, status: 'broken', isAccessible: false });
      };
      img.referrerPolicy = 'no-referrer';
      img.src = url;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export const imageValidator = new ImageValidator();
