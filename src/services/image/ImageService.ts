import { dbService } from '../../lib/supabaseClient';
import {
  classifyImageUrl,
  getDirectImageUrl,
  hashString,
  isMissingImage,
  isPlaceholderImage,
  isUnsplashImage,
} from '../../lib/imageUtils';
import type { ImageValidationResult, SupabaseLeader } from '../../types';
import { imageValidator } from './ImageValidator';
import { imageCache } from './ImageCache';

export interface ImageScanResult {
  leaderId: string;
  leaderSlug: string;
  leaderName: string;
  imageUrl: string;
  classification: 'missing' | 'placeholder' | 'unsplash' | 'valid' | 'broken';
  validation?: ImageValidationResult;
}

export interface ImageScanSummary {
  scanned: number;
  missing: number;
  placeholder: number;
  unsplash: number;
  broken: number;
  valid: number;
  results: ImageScanResult[];
}

const RETRY_DELAYS_MS = [1000, 2000, 4000];

export class ImageService {
  classifyLeaderImage(leader: SupabaseLeader): ImageScanResult {
    const imageUrl = getDirectImageUrl(leader.image);
    const classification = classifyImageUrl(imageUrl);
    return {
      leaderId: leader.id,
      leaderSlug: leader.slug,
      leaderName: leader.name,
      imageUrl,
      classification,
    };
  }

  scanLeaders(leaders: SupabaseLeader[]): ImageScanSummary {
    const results = leaders.map((l) => this.classifyLeaderImage(l));
    return {
      scanned: results.length,
      missing: results.filter((r) => r.classification === 'missing').length,
      placeholder: results.filter((r) => r.classification === 'placeholder').length,
      unsplash: results.filter((r) => r.classification === 'unsplash').length,
      broken: results.filter((r) => r.classification === 'broken').length,
      valid: results.filter((r) => r.classification === 'valid').length,
      results,
    };
  }

  async scanAllLeaders(): Promise<ImageScanSummary> {
    const leaders = await dbService.getLeaders();
    return this.scanLeaders(leaders);
  }

  async validateLeaderImages(
    leaders: SupabaseLeader[],
    onProgress?: (current: number, total: number) => void
  ): Promise<ImageScanSummary> {
    const results: ImageScanResult[] = [];
    let missing = 0,
      placeholder = 0,
      unsplash = 0,
      broken = 0,
      valid = 0;

    for (let i = 0; i < leaders.length; i++) {
      const leader = leaders[i];
      const base = this.classifyLeaderImage(leader);

      if (base.classification === 'valid') {
        const cached = imageCache.get(base.imageUrl);
        const validation = cached ?? (await this.validateWithRetry(base.imageUrl));
        if (!cached) imageCache.set(base.imageUrl, validation);

        if (validation.status === 'broken') {
          broken++;
          results.push({ ...base, classification: 'broken', validation });
        } else {
          valid++;
          results.push({ ...base, validation });
        }
      } else {
        results.push(base);
        if (base.classification === 'missing') missing++;
        else if (base.classification === 'placeholder') placeholder++;
        else if (base.classification === 'unsplash') unsplash++;
      }

      onProgress?.(i + 1, leaders.length);
    }

    return { scanned: leaders.length, missing, placeholder, unsplash, broken, valid, results };
  }

  async validateWithRetry(url: string): Promise<ImageValidationResult> {
    for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
      const result = await imageValidator.validate(url, 0);
      if (result.isAccessible) return result;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[i]));
    }
    return imageValidator.validate(url, 0);
  }

  async computeImageHash(url: string): Promise<string | null> {
    if (isMissingImage(url)) return null;
    return hashString(url);
  }

  detectIssues(leader: SupabaseLeader): string[] {
    const issues: string[] = [];
    if (isMissingImage(leader.image)) issues.push('missing_image');
    else if (isUnsplashImage(leader.image)) issues.push('unsplash_image');
    else if (isPlaceholderImage(leader.image)) issues.push('placeholder_image');
    if (isMissingImage(leader.cover_image)) issues.push('missing_cover');
    else if (isUnsplashImage(leader.cover_image)) issues.push('unsplash_cover');
    return issues;
  }
}

export const imageService = new ImageService();
