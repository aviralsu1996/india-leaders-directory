/**
 * ImageSourcingService — safe, priority-ordered pipeline for finding a verified
 * profile photo for a leader who is currently missing one.
 *
 * Priority order (per project policy — never Unsplash, never AI-generated faces):
 *   1. Lok Sabha official website
 *   2. Rajya Sabha official website
 *   3. PMO (Prime Minister only)
 *   4. Ministry website
 *   5. State Government website
 *   6. Wikipedia Commons
 *
 * This module only ever *finds candidates* — it never writes to the database.
 * Callers (admin UI actions) decide whether/when to apply a candidate via
 * `applyImageCandidate`, which re-checks the leader is still missing an image
 * at write time so a candidate found from a stale scan can't clobber an image
 * an admin added in the meantime.
 *
 * Honesty note on the government-site providers: sansad.in / rajyasabha.nic.in
 * do not expose a public "look up official photo by name" API, and this
 * project has no verified member-ID mapping to construct direct photo URLs.
 * Those providers are implemented defensively (timeout + try/catch, degrade
 * to null) against the documented page patterns; treat them as best-effort
 * until validated against the live sites from an environment with network
 * access. The Wikipedia Commons provider is the one fully working today.
 */
import { dbService } from '../../lib/supabaseClient';
import { isPlaceholderImage } from '../../lib/imageUtils';
import type { ProviderScrapeResult, SupabaseLeader } from '../../types';

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cleanName(name: string): string {
  return name
    .replace(/^(Shri|Smt|Dr|Mr|Mrs|Ms|Prof|Maulana)\.?\s+/i, '')
    .replace(/\s*,?\s*(MP|MLA|Cabinet Minister|Governor|Chief Minister|MoS)$/i, '')
    .trim();
}

/** Pulls an og:image (or twitter:image) meta tag out of an HTML page, if present. */
function extractOgImage(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1];
  const twitter = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitter?.[1]) return twitter[1];
  return null;
}

/**
 * 1. Lok Sabha official website.
 * Best-effort: sansad.in does not publish a public name-search API and this
 * project has no verified parliament_member_id mapping to build a direct
 * profile URL, so this currently always defers (returns null) rather than
 * guessing a URL that might resolve to the wrong MP.
 */
async function lokSabhaProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  if (leader.category !== 'Lok Sabha MP' && leader.category !== 'Prime Minister') return null;
  // TODO: wire up once a verified sansad.in member-ID mapping exists for this dataset.
  return null;
}

/** 2. Rajya Sabha official website — same constraint as Lok Sabha above. */
async function rajyaSabhaProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  if (leader.category !== 'Rajya Sabha MP') return null;
  // TODO: wire up once a verified rajyasabha.nic.in member-ID mapping exists.
  return null;
}

/** 3. PMO — only ever applicable to the sitting Prime Minister. */
async function pmoProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  if (leader.category !== 'Prime Minister') return null;
  // No verified static PMO portrait URL is hardcoded here (that would risk
  // shipping an unverifiable image); Wikipedia Commons reliably covers the PM.
  return null;
}

/**
 * 4 & 5. Ministry / State Government official websites.
 * Generic best-effort: if the leader record already has an official
 * government URL on file (official_profile_url or website), fetch that page
 * and look for an Open Graph / Twitter card image — a common pattern on
 * government CMS sites. Only accepts .gov.in / .nic.in domains so we never
 * pull a photo from an unrelated or unofficial site.
 */
async function officialWebsiteProvider(
  leader: SupabaseLeader,
  sourceLabel: 'Ministry Website' | 'State Government Website'
): Promise<ProviderScrapeResult | null> {
  const candidateUrl = leader.official_profile_url || leader.website;
  if (!candidateUrl) return null;
  if (!/\.(gov\.in|nic\.in)(\/|$)/i.test(candidateUrl)) return null;

  const res = await fetchWithTimeout(candidateUrl);
  if (!res || !res.ok) return null;

  const html = await res.text().catch(() => '');
  const image = extractOgImage(html);
  if (!image) return null;

  return {
    officialImage: image,
    officialProfileUrl: candidateUrl,
    wikipediaUrl: null,
    officialWebsite: candidateUrl,
    verificationStatus: 'partial',
    source: sourceLabel,
  };
}

async function ministryProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  const isMinisterial =
    leader.category === 'Cabinet Minister' ||
    leader.category === 'Minister of State' ||
    leader.category === 'Prime Minister';
  if (!isMinisterial) return null;
  return officialWebsiteProvider(leader, 'Ministry Website');
}

async function stateGovtProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  const isStateLevel =
    leader.category === 'Chief Minister' ||
    leader.category === 'Deputy Chief Minister' ||
    leader.category === 'Governor';
  if (!isStateLevel) return null;
  return officialWebsiteProvider(leader, 'State Government Website');
}

/**
 * 6. Wikipedia Commons — the working default. Hardened with a disambiguation
 * guard: the page's short description/extract must mention a political role
 * before we accept its portrait, to reduce the risk of matching a namesake.
 */
async function wikipediaCommonsProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  const title = encodeURIComponent(cleanName(leader.name));
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${title}` +
    `&prop=pageimages|extracts&exintro=1&explaintext=1&pithumbsize=500&format=json&origin=*`;

  const res = await fetchWithTimeout(url);
  if (!res || !res.ok) return null;

  const json = await res.json().catch(() => null);
  const pages = json?.query?.pages;
  if (!pages) return null;

  const POLITICAL_KEYWORDS = [
    'politician', 'member of parliament', 'lok sabha', 'rajya sabha', 'minister',
    'chief minister', 'governor', 'mla', 'mp ', 'parliament', 'cabinet',
  ];

  for (const key of Object.keys(pages)) {
    const page = pages[key];
    const thumb = page?.thumbnail?.source;
    if (!thumb) continue;

    const extract = String(page?.extract || '').toLowerCase();
    const isLikelyMatch = POLITICAL_KEYWORDS.some((kw) => extract.includes(kw));
    if (!isLikelyMatch) continue; // avoid namesake mismatches

    return {
      officialImage: thumb as string,
      officialProfileUrl: `https://en.wikipedia.org/wiki/${title}`,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${title}`,
      officialWebsite: null,
      verificationStatus: 'partial',
      source: 'Wikipedia Commons',
    };
  }
  return null;
}

const PROVIDER_CHAIN: Array<(leader: SupabaseLeader) => Promise<ProviderScrapeResult | null>> = [
  lokSabhaProvider,
  rajyaSabhaProvider,
  pmoProvider,
  ministryProvider,
  stateGovtProvider,
  wikipediaCommonsProvider,
];

export interface ImageCandidate {
  leaderId: string;
  leaderSlug: string;
  leaderName: string;
  candidateUrl: string;
  source: string;
  profileUrl: string | null;
}

export class ImageSourcingService {
  /** Try each provider in priority order; returns the first verified candidate found. */
  async findVerifiedImageCandidate(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
    for (const provider of PROVIDER_CHAIN) {
      try {
        const result = await provider(leader);
        if (result?.officialImage) return result;
      } catch {
        // A single provider failing should never abort the chain.
      }
    }
    return null;
  }

  /**
   * Scans a leader list for missing images and finds candidates, WITHOUT writing
   * anything to the database. Only leaders currently classified as missing/
   * placeholder are considered — a leader with any existing non-placeholder
   * image is never touched.
   */
  async scanForMissingImageCandidates(
    leaders: SupabaseLeader[],
    onProgress?: (current: number, total: number, found: boolean) => void
  ): Promise<ImageCandidate[]> {
    const missing = leaders.filter((l) => isPlaceholderImage(l.image));
    const candidates: ImageCandidate[] = [];

    for (let i = 0; i < missing.length; i++) {
      const leader = missing[i];
      const result = await this.findVerifiedImageCandidate(leader);
      const found = !!result?.officialImage;
      if (result?.officialImage) {
        candidates.push({
          leaderId: leader.id,
          leaderSlug: leader.slug,
          leaderName: leader.name,
          candidateUrl: result.officialImage,
          source: result.source,
          profileUrl: result.officialProfileUrl,
        });
      }
      onProgress?.(i + 1, missing.length, found);
    }
    return candidates;
  }

  /**
   * Applies a single candidate to the database. Re-checks the leader's current
   * image is still a placeholder immediately before writing, so a candidate
   * computed earlier in a scan can never overwrite an image added since.
   */
  async applyImageCandidate(candidate: ImageCandidate): Promise<{ applied: boolean; reason?: string }> {
    const current = await dbService.getLeaderBySlug(candidate.leaderSlug);
    if (!current) return { applied: false, reason: 'Leader no longer exists' };
    if (!isPlaceholderImage(current.image)) {
      return { applied: false, reason: 'Leader already has a verified image — not overwritten' };
    }

    await dbService.updateLeader(current.id, {
      image: candidate.candidateUrl,
      image_source: candidate.source,
      official_profile_url: candidate.profileUrl || current.official_profile_url,
      verified: true,
      last_verified: new Date().toISOString(),
    });

    return { applied: true };
  }
}

export const imageSourcingService = new ImageSourcingService();
