import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

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

/**
 * Generates a slug for a leader that doesn't already have one, guaranteed
 * unique within this import run by falling back to constituency/district/
 * serial suffixes on collision. Generic across any state's leader list.
 */
function generateUniqueSlug(
  record: RawLeaderRecord,
  usedSlugs: Set<string>
): string {
  const base = baseSlugFromName(cleanText(record.name)) || 'leader';
  if (!usedSlugs.has(base)) return base;

  const disambiguators = [record.constituency, record.district, record.serial]
    .map((v) => (v === undefined || v === null ? '' : slugifyPart(cleanText(String(v)))))
    .filter(Boolean);

  for (const suffix of disambiguators) {
    const candidate = `${base}-${suffix}`;
    if (!usedSlugs.has(candidate)) return candidate;
  }

  let n = 2;
  let candidate = `${base}-${n}`;
  while (usedSlugs.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

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
  image: string;
  cover_image: string;
  featured: boolean;
  status: string;
  official_profile_url: string;
}

interface ImportOptions {
  filePath: string;
  publicDir: string;
  imageDir?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): ImportOptions {
  const options: ImportOptions = {
    filePath: 'data-store.json',
    publicDir: 'public',
    dryRun: false
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--file=')) {
      options.filePath = arg.slice('--file='.length);
    } else if (arg.startsWith('--image-dir=')) {
      options.imageDir = arg.slice('--image-dir='.length);
    }
  }

  return options;
}

/**
 * Resolves the image path convention (/storage/leaders/<state>/<filename>)
 * and confirms the file actually exists under public/ before it's written
 * to the database. Returns '' (and logs) when the image can't be verified,
 * so a missing asset never blocks the rest of the leader's import.
 */
function resolveImage(
  rawImage: string | null | undefined,
  options: ImportOptions,
  label: string
): string {
  const value = cleanText(rawImage || '');
  if (!value) return '';

  let imagePath = value;
  if (!imagePath.startsWith('/') && options.imageDir) {
    imagePath = `/storage/leaders/${options.imageDir}/${imagePath}`;
  } else if (!imagePath.startsWith('/') && !/^https?:\/\//i.test(imagePath)) {
    // Bare filename with no --image-dir hint and no leading slash: can't
    // place it under storage/leaders/<state>/ without knowing the state
    // folder, so leave it untouched rather than guess.
    return value;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    // Externally hosted image (e.g. legacy directoryLeaders records) - trust as-is.
    return imagePath;
  }

  const absolutePath = path.join(process.cwd(), options.publicDir, imagePath);
  if (!existsSync(absolutePath)) {
    console.warn(`  Image missing on disk for ${label}, skipping image field: ${imagePath}`);
    return '';
  }

  return imagePath;
}

function buildPayload(
  record: RawLeaderRecord,
  slug: string,
  options: ImportOptions
): LeaderPayload {
  const constituency = [cleanText(record.constituency), cleanText(record.district)]
    .filter(Boolean)
    .join(', ');

  return {
    slug,
    name: cleanText(record.name),
    designation: cleanText(record.designation) || 'Leader',
    category: normalizeCategory(record.category ?? record.designation),
    state: cleanText(record.state),
    constituency,
    party: cleanText(record.party),
    gender: cleanText(record.gender),
    bio: cleanText(record.bio),
    education: cleanText(record.education),
    profession: cleanText(record.profession),
    image: resolveImage(record.image, options, record.name || slug),
    cover_image: cleanText(record.cover_image),
    featured: typeof record.featured === 'boolean' ? record.featured : false,
    status: normalizeStatus(record.status),
    official_profile_url: cleanText(record.official_profile_url || record.website)
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

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  const dotenvResult = dotenv.config({ path: envPath });
  if (dotenvResult.error && !options.dryRun) {
    console.error(`Unable to load env file at ${envPath}:`, dotenvResult.error);
    process.exit(1);
  }

  const records = await loadRecords(options.filePath);
  if (records.length === 0) {
    console.log(`No leader records found in ${options.filePath}.`);
    process.exit(0);
  }

  let supabase: any = null;
  if (!options.dryRun) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase service role configuration is missing.');
      console.error('Loaded env path:', envPath);
      console.error('Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env,');
      console.error('or re-run with --dry-run to validate the import file without a database.');
      process.exit(1);
    }

    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let imagesSkipped = 0;
  let dryRunValid = 0;
  const usedSlugs = new Set<string>();

  console.log(`Importing ${records.length} leader(s) from ${options.filePath}${options.dryRun ? ' (dry run)' : ''}...`);

  for (const record of records) {
    const providedSlug = cleanText(record.slug);
    const slug = providedSlug || generateUniqueSlug(record, usedSlugs);

    if (!slug) {
      skipped += 1;
      continue;
    }
    if (usedSlugs.has(slug)) {
      console.warn(`  Duplicate slug '${slug}' in source file, skipping repeat entry.`);
      skipped += 1;
      continue;
    }
    usedSlugs.add(slug);

    const payload = buildPayload(record, slug, options);
    if (!payload.image && record.image) imagesSkipped += 1;

    if (options.dryRun) {
      console.log(`  [dry-run] ${slug}: category=${payload.category}, state=${payload.state}, image=${payload.image || '(none)'}`);
      dryRunValid += 1;
      continue;
    }

    const { data: existing, error: fetchError } = await supabase
      .from('leaders')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchError) {
      console.error(`Failed to query existing leader with slug '${slug}':`, fetchError.message || fetchError);
      process.exit(1);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('leaders')
        .update(payload)
        .eq('slug', slug);

      if (updateError) {
        console.error(`Failed to update leader '${slug}':`, updateError.message || updateError);
        process.exit(1);
      }
      updated += 1;
    } else {
      const { error: insertError } = await supabase
        .from('leaders')
        .insert([payload]);

      if (insertError) {
        console.error(`Failed to insert leader '${slug}':`, insertError.message || insertError);
        process.exit(1);
      }
      inserted += 1;
    }
  }

  if (options.dryRun) {
    console.log(`Valid records (would import): ${dryRunValid}`);
  } else {
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
  }
  console.log(`Skipped: ${skipped}`);
  console.log(`Images skipped (missing on disk): ${imagesSkipped}`);
}

main().catch((error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
