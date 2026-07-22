/**
 * Unified official-source provider chain — the single implementation of
 * "where do we get verified leader data from" used by both:
 *   - ImageSourcingService (Phase 5 — image-only lookups)
 *   - LeaderDataImportService (Phase 2 of this automation platform — full record)
 *
 * Priority order (per project policy — never Unsplash, never AI-generated faces):
 *   1. Lok Sabha official website
 *   2. Rajya Sabha official website
 *   3. PMO (Prime Minister only)
 *   4. Cabinet Secretariat (Cabinet Ministers only)
 *   5. Ministry websites
 *   6. State Government websites
 *   7. Election Commission
 *   8. Wikipedia Commons (fallback only)
 *
 * Honesty note: sansad.in, rajyasabha.nic.in, pmindia.gov.in, cabsec.gov.in and
 * eci.gov.in do not expose a public "look up member by name" API, and this
 * project has no verified member-ID mapping to construct direct profile URLs.
 * Those five providers are implemented defensively (return null) rather than
 * guessing a URL that might resolve to the wrong person — treat them as
 * best-effort stubs until validated against the live sites from an environment
 * with network access. Ministry/State Government (generic og:image + meta/
 * JSON-LD scraper) and Wikipedia Commons are fully working today.
 */
import type { ProviderScrapeResult, SupabaseLeader } from '../../types';

const FETCH_TIMEOUT_MS = 8000;

export async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
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

export function cleanName(name: string): string {
  return name
    .replace(/^(Shri|Smt|Dr|Mr|Mrs|Ms|Prof|Maulana)\.?\s+/i, '')
    .replace(/\s*,?\s*(MP|MLA|Cabinet Minister|Governor|Chief Minister|MoS)$/i, '')
    .trim();
}

/** Pulls an og:image (or twitter:image) meta tag out of an HTML page, if present. */
export function extractOgImage(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1];
  const twitter = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitter?.[1]) return twitter[1];
  return null;
}

/** Pulls a meta description (commonly used as a short bio on gov CMS pages), if present. */
export function extractMetaDescription(html: string): string | null {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() || null;
}

/** Pulls the first mailto: link out of an HTML page, if present. */
export function extractEmail(html: string): string | null {
  const match = html.match(/mailto:([^"'\s?]+)/i);
  return match?.[1] || null;
}

/** Pulls schema.org Person JSON-LD (sameAs social links, jobTitle) out of an HTML page, if present. */
export function extractJsonLdPerson(html: string): {
  jobTitle?: string;
  sameAs?: string[];
} | null {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const json = JSON.parse(match[1]);
      const candidates = Array.isArray(json) ? json : [json];
      for (const candidate of candidates) {
        if (candidate?.['@type'] === 'Person') {
          return {
            jobTitle: typeof candidate.jobTitle === 'string' ? candidate.jobTitle : undefined,
            sameAs: Array.isArray(candidate.sameAs) ? candidate.sameAs.filter((s: unknown) => typeof s === 'string') : undefined,
          };
        }
      }
    } catch {
      // Malformed JSON-LD on the page — skip it, don't fail the whole scrape.
    }
  }
  return null;
}

function socialLinksFromSameAs(sameAs?: string[]): Partial<ProviderScrapeResult> {
  if (!sameAs) return {};
  const links: Partial<ProviderScrapeResult> = {};
  for (const url of sameAs) {
    const lower = url.toLowerCase();
    if (/twitter\.com|x\.com/.test(lower)) links.twitter = url;
    else if (lower.includes('facebook.com')) links.facebook = url;
    else if (lower.includes('instagram.com')) links.instagram = url;
    else if (lower.includes('youtube.com')) links.youtube = url;
  }
  return links;
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
  // No verified static PMO data is hardcoded here (that would risk shipping
  // unverifiable content); Wikipedia Commons reliably covers the PM as fallback.
  return null;
}

/** 4. Cabinet Secretariat — applicable to Cabinet Ministers only. */
async function cabinetSecretariatProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  if (leader.category !== 'Cabinet Minister') return null;
  // TODO: cabsec.gov.in has no public per-minister lookup API this project can
  // target without live inspection. Defers to Ministry/State/Wikipedia below.
  return null;
}

/**
 * 5 & 6. Ministry / State Government official websites.
 * Generic best-effort: if the leader record already has an official
 * government URL on file (official_profile_url or website), fetch that page
 * and extract whatever structured data is present — Open Graph/Twitter image,
 * meta description (bio), JSON-LD Person (jobTitle, sameAs social links), and
 * a mailto: email. Only accepts .gov.in / .nic.in domains so we never pull
 * data from an unrelated or unofficial site.
 */
async function officialWebsiteProvider(
  leader: SupabaseLeader,
  sourceLabel: 'Ministry Website' | 'State Government Website' | 'Election Commission'
): Promise<ProviderScrapeResult | null> {
  const candidateUrl = leader.official_profile_url || leader.website;
  if (!candidateUrl) return null;
  if (!/\.(gov\.in|nic\.in)(\/|$)/i.test(candidateUrl)) return null;

  const res = await fetchWithTimeout(candidateUrl);
  if (!res || !res.ok) return null;

  const html = await res.text().catch(() => '');
  const image = extractOgImage(html);
  const bio = extractMetaDescription(html);
  const email = extractEmail(html);
  const jsonLd = extractJsonLdPerson(html);
  const socials = socialLinksFromSameAs(jsonLd?.sameAs);

  if (!image && !bio && !email && !jsonLd) return null;

  return {
    officialImage: image,
    officialProfileUrl: candidateUrl,
    wikipediaUrl: null,
    officialWebsite: candidateUrl,
    verificationStatus: 'partial',
    source: sourceLabel,
    bio: bio || undefined,
    email: email || undefined,
    designation: jsonLd?.jobTitle,
    ...socials,
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
 * 7. Election Commission. Best-effort: eci.gov.in publishes candidate affidavit
 * data around elections but has no stable per-person lookup API this project
 * can target without live inspection, so this only ever uses the same generic
 * official-website extraction as Ministry/State, and only if the leader's own
 * on-file official URL happens to point at eci.gov.in.
 */
async function electionCommissionProvider(leader: SupabaseLeader): Promise<ProviderScrapeResult | null> {
  const url = leader.official_profile_url || leader.website || '';
  if (!/eci\.gov\.in/i.test(url)) return null;
  return officialWebsiteProvider(leader, 'Election Commission');
}

/**
 * 8. Wikipedia Commons — the working fallback. Hardened with a disambiguation
 * guard: the page's extract must mention a political role before we accept
 * its data, to reduce the risk of matching a namesake.
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
    const extract = String(page?.extract || '');
    const extractLower = extract.toLowerCase();
    const isLikelyMatch = POLITICAL_KEYWORDS.some((kw) => extractLower.includes(kw));
    if (!isLikelyMatch) continue; // avoid namesake mismatches
    if (!thumb && !extract) continue;

    return {
      officialImage: thumb || null,
      officialProfileUrl: `https://en.wikipedia.org/wiki/${title}`,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${title}`,
      officialWebsite: null,
      verificationStatus: 'partial',
      source: 'Wikipedia Commons',
      bio: extract ? extract.slice(0, 2000) : undefined,
    };
  }
  return null;
}

/** The full 8-source chain, in priority order. */
export const LEADER_PROVIDER_CHAIN: Array<(leader: SupabaseLeader) => Promise<ProviderScrapeResult | null>> = [
  lokSabhaProvider,
  rajyaSabhaProvider,
  pmoProvider,
  cabinetSecretariatProvider,
  ministryProvider,
  stateGovtProvider,
  electionCommissionProvider,
  wikipediaCommonsProvider,
];
