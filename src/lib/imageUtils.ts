/**
 * Consolidated image utilities — single source of truth.
 * Replaces duplicate getDirectImageUrl / isPlaceholderImage definitions.
 */

const PLACEHOLDER_PATTERNS = [
  'placeholder',
  'avatar',
  'unsplash.com',
  'via.placeholder',
  'dummyimage',
  'placehold.co',
  'picsum.photos',
  'gravatar.com/avatar',
  'ui-avatars.com',
];

const KNOWN_PLACEHOLDER_HASHES = [
  'unsplash.com/photo-1541872703-74c5e44368f9',
  'unsplash.com/photo-1540910419892-4a36d2c3266c',
  'unsplash.com/photo-1532375810709-75b1da00537c',
  'unsplash.com/photo-1566847438217-76e82d383f84',
];

export function getDirectImageUrl(url?: string | null): string {
  return url?.trim() || '';
}

export function isMissingImage(url?: string | null): boolean {
  return !url || url.trim() === '';
}

export function isUnsplashImage(url?: string | null): boolean {
  if (!url) return false;
  return url.toLowerCase().includes('unsplash.com');
}

export function isPlaceholderImage(url?: string | null): boolean {
  if (isMissingImage(url)) return true;
  const lower = String(url).toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

export function isPlaceholderCover(url?: string | null): boolean {
  if (isMissingImage(url)) return true;
  const lower = String(url).toLowerCase();
  if (PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))) return true;
  return KNOWN_PLACEHOLDER_HASHES.some((h) => lower.includes(h));
}

export function classifyImageUrl(url?: string | null): 'missing' | 'placeholder' | 'unsplash' | 'valid' {
  if (isMissingImage(url)) return 'missing';
  if (isUnsplashImage(url)) return 'unsplash';
  if (isPlaceholderImage(url)) return 'placeholder';
  return 'valid';
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

/** Simple string hash for image deduplication (browser-safe) */
export async function hashString(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export const STORAGE_PATHS = {
  profile: 'profile',
  covers: 'covers',
  gallery: 'gallery',
  legacyImages: 'images',
} as const;

export const STORAGE_BUCKET = 'leaders';
