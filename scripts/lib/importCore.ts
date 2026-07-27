import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadStates, getState, StateConfig } from './states';
import { resolveOfficialImage, ImageResult } from './imageProviders';
import { ImportLogger } from './logger';

// Categories accepted by the `leader_category` enum in supabase/schema.sql.
// Keep this list in sync with that enum and with src/types.ts LeaderCategory.
const allowedCategories = new Set([
  'Prime Minister',
  'Chief Minister',
  'Deputy Chief Minister',
  'Cabinet Minister',
  'Minister of State',
  'Lok Sabha MP',
  'Rajya Sabha MP',
  'Governor',
  'MLA'
]);

const categoryMap: Record<string, string> = {
  Leader: 'Chief Minister'
};

const normalizeCategory = (value: unknown): string => {
  const raw = String(value || '').trim();
  const mapped = categoryMap[raw] || raw;
  return allowedCategories.has(mapped) ? mapped : 'Lok Sabha MP';
};

const normalizeStatus = (value: unknown): string => {
  const raw = String(value || '').trim();
  return raw === 'Published' ? 'Published' : 'Draft';
};

// Collapses PDF/scrape extraction artifacts (stray newlines, repeated spaces)
// without guessing at semantic fixes (e.g. name/party word splits).
const cleanText = (value: unknown): string =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

const HONORIFIC_PREFIX = /^(shri|smt\.?|dr\.?|mr\.?|mrs\.?|km\.?)\s+/i;

const slugifyPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

const baseSlugFromName = (name: string): string =>
  slugifyPart(name.replace(HONORIFIC_PREFIX, ''));

const buildConstituency = (record: RawLeaderRecord): string =>
  [cleanText(record.constituency), cleanText(record.district)].filter(Boolean).join(', ');

export interface RawLeaderRecord {
  slug?: string;
  serial?: number;
  name?: string;
  designation?: string;
  category?: string;
  state?: string;
  constituency?: string;
  district?: string;
  party?: string;
  gender?: string;
  bio?: string;
  education?: string;
  profession?: string;
  mobile?: string;
  email?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  image?: string | null;
  cover_image?: string;
  featured?: boolean;
  status?: string;
  official_profile_url?: string;
  website?: string;
  [key: string]: unknown;
}

export interface LeaderPayload {
  slug: string;
  name: string;
  designation: string;
  category: string;
  state: string;
  constituency: string;
  party: string;
  gender: string;
  bio: string;
  education: string;
  profession: string;
  mobile: string;
  email: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  website: string;
  image: string;
  cover_image: string;
  featured: boolean;
  status: string;
}

/** One data source to import: a configured state, an explicit --file, or the legacy data-store.json default. */
export interface ImportJob {
  label: string;
  filePath: string;
  imageDir?: string;
  defaultStatus: 'Draft' | 'Published';
}

export interface ImportRunOptions {
  dryRun: boolean;
  downloadImages: boolean;
  /** Max rows per insert/update statement - each chunk commits as a single atomic transaction. */
  chunkSize?: number;
}

const DEFAULT_CHUNK_SIZE = 200;

export function stateJob(state: StateConfig): ImportJob {
  return {
    label: `${state.name} (${state.code})`,
    filePath: state.dataFile,
    imageDir: state.code,
    // Explicit requirement for the MLA pipeline: generated records default to
    // Published. The legacy/manual --file path keeps the original Draft default.
    defaultStatus: 'Published'
  };
}

export function legacyFileJob(filePath: string, imageDir?: string): ImportJob {
  return { label: filePath, filePath, imageDir, defaultStatus: 'Draft' };
}

export function legacyDefaultJob(): ImportJob {
  return { label: 'data-store.json (legacy)', filePath: 'data-store.json', defaultStatus: 'Draft' };
}

/** Resolves one configured state's job by code, exiting with a clear message if it has no data file yet. */
export async function resolveSingleStateJob(code: string, configPath: string, log: ImportLogger): Promise<ImportJob> {
  const state = await getState(code, configPath);
  if (!existsSync(state.dataFile)) {
    log.error(`No data file for ${state.name} (${state.code}) at ${state.dataFile}.`);
    log.error(`Run scripts/extract_state_mlas.py --state=${state.code} first, or check config/states.json.`);
    process.exit(1);
  }
  return stateJob(state);
}

/** Resolves every configured state that currently has a data file, skipping (and logging) the rest. */
export async function resolveAllStateJobs(configPath: string, log: ImportLogger): Promise<ImportJob[]> {
  const states = await loadStates(configPath);
  const jobs: ImportJob[] = [];
  for (const state of states) {
    if (existsSync(state.dataFile)) {
      jobs.push(stateJob(state));
    } else {
      log.info(`Skipping ${state.name} (${state.code}): no data file at ${state.dataFile} yet.`);
    }
  }
  return jobs;
}

export async function loadRecords(filePath: string): Promise<RawLeaderRecord[]> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileContents = await fs.readFile(absolutePath, 'utf-8');
  const json = JSON.parse(fileContents);

  if (Array.isArray(json)) return json;
  if (Array.isArray(json.directoryLeaders)) return json.directoryLeaders;

  throw new Error(
    `Unrecognized import file shape at ${filePath}: expected a JSON array or an object with a "directoryLeaders" array.`
  );
}

export function createSupabaseClient(dryRun: boolean, log: ImportLogger): any {
  if (dryRun) return null;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log.error('Supabase service role configuration is missing.');
    log.error('Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env,');
    log.error('or re-run with --dry-run to validate the import file(s) without a database.');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface LeaderRow {
  slug: string;
  state?: string;
  constituency?: string;
}

const isSameLeader = (existing: LeaderRow, record: RawLeaderRecord): boolean =>
  existing.state === cleanText(record.state) && existing.constituency === buildConstituency(record);

/**
 * Every slug a record might resolve to: its explicit slug if it has one, or
 * its auto-generated base name plus each disambiguator suffix
 * (constituency/district/serial). Pre-fetching all of these up front in one
 * or two bulk queries (chunked via `chunk()`) turns duplicate-detection from
 * one database round trip per record into a handful for the whole batch.
 */
function candidateSlugsFor(record: RawLeaderRecord): string[] {
  const providedSlug = cleanText(record.slug);
  if (providedSlug) return [providedSlug];

  const base = baseSlugFromName(cleanText(record.name)) || 'leader';
  const disambiguators = [record.constituency, record.district, record.serial]
    .map((v) => (v === undefined || v === null ? '' : slugifyPart(cleanText(String(v)))))
    .filter(Boolean);
  return [base, ...disambiguators.map((suffix) => `${base}-${suffix}`)];
}

async function prefetchExistingSlugs(
  allCandidates: string[],
  supabase: any,
  chunkSize: number
): Promise<Map<string, LeaderRow>> {
  const found = new Map<string, LeaderRow>();
  if (!supabase || allCandidates.length === 0) return found;

  const uniqueCandidates = Array.from(new Set(allCandidates));
  for (const batch of chunk(uniqueCandidates, chunkSize)) {
    const { data, error } = await supabase.from('leaders').select('slug, state, constituency').in('slug', batch);
    if (error) throw error;
    for (const row of data || []) found.set(row.slug, row);
  }
  return found;
}

export type SlugResolution = { slug: string; existing: LeaderRow | null } | null;

/**
 * Picks the final slug for a record from its candidates, using the
 * pre-fetched map wherever possible. A slug already owned by a *different*
 * leader (a name collision across states, e.g. two "Anil Kumar"s in
 * different states) is skipped in favour of the next, more specific
 * candidate, so importing one state can never overwrite someone else's
 * record just because they share a name. Only falls back to a live query
 * for the rare case for `-2`, `-3`, ... suffixes beyond the pre-fetched set.
 */
async function resolveSlugFromPrefetch(
  record: RawLeaderRecord,
  prefetched: Map<string, LeaderRow>,
  usedSlugsThisRun: Set<string>,
  supabase: any,
  dryRun: boolean
): Promise<SlugResolution> {
  const candidates = candidateSlugsFor(record);

  const accept = (candidate: string, existing: LeaderRow | null): SlugResolution => {
    usedSlugsThisRun.add(candidate);
    return { slug: candidate, existing };
  };

  for (const candidate of candidates) {
    if (usedSlugsThisRun.has(candidate)) continue;
    const existing = prefetched.has(candidate) ? prefetched.get(candidate)! : null;
    if (!existing || isSameLeader(existing, record)) return accept(candidate, existing);
  }

  // Every pre-fetched candidate was taken by someone else - fall back to a
  // numbered suffix, checked live since these were never pre-fetched.
  const base = baseSlugFromName(cleanText(record.name)) || 'leader';
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (usedSlugsThisRun.has(candidate)) continue;
    if (dryRun || !supabase) return accept(candidate, null);

    const { data, error } = await supabase
      .from('leaders')
      .select('slug, state, constituency')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || isSameLeader(data, record)) return accept(candidate, data);
  }

  return null;
}

interface ImageOutcome {
  path: string;
  status: 'kept' | 'external' | 'missing' | 'downloaded' | 'none';
  /** The /storage/leaders/<code>/<file> path that was checked, for the missing-image report. */
  expectedPath: string;
}

async function downloadImage(url: string, slug: string, imageDir: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('gif') ? 'gif' : 'jpg';
    const relativePath = `/storage/leaders/${imageDir}/${slug}.${ext}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);
    return relativePath;
  } catch {
    return null;
  }
}

/**
 * Resolves the image path convention (/storage/leaders/<state>/<filename>)
 * and confirms the file actually exists under public/ before it's written
 * to the database. A missing file never fails the leader's import - it's
 * just reported (see MissingImageEntry) and the field is left blank, unless
 * --download-images is set, in which case the official-image fallback chain
 * (Assembly site -> Government site -> Wikipedia Commons; never a
 * stock-photo service) gets a chance to fill it in.
 */
async function resolveImage(
  record: RawLeaderRecord,
  slug: string,
  job: ImportJob,
  options: ImportRunOptions,
  log: ImportLogger
): Promise<ImageOutcome> {
  const value = cleanText(record.image || '');
  let expectedPath = value;

  if (value) {
    if (!expectedPath.startsWith('/') && job.imageDir) {
      expectedPath = `/storage/leaders/${job.imageDir}/${expectedPath}`;
    }

    if (/^https?:\/\//i.test(expectedPath)) {
      // Externally hosted image (e.g. legacy directoryLeaders records) - trust as-is.
      return { path: expectedPath, status: 'external', expectedPath };
    }

    if (!expectedPath.startsWith('/')) {
      // Bare filename with no imageDir hint: can't place it under
      // storage/leaders/<state>/ without knowing the state folder.
      return { path: expectedPath, status: 'external', expectedPath };
    }

    const absolutePath = path.join(process.cwd(), 'public', expectedPath);
    if (existsSync(absolutePath)) {
      return { path: expectedPath, status: 'kept', expectedPath };
    }
    log.warn(`  Image missing on disk for ${record.name || slug}, skipping image field: ${expectedPath}`);
  }

  if (options.downloadImages && job.imageDir && !options.dryRun) {
    const found: ImageResult | null = await resolveOfficialImage({
      name: cleanText(record.name),
      state: cleanText(record.state),
      constituency: cleanText(record.constituency)
    });
    if (found) {
      const saved = await downloadImage(found.url, slug, job.imageDir);
      if (saved) {
        log.info(`  Downloaded image for ${record.name} from ${found.source} -> ${saved}`);
        return { path: saved, status: 'downloaded', expectedPath: saved };
      }
    }
  }

  return { path: '', status: value ? 'missing' : 'none', expectedPath };
}

function buildPayload(record: RawLeaderRecord, slug: string, job: ImportJob, imagePath: string): LeaderPayload {
  const status = cleanText(record.status) ? normalizeStatus(record.status) : job.defaultStatus;

  return {
    slug,
    name: cleanText(record.name),
    designation: cleanText(record.designation) || 'Leader',
    category: normalizeCategory(record.category ?? record.designation),
    state: cleanText(record.state),
    constituency: buildConstituency(record),
    party: cleanText(record.party),
    gender: cleanText(record.gender),
    bio: cleanText(record.bio),
    education: cleanText(record.education),
    profession: cleanText(record.profession),
    mobile: cleanText(record.mobile),
    email: cleanText(record.email),
    address: cleanText(record.address),
    facebook: cleanText(record.facebook),
    twitter: cleanText(record.twitter),
    instagram: cleanText(record.instagram),
    youtube: cleanText(record.youtube),
    website: cleanText(record.website || record.official_profile_url),
    image: imagePath,
    cover_image: cleanText(record.cover_image),
    featured: typeof record.featured === 'boolean' ? record.featured : false,
    status
  };
}

export interface RunStats {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  imagesMissing: number;
  imagesDownloaded: number;
}

export function emptyStats(): RunStats {
  return { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, imagesMissing: 0, imagesDownloaded: 0 };
}

export function mergeStats(into: RunStats, from: RunStats) {
  into.processed += from.processed;
  into.inserted += from.inserted;
  into.updated += from.updated;
  into.skipped += from.skipped;
  into.failed += from.failed;
  into.imagesMissing += from.imagesMissing;
  into.imagesDownloaded += from.imagesDownloaded;
}

export interface MissingImageEntry {
  state: string;
  name: string;
  slug: string;
  expectedPath: string;
}

/**
 * Imports one job's records. Duplicate detection is a bulk pre-fetch (a
 * handful of queries for the whole batch, not one per record); committing
 * is chunked upserts keyed by slug (DEFAULT_CHUNK_SIZE rows per statement) -
 * each chunk is a single Postgres statement, so if any row in it fails a
 * constraint, that whole chunk rolls back atomically and its records are
 * reported as failed, rather than the database ending up with a partial,
 * inconsistent slice of the batch. One bad chunk doesn't stop the rest of
 * the run from being attempted.
 */
export async function runJob(
  job: ImportJob,
  records: RawLeaderRecord[],
  options: ImportRunOptions,
  supabase: any,
  usedSlugsThisRun: Set<string>,
  log: ImportLogger,
  missingImages: MissingImageEntry[]
): Promise<RunStats> {
  const stats = emptyStats();
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  log.info(`Importing ${records.length} leader(s) from ${job.label}${options.dryRun ? ' (dry run)' : ''}...`);

  const allCandidates = records.flatMap((r) => candidateSlugsFor(r));
  const prefetched = await prefetchExistingSlugs(allCandidates, supabase, chunkSize);

  interface Resolved {
    record: RawLeaderRecord;
    slug: string;
    isUpdate: boolean;
    payload: LeaderPayload;
  }
  const resolvedRecords: Resolved[] = [];

  for (const record of records) {
    try {
      const resolved = await resolveSlugFromPrefetch(record, prefetched, usedSlugsThisRun, supabase, options.dryRun);
      if (!resolved) {
        log.warn(`  Could not find a free slug for '${record.name}', skipping.`);
        stats.skipped += 1;
        continue;
      }

      const { slug, existing } = resolved;
      const imageOutcome = await resolveImage(record, slug, job, options, log);
      const payload = buildPayload(record, slug, job, imageOutcome.path);

      if (imageOutcome.status === 'missing') {
        stats.imagesMissing += 1;
        missingImages.push({
          state: payload.state,
          name: payload.name,
          slug,
          expectedPath: imageOutcome.expectedPath
        });
      }
      if (imageOutcome.status === 'downloaded') stats.imagesDownloaded += 1;

      if (options.dryRun) {
        log.info(`  [dry-run] ${slug}: category=${payload.category}, state=${payload.state}, status=${payload.status}, image=${payload.image || '(none)'}`);
        stats.processed += 1;
        continue;
      }

      resolvedRecords.push({ record, slug, isUpdate: !!existing, payload });
    } catch (error: any) {
      stats.failed += 1;
      log.error(`  Failed to resolve '${record?.name || 'unknown'}': ${error?.message || error}`);
    }
  }

  if (options.dryRun || resolvedRecords.length === 0) return stats;

  for (const batch of chunk(resolvedRecords, chunkSize)) {
    try {
      const { error } = await supabase
        .from('leaders')
        .upsert(batch.map((r) => r.payload), { onConflict: 'slug' });
      if (error) throw error;

      for (const r of batch) {
        if (r.isUpdate) stats.updated += 1;
        else stats.inserted += 1;
        stats.processed += 1;
      }
    } catch (error: any) {
      stats.failed += batch.length;
      log.error(
        `  Transaction rolled back for a batch of ${batch.length} leader(s) starting with '${batch[0].record.name}': ${error?.message || error}`
      );
    }
  }

  return stats;
}

/** Writes the run's missing-image list to disk (overwritten each run - see logs/missing-images.json). */
export async function writeMissingImagesReport(
  missingImages: MissingImageEntry[],
  reportPath: string = 'logs/missing-images.json'
): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), reportPath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, JSON.stringify(missingImages, null, 2), 'utf-8');
}

/** Writes a machine-readable summary of the run's stats (overwritten each run - see logs/import-summary.json). */
export async function writeSummaryReport(
  summary: { jobLabels: string[]; stats: RunStats; dryRun: boolean; missingImageCount: number },
  reportPath: string = 'logs/import-summary.json'
): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), reportPath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(
    absolutePath,
    JSON.stringify({ generatedAt: new Date().toISOString(), ...summary }, null, 2),
    'utf-8'
  );
}

/**
 * Runs every job in sequence against a shared slug namespace (so a name that
 * collides across two states in the same invocation is disambiguated
 * correctly, not just within a single state's file), then writes the
 * import log, missing-image report, and summary report, and prints the
 * final aggregate report. This is the single orchestrator every entrypoint
 * script (import-leaders.ts, import-state.ts, import-all.ts) calls into.
 */
export async function executeImport(jobs: ImportJob[], options: ImportRunOptions, log: ImportLogger): Promise<RunStats> {
  if (jobs.length === 0) {
    log.info('Nothing to import: no configured state has a data file yet.');
    await log.flush();
    process.exit(0);
  }

  const supabase = options.dryRun ? null : createSupabaseClient(false, log);
  if (!options.dryRun && !supabase) {
    await log.flush();
    process.exit(1);
  }

  const total = emptyStats();
  const usedSlugsThisRun = new Set<string>();
  const jobLabels: string[] = [];
  const missingImages: MissingImageEntry[] = [];

  for (const job of jobs) {
    const records = await loadRecords(job.filePath);
    if (records.length === 0) {
      log.info(`No records found in ${job.label}, skipping.`);
      continue;
    }
    const stats = await runJob(job, records, options, supabase, usedSlugsThisRun, log, missingImages);
    mergeStats(total, stats);
    jobLabels.push(job.label);
  }

  log.info('');
  log.info('=== Import Report ===');
  log.info(`States/files processed: ${jobLabels.length} (${jobLabels.join(', ') || 'none'})`);
  if (options.dryRun) {
    log.info(`Valid records (would import): ${total.processed}`);
  } else {
    log.info(`Processed: ${total.processed}`);
    log.info(`Inserted: ${total.inserted}`);
    log.info(`Updated: ${total.updated}`);
  }
  log.info(`Skipped: ${total.skipped}`);
  log.info(`Failed (rolled back): ${total.failed}`);
  log.info(`Images missing (skipped): ${total.imagesMissing}`);
  log.info(`Images downloaded: ${total.imagesDownloaded}`);
  log.info('=====================');

  if (!options.dryRun) {
    await writeMissingImagesReport(missingImages);
    await writeSummaryReport({ jobLabels, stats: total, dryRun: options.dryRun, missingImageCount: missingImages.length });
    if (missingImages.length > 0) {
      log.info(`Missing-image report written to logs/missing-images.json (${missingImages.length} leader(s)).`);
    }
  }

  await log.flush();
  if (total.failed > 0) process.exitCode = 1;
  return total;
}
