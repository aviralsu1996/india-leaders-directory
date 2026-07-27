import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadStates, getState, StateConfig } from './lib/states';
import { resolveOfficialImage, ImageResult } from './lib/imageProviders';
import { ImportLogger } from './lib/logger';

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

interface RawLeaderRecord {
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

interface LeaderPayload {
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

/** One data source to import: either a single --file, a configured --state, or an --all-states job. */
interface ImportJob {
  label: string;
  filePath: string;
  imageDir?: string;
  defaultStatus: 'Draft' | 'Published';
}

interface CliOptions {
  file?: string;
  state?: string;
  allStates: boolean;
  imageDirOverride?: string;
  configPath: string;
  dryRun: boolean;
  downloadImages: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    allStates: false,
    configPath: 'config/states.json',
    dryRun: false,
    downloadImages: false
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all-states') {
      options.allStates = true;
    } else if (arg === '--download-images') {
      options.downloadImages = true;
    } else if (arg.startsWith('--file=')) {
      options.file = arg.slice('--file='.length);
    } else if (arg.startsWith('--state=')) {
      options.state = arg.slice('--state='.length);
    } else if (arg.startsWith('--image-dir=')) {
      options.imageDirOverride = arg.slice('--image-dir='.length);
    } else if (arg.startsWith('--config=')) {
      options.configPath = arg.slice('--config='.length);
    }
  }

  return options;
}

/**
 * Resolves what to import: an explicit --file (legacy/manual use), a
 * single --state (config-driven), every configured --all-states, or - with
 * no flags at all - the original default of data-store.json. This is the
 * only place that knows about config/states.json; nothing else in this
 * file, or in package.json, hardcodes a state.
 */
async function resolveJobs(options: CliOptions, log: ImportLogger): Promise<ImportJob[]> {
  if (options.file) {
    return [{
      label: options.file,
      filePath: options.file,
      imageDir: options.imageDirOverride,
      defaultStatus: 'Draft'
    }];
  }

  if (options.state) {
    const state = await getState(options.state, options.configPath);
    if (!existsSync(state.dataFile)) {
      log.error(`No data file for ${state.name} (${state.code}) at ${state.dataFile}.`);
      log.error(`Run scripts/extract_state_mlas.py --state=${state.code} first, or check config/states.json.`);
      process.exit(1);
    }
    return [stateJob(state)];
  }

  if (options.allStates) {
    const states = await loadStates(options.configPath);
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

  return [{ label: 'data-store.json (legacy)', filePath: 'data-store.json', defaultStatus: 'Draft' }];
}

function stateJob(state: StateConfig): ImportJob {
  return {
    label: `${state.name} (${state.code})`,
    filePath: state.dataFile,
    imageDir: state.code,
    // Explicit requirement for the MLA pipeline: generated records default to
    // Published. The legacy/manual --file path keeps the original Draft default.
    defaultStatus: 'Published'
  };
}

async function loadRecords(filePath: string): Promise<RawLeaderRecord[]> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileContents = await fs.readFile(absolutePath, 'utf-8');
  const json = JSON.parse(fileContents);

  if (Array.isArray(json)) return json;
  if (Array.isArray(json.directoryLeaders)) return json.directoryLeaders;

  throw new Error(
    `Unrecognized import file shape at ${filePath}: expected a JSON array or an object with a "directoryLeaders" array.`
  );
}

interface LeaderRow {
  slug: string;
  state?: string;
  constituency?: string;
}

const isSameLeader = (existing: LeaderRow, record: RawLeaderRecord): boolean =>
  existing.state === cleanText(record.state) && existing.constituency === buildConstituency(record);

type SlugResolution = { slug: string; existing: LeaderRow | null | 'unknown' } | null;

/**
 * Resolves the slug for a record and, along the way, figures out whether
 * it maps to an existing DB row. For an explicit slug (legacy
 * data-store.json records) that's left as 'unknown' for the caller to
 * check directly. For an auto-generated slug (the MLA pipeline), each
 * candidate is checked against the DB: a free slug, or one already owned
 * by the *same* leader (same state + constituency), is accepted; a slug
 * owned by a different person (a name collision across states, e.g. two
 * "Anil Kumar"s) is skipped in favour of the next, more specific
 * candidate - so re-running a single state's import can never overwrite
 * someone else's record just because they share a name.
 */
async function resolveSlug(
  record: RawLeaderRecord,
  usedSlugsThisRun: Set<string>,
  supabase: any,
  dryRun: boolean
): Promise<SlugResolution> {
  const providedSlug = cleanText(record.slug);
  if (providedSlug) {
    if (usedSlugsThisRun.has(providedSlug)) return null;
    usedSlugsThisRun.add(providedSlug);
    return { slug: providedSlug, existing: 'unknown' };
  }

  const base = baseSlugFromName(cleanText(record.name)) || 'leader';
  const disambiguators = [record.constituency, record.district, record.serial]
    .map((v) => (v === undefined || v === null ? '' : slugifyPart(cleanText(String(v)))))
    .filter(Boolean);
  const fixedCandidates = [base, ...disambiguators.map((suffix) => `${base}-${suffix}`)];

  const tryCandidate = async (candidate: string): Promise<{ slug: string; existing: LeaderRow | null } | undefined> => {
    if (usedSlugsThisRun.has(candidate)) return undefined;
    if (dryRun || !supabase) {
      usedSlugsThisRun.add(candidate);
      return { slug: candidate, existing: null };
    }
    const { data, error } = await supabase
      .from('leaders')
      .select('slug, state, constituency')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || isSameLeader(data, record)) {
      usedSlugsThisRun.add(candidate);
      return { slug: candidate, existing: data };
    }
    return undefined;
  };

  for (const candidate of fixedCandidates) {
    const result = await tryCandidate(candidate);
    if (result) return result;
  }

  for (let n = 2; n < fixedCandidates.length + 1000; n += 1) {
    const result = await tryCandidate(`${base}-${n}`);
    if (result) return result;
  }

  return null;
}

interface ImageOutcome {
  path: string;
  status: 'kept' | 'external' | 'missing' | 'downloaded' | 'none';
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
 * just reported and the image field is left blank, unless --download-images
 * is set, in which case the official-image fallback chain (Assembly site ->
 * Government site -> Wikipedia Commons; never a stock-photo service) gets a
 * chance to fill it in.
 */
async function resolveImage(
  record: RawLeaderRecord,
  slug: string,
  job: ImportJob,
  options: CliOptions,
  log: ImportLogger
): Promise<ImageOutcome> {
  const value = cleanText(record.image || '');

  if (value) {
    let imagePath = value;
    if (!imagePath.startsWith('/') && job.imageDir) {
      imagePath = `/storage/leaders/${job.imageDir}/${imagePath}`;
    }

    if (/^https?:\/\//i.test(imagePath)) {
      // Externally hosted image (e.g. legacy directoryLeaders records) - trust as-is.
      return { path: imagePath, status: 'external' };
    }

    if (!imagePath.startsWith('/')) {
      // Bare filename with no imageDir hint: can't place it under
      // storage/leaders/<state>/ without knowing the state folder.
      return { path: imagePath, status: 'external' };
    }

    const absolutePath = path.join(process.cwd(), 'public', imagePath);
    if (existsSync(absolutePath)) {
      return { path: imagePath, status: 'kept' };
    }
    log.warn(`  Image missing on disk for ${record.name || slug}, skipping image field: ${imagePath}`);
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
        return { path: saved, status: 'downloaded' };
      }
    }
  }

  return { path: '', status: value ? 'missing' : 'none' };
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

interface RunStats {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  imagesMissing: number;
  imagesDownloaded: number;
}

function emptyStats(): RunStats {
  return { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, imagesMissing: 0, imagesDownloaded: 0 };
}

async function runJob(
  job: ImportJob,
  records: RawLeaderRecord[],
  options: CliOptions,
  supabase: any,
  usedSlugsThisRun: Set<string>,
  log: ImportLogger
): Promise<RunStats> {
  const stats = emptyStats();
  log.info(`Importing ${records.length} leader(s) from ${job.label}${options.dryRun ? ' (dry run)' : ''}...`);

  for (const record of records) {
    try {
      const resolved = await resolveSlug(record, usedSlugsThisRun, supabase, options.dryRun);
      if (!resolved) {
        log.warn(`  Duplicate slug in source for '${record.name}', skipping repeat entry.`);
        stats.skipped += 1;
        continue;
      }

      const { slug } = resolved;
      const imageOutcome = await resolveImage(record, slug, job, options, log);
      const payload = buildPayload(record, slug, job, imageOutcome.path);

      if (imageOutcome.status === 'missing') stats.imagesMissing += 1;
      if (imageOutcome.status === 'downloaded') stats.imagesDownloaded += 1;

      if (options.dryRun) {
        log.info(`  [dry-run] ${slug}: category=${payload.category}, state=${payload.state}, status=${payload.status}, image=${payload.image || '(none)'}`);
        stats.processed += 1;
        continue;
      }

      let existing = resolved.existing;
      if (existing === 'unknown') {
        const { data, error } = await supabase.from('leaders').select('slug').eq('slug', slug).maybeSingle();
        if (error) throw error;
        existing = data;
      }

      if (existing) {
        const { error } = await supabase.from('leaders').update(payload).eq('slug', slug);
        if (error) throw error;
        stats.updated += 1;
      } else {
        const { error } = await supabase.from('leaders').insert([payload]);
        if (error) throw error;
        stats.inserted += 1;
      }
      stats.processed += 1;
    } catch (error: any) {
      stats.failed += 1;
      log.error(`  Failed to import '${record?.name || 'unknown'}': ${error?.message || error}`);
    }
  }

  return stats;
}

function mergeStats(into: RunStats, from: RunStats) {
  into.processed += from.processed;
  into.inserted += from.inserted;
  into.updated += from.updated;
  into.skipped += from.skipped;
  into.failed += from.failed;
  into.imagesMissing += from.imagesMissing;
  into.imagesDownloaded += from.imagesDownloaded;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const log = new ImportLogger();

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  const dotenvResult = dotenv.config({ path: envPath });
  if (dotenvResult.error && !options.dryRun) {
    log.error(`Unable to load env file at ${envPath}: ${dotenvResult.error}`);
    await log.flush();
    process.exit(1);
  }

  let supabase: any = null;
  if (!options.dryRun) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      log.error('Supabase service role configuration is missing.');
      log.error(`Loaded env path: ${envPath}`);
      log.error('Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env,');
      log.error('or re-run with --dry-run to validate the import file(s) without a database.');
      await log.flush();
      process.exit(1);
    }

    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  const jobs = await resolveJobs(options, log);
  if (jobs.length === 0) {
    log.info('Nothing to import: no configured state has a data file yet.');
    await log.flush();
    process.exit(0);
  }

  const total = emptyStats();
  const usedSlugsThisRun = new Set<string>();
  const jobLabels: string[] = [];

  for (const job of jobs) {
    const records = await loadRecords(job.filePath);
    if (records.length === 0) {
      log.info(`No records found in ${job.label}, skipping.`);
      continue;
    }
    const stats = await runJob(job, records, options, supabase, usedSlugsThisRun, log);
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
  log.info(`Failed: ${total.failed}`);
  log.info(`Images missing (skipped): ${total.imagesMissing}`);
  log.info(`Images downloaded: ${total.imagesDownloaded}`);
  log.info('=====================');

  await log.flush();

  if (total.failed > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
