/**
 * Fallback chain for sourcing an official MLA photograph, in priority
 * order: state Legislative Assembly website -> state government website
 * -> Wikipedia Commons. Never falls back to a stock-photo service
 * (Unsplash etc.) - a provider either returns a real, attributable image
 * or null, and null just means "try the next provider" / "leave blank".
 *
 * Only opt-in (import-leaders.ts --download-images), off by default: the
 * plain pipeline just verifies whatever image path is already in the
 * state's data file, and leaves it blank if the file isn't there.
 */

export interface ImageCandidate {
  name: string;
  state: string;
  constituency?: string;
}

export interface ImageResult {
  url: string;
  source: string;
}

export interface ImageProvider {
  name: string;
  find(candidate: ImageCandidate): Promise<ImageResult | null>;
}

/**
 * Every state Legislative Assembly publishes its member directory on a
 * different site with a different URL scheme and markup, and none expose
 * a documented public lookup API - so there's no generic request to make
 * here. This is a defensive stub (matches the same pattern already used
 * for Lok Sabha/Rajya Sabha/PMO in this codebase's earlier image-sourcing
 * work): it returns no candidates rather than guessing a URL, and is the
 * extension point for a real per-assembly scraper once one is written and
 * validated against the live site.
 */
export const officialAssemblyProvider: ImageProvider = {
  name: 'Official Legislative Assembly website',
  async find(): Promise<ImageResult | null> {
    return null;
  }
};

/**
 * Same situation as the assembly provider: each state government portal
 * has its own layout, so a generic scraper can't be written without
 * inspecting each site. Defensive stub - extend per state once a real,
 * verified endpoint exists.
 */
export const stateGovernmentProvider: ImageProvider = {
  name: 'State Government website',
  async find(): Promise<ImageResult | null> {
    return null;
  }
};

/**
 * Wikipedia Commons has a single, stable, public search API, so this one
 * is a real implementation rather than a stub. It searches the File:
 * namespace for the leader's name plus their state (to disambiguate
 * common names) and returns the first hit's direct image URL. Network or
 * parsing failures are swallowed and return null - a missing/broken
 * Commons entry should never fail the rest of the import.
 */
export const wikipediaCommonsProvider: ImageProvider = {
  name: 'Wikipedia Commons',
  async find(candidate: ImageCandidate): Promise<ImageResult | null> {
    try {
      const query = encodeURIComponent(`${candidate.name} ${candidate.state}`.trim());
      const searchUrl =
        `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
        `&srsearch=${query}&srnamespace=6&srlimit=1&format=json&origin=*`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return null;

      const searchJson: any = await searchRes.json();
      const hit = searchJson?.query?.search?.[0];
      if (!hit?.title) return null;

      const infoUrl =
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(hit.title)}` +
        `&prop=imageinfo&iiprop=url&format=json&origin=*`;

      const infoRes = await fetch(infoUrl);
      if (!infoRes.ok) return null;

      const infoJson: any = await infoRes.json();
      const pages = infoJson?.query?.pages || {};
      const page: any = Object.values(pages)[0];
      const url = page?.imageinfo?.[0]?.url;

      return url ? { url, source: 'Wikipedia Commons' } : null;
    } catch {
      return null;
    }
  }
};

const DEFAULT_CHAIN: ImageProvider[] = [
  officialAssemblyProvider,
  stateGovernmentProvider,
  wikipediaCommonsProvider
];

/** Runs the fallback chain in order and returns the first hit, or null if none of them find anything. */
export async function resolveOfficialImage(
  candidate: ImageCandidate,
  providers: ImageProvider[] = DEFAULT_CHAIN
): Promise<ImageResult | null> {
  for (const provider of providers) {
    const result = await provider.find(candidate);
    if (result) return result;
  }
  return null;
}
