/**
 * scripts/import-lok-sabha-mps.ts
 *
 * Reusable importer for Lok Sabha MP records — the national-level counterpart
 * to scripts/import-up-mlas.ts. No MP is ever hardcoded in this file: every
 * record comes from an external source you configure below. Safe to re-run
 * repeatedly (existing MPs are updated in place, not duplicated).
 *
 * WHY there is no bundled "official" endpoint:
 * sansad.in (the current Lok Sabha website), rajyasabha.nic.in, and
 * data.gov.in do not expose a stable, public, per-member JSON lookup API —
 * this is the same finding already documented in
 * src/services/leaders/providers.ts (lokSabhaProvider returns null for
 * exactly this reason). Guessing at an endpoint here would risk silently
 * fetching nothing, fetching the wrong shape, or scraping a page that
 * changes without notice. Instead, point this script at a source YOU have
 * verified:
 *
 *   - LOK_SABHA_SOURCE_FILE (default: data/import/lok_sabha_mps.json)
 *       A JSON file you populate from an official export — Lok Sabha
 *       Secretariat, PRS Legislative Research, data.gov.in, sansad.in's own
 *       downloadable member list, etc. Either a top-level array, or an
 *       object with a `members` (or `data`) array.
 *   - LOK_SABHA_SOURCE_URL
 *       A JSON HTTP endpoint you've already verified returns the same shape.
 *       If set, this takes priority over the file.
 *
 * Expected record shape (extra fields are ignored, all but name/party/
 * state/constituency are optional):
 *   {
 *     "name": "Shri Example MP",
 *     "party": "Some Party",
 *     "state": "Uttar Pradesh",
 *     "constituency": "Some Constituency",
 *     "designation": "Member of Parliament (Lok Sabha)",
 *     "gender": "Male",
 *     "dob": "1970-01-01",
 *     "bio": "...",
 *     "education": "...",
 *     "profession": "...",
 *     "mobile": "...", "email": "...", "address": "...",
 *     "facebook": "...", "twitter": "...", "instagram": "...",
 *     "youtube": "...", "website": "...",
 *     "official_profile_url": "https://sansad.in/...",
 *     "image": "https://.../portrait.jpg",   // source URL — never base64
 *     "membership_status": "Sitting",         // logged only, see note below
 *     "lok_sabha_terms": "18"                 // logged only, see note below
 *   }
 *
 * NOTE on membership_status / lok_sabha_terms: these fields exist on the
 * SupabaseLeader TypeScript type and are already rendered by
 * LeaderDetailsPage, but no migration has ever added the matching columns to
 * public.leaders. Writing them would fail the entire batch (Postgres:
 * "column does not exist"). This importer intentionally reads them for the
 * import log only and does NOT include them in any insert/update payload —
 * flagging the gap rather than silently working around it or touching the
 * schema (out of scope for this script).
 *
 * Pipeline: load source -> normalize -> generate slug -> match against
 * existing DB rows (by slug, then by name+constituency) -> download and
 * re-host the profile image in Supabase Storage (skips base64/placeholder
 * sources, dedupes byte-identical images) -> update or insert -> write a
 * JSON import log to output/logs/.
 *
 * Usage:
 *   npx tsx scripts/import-lok-sabha-mps.ts [--validate] [--draft] [--limit=20]
 *
 * Flags:
 *   --validate   Parse, normalize, and log what WOULD happen. No image
 *                downloads, no Supabase writes. Mirrors import-up-mlas.ts.
 *   --draft      Insert new MPs with status 'Draft' instead of 'Published'.
 *   --limit=N    Only process the first N source records (for safely testing
 *                against a large export before a full run).
 */
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { hashBlob, isPlaceholderImage, STORAGE_BUCKET, STORAGE_PATHS } from '../src/lib/imageUtils';

const IMPORT_SOURCE_LABEL = 'Official Lok Sabha MP Import';
const CATEGORY = 'Lok Sabha MP';
const DEFAULT_SOURCE_FILE = 'data/import/lok_sabha_mps.json';
const FETCH_TIMEOUT_MS = 10000;

interface RawMpRecord {
  [key: string]: unknown;
}

interface NormalizedMp {
  slug: string;
  name: string;
  designation: string;
  category: string;
  state: string;
  constituency: string;
  district: string | null;
  party: string;
  gender: string;
  dob: string | null;
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
  official_profile_url: string;
  status: 'Published' | 'Draft';
  rawImageUrl: string;
  membershipStatusForLogOnly: string;
  lokSabhaTermsForLogOnly: string;
}

interface LogEntry {
  name: string;
  slug: string;
  action: 'insert' | 'update' | 'skip_duplicate' | 'invalid';
  imageStatus?: string;
  notes?: string;
}

function slugify(input: string): string {
  return input
    .toString()
    .replace(/^(Shri|Smt|Dr|Mr|Ms|Mrs|Prof|Thiru|Kumari)\.?\s+/i, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function inferGender(record: RawMpRecord): string {
  const explicit = normalizeText(record.gender);
  if (explicit) return explicit;
  const name = normalizeText(record.name);
  if (/^(Smt|Mrs|Ms|Kumari)\.?\s+/i.test(name)) return 'Female';
  return 'Male';
}

function normalizeDob(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : text;
}

function validateRawRecord(r: RawMpRecord): string[] {
  const errs: string[] = [];
  if (!r.name || typeof r.name !== 'string') errs.push('missing name');
  if (!r.party || typeof r.party !== 'string') errs.push('missing party');
  if (!r.state || typeof r.state !== 'string') errs.push('missing state');
  if (!r.constituency || typeof r.constituency !== 'string') errs.push('missing constituency');
  return errs;
}

function normalizeRecord(r: RawMpRecord, asDraft: boolean): NormalizedMp {
  const name = normalizeText(r.name);
  const constituency = normalizeText(r.constituency);
  const rawImage = normalizeText(r.image);

  return {
    slug: slugify(`${name} ${constituency}`),
    name,
    designation: normalizeText(r.designation) || 'Member of Parliament (Lok Sabha)',
    category: CATEGORY,
    state: normalizeText(r.state),
    constituency,
    district: normalizeText(r.district) || null,
    party: normalizeText(r.party) || 'Independent',
    gender: inferGender(r),
    dob: normalizeDob(r.dob),
    bio: normalizeText(r.bio),
    education: normalizeText(r.education) || 'Not specified',
    profession: normalizeText(r.profession) || 'Public Service',
    mobile: normalizeText(r.mobile),
    email: normalizeText(r.email),
    address: normalizeText(r.address),
    facebook: normalizeText(r.facebook),
    twitter: normalizeText(r.twitter),
    instagram: normalizeText(r.instagram),
    youtube: normalizeText(r.youtube),
    website: normalizeText(r.website),
    official_profile_url: normalizeText(r.official_profile_url),
    status: asDraft ? 'Draft' : 'Published',
    rawImageUrl: rawImage.startsWith('data:') ? '' : rawImage,
    membershipStatusForLogOnly: normalizeText(r.membership_status ?? r.status),
    lokSabhaTermsForLogOnly: normalizeText(r.lok_sabha_terms ?? r.terms),
  };
}

async function loadSourceRecords(): Promise<RawMpRecord[]> {
  const sourceUrl = process.env.LOK_SABHA_SOURCE_URL;
  let json: unknown;

  if (sourceUrl) {
    console.log(`[SOURCE] Fetching Lok Sabha MP data from LOK_SABHA_SOURCE_URL: ${sourceUrl}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(sourceUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = await res.json();
    } finally {
      clearTimeout(timer);
    }
  } else {
    const filePath = path.resolve(process.cwd(), process.env.LOK_SABHA_SOURCE_FILE || DEFAULT_SOURCE_FILE);
    console.log(`[SOURCE] Reading Lok Sabha MP data from file: ${filePath}`);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf-8');
    } catch {
      console.error(
        `\nNo source configured. This importer does not hardcode any MP or scraping\n` +
        `endpoint — set LOK_SABHA_SOURCE_URL to a JSON API you've verified, or\n` +
        `create ${filePath}\nfrom an official export (Lok Sabha Secretariat, PRS Legislative\n` +
        `Research, data.gov.in, etc). See the header comment in this script for the\n` +
        `expected record shape.\n`
      );
      process.exit(1);
    }
    json = JSON.parse(raw);
  }

  if (Array.isArray(json)) return json as RawMpRecord[];
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.members)) return obj.members as RawMpRecord[];
    if (Array.isArray(obj.data)) return obj.data as RawMpRecord[];
  }
  console.error('Source data must be a JSON array, or an object with a `members`/`data` array.');
  process.exit(1);
}

async function downloadAndHostImage(
  mp: NormalizedMp,
  existingHashes: Map<string, string>,
  supabase: any
): Promise<{ url: string; hash?: string; status: string }> {
  if (!mp.rawImageUrl) return { url: '', status: 'no-source-url' };
  if (isPlaceholderImage(mp.rawImageUrl)) return { url: '', status: 'skipped-placeholder-source' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(mp.rawImageUrl, { signal: controller.signal, referrerPolicy: 'no-referrer' });
  } catch (err: any) {
    return { url: '', status: `download-failed: ${err?.message || err}` };
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) return { url: '', status: `download-failed: HTTP ${response.status}` };

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    return { url: '', status: `not-an-image (content-type: ${contentType || 'unknown'})` };
  }

  const blob = await response.blob();
  const hash = await hashBlob(blob);

  const duplicateOf = existingHashes.get(hash);
  if (duplicateOf && duplicateOf !== mp.slug) {
    return { url: '', status: `skipped-duplicate-image (byte-identical to ${duplicateOf})` };
  }

  const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg';
  const fileName = `${mp.slug}-${hash.slice(0, 16)}.${extension}`;
  const storagePath = `${STORAGE_PATHS.profile}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, blob, { contentType, upsert: true });
  if (uploadError) return { url: '', status: `storage-upload-failed: ${uploadError.message}` };

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  existingHashes.set(hash, mp.slug);
  return { url: publicUrlData.publicUrl, hash, status: 'hosted' };
}

async function main() {
  const argv = process.argv.slice(2);
  const validateOnly = argv.includes('--validate');
  const asDraft = argv.includes('--draft');
  const limitArg = argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase service role configuration missing. Set SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  let rawRecords = await loadSourceRecords();
  if (limit) rawRecords = rawRecords.slice(0, limit);
  console.log(`[SOURCE] Loaded ${rawRecords.length} raw record(s).`);

  // Existing DB state, used for update-vs-insert matching, slug collision
  // checks, and cross-run image dedup — pulled once up front.
  const { data: existingLeaders, error: fetchError } = await supabase
    .from('leaders')
    .select('id,slug,name,constituency,category,image,image_hash');
  if (fetchError) {
    console.error('Failed to load existing leaders:', fetchError.message);
    process.exit(1);
  }

  const bySlug = new Map<string, any>();
  const byNameConstituency = new Map<string, any>();
  const existingHashes = new Map<string, string>();
  (existingLeaders || []).forEach((l: any) => {
    if (l.slug) bySlug.set(String(l.slug).toLowerCase(), l);
    if (l.name && l.constituency) {
      byNameConstituency.set(`${String(l.name).toLowerCase()}|${String(l.constituency).toLowerCase()}`, l);
    }
    if (l.image_hash) existingHashes.set(l.image_hash, l.slug);
  });

  const seenSlugsThisRun = new Set<string>();
  const logs: LogEntry[] = [];
  const summary = { inserted: 0, updated: 0, skippedDuplicate: 0, invalid: 0, imagesHosted: 0, imagesSkipped: 0 };

  for (const raw of rawRecords) {
    const errors = validateRawRecord(raw);
    if (errors.length) {
      const name = normalizeText(raw.name) || '(unnamed)';
      console.warn(`[INVALID] ${name}: ${errors.join('; ')}`);
      logs.push({ name, slug: '', action: 'invalid', notes: errors.join('; ') });
      summary.invalid++;
      continue;
    }

    const mp = normalizeRecord(raw, asDraft);
    let slug = mp.slug;
    let attempt = 1;
    while (seenSlugsThisRun.has(slug)) {
      attempt += 1;
      slug = `${mp.slug}-${attempt}`;
    }
    mp.slug = slug;

    if (seenSlugsThisRun.has(mp.slug)) {
      console.log(`[SKIP-DUPLICATE] ${mp.name} — duplicate within this import batch`);
      logs.push({ name: mp.name, slug: mp.slug, action: 'skip_duplicate', notes: 'duplicate within source data' });
      summary.skippedDuplicate++;
      continue;
    }
    seenSlugsThisRun.add(mp.slug);

    const existing =
      bySlug.get(mp.slug.toLowerCase()) ||
      byNameConstituency.get(`${mp.name.toLowerCase()}|${mp.constituency.toLowerCase()}`);

    if (mp.membershipStatusForLogOnly || mp.lokSabhaTermsForLogOnly) {
      console.log(
        `[NOTE] ${mp.name}: membership_status/lok_sabha_terms present in source ` +
        `(status=${mp.membershipStatusForLogOnly || 'n/a'}, terms=${mp.lokSabhaTermsForLogOnly || 'n/a'}) ` +
        `but no DB column exists for these yet — logged only, not written.`
      );
    }

    let imageOutcome: { url: string; hash?: string; status: string } = { url: '', status: 'not-attempted' };
    if (!validateOnly) {
      imageOutcome = await downloadAndHostImage(mp, existingHashes, supabase);
      if (imageOutcome.status === 'hosted') summary.imagesHosted++;
      else summary.imagesSkipped++;
    }

    const payload: Record<string, unknown> = {
      slug: mp.slug,
      name: mp.name,
      designation: mp.designation,
      category: mp.category,
      state: mp.state,
      constituency: mp.constituency,
      district: mp.district,
      party: mp.party,
      gender: mp.gender,
      dob: mp.dob,
      bio: mp.bio,
      education: mp.education,
      profession: mp.profession,
      mobile: mp.mobile,
      email: mp.email,
      address: mp.address,
      facebook: mp.facebook,
      twitter: mp.twitter,
      instagram: mp.instagram,
      youtube: mp.youtube,
      website: mp.website,
      official_profile_url: mp.official_profile_url,
      image_source: imageOutcome.status === 'hosted' ? IMPORT_SOURCE_LABEL : undefined,
      verified: imageOutcome.status === 'hosted' ? true : undefined,
      last_verified: imageOutcome.status === 'hosted' ? new Date().toISOString() : undefined,
    };

    // Never overwrite an existing, already-hosted photo with nothing just
    // because this run's source didn't supply one or the download failed.
    if (imageOutcome.status === 'hosted') {
      payload.image = imageOutcome.url;
      payload.image_hash = imageOutcome.hash;
    }
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    if (validateOnly) {
      console.log(`[VALIDATE] ${existing ? 'would UPDATE' : 'would INSERT'} ${mp.name} (${mp.slug})`);
      logs.push({
        name: mp.name,
        slug: mp.slug,
        action: existing ? 'update' : 'insert',
        imageStatus: 'not-attempted (validate mode)',
      });
      if (existing) summary.updated++;
      else summary.inserted++;
      continue;
    }

    if (existing) {
      const { error: updateError } = await supabase.from('leaders').update(payload).eq('id', existing.id);
      if (updateError) {
        console.error(`[UPDATE-FAILED] ${mp.name}: ${updateError.message}`);
        logs.push({ name: mp.name, slug: mp.slug, action: 'invalid', notes: `update failed: ${updateError.message}` });
        summary.invalid++;
        continue;
      }
      console.log(`[UPDATE] ${mp.name} (${mp.slug}) — image: ${imageOutcome.status}`);
      logs.push({ name: mp.name, slug: mp.slug, action: 'update', imageStatus: imageOutcome.status });
      summary.updated++;
    } else {
      payload.status = mp.status;
      payload.featured = false;
      const { error: insertError } = await supabase.from('leaders').insert([payload]);
      if (insertError) {
        console.error(`[INSERT-FAILED] ${mp.name}: ${insertError.message}`);
        logs.push({ name: mp.name, slug: mp.slug, action: 'invalid', notes: `insert failed: ${insertError.message}` });
        summary.invalid++;
        continue;
      }
      console.log(`[INSERT] ${mp.name} (${mp.slug}) — image: ${imageOutcome.status}`);
      logs.push({ name: mp.name, slug: mp.slug, action: 'insert', imageStatus: imageOutcome.status });
      summary.inserted++;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(summary);

  const logDir = path.resolve(process.cwd(), 'output/logs');
  await fs.mkdir(logDir, { recursive: true });
  const logFile = path.join(logDir, `lok-sabha-import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logFile, JSON.stringify({ mode: validateOnly ? 'validate' : 'live', summary, logs }, null, 2));
  console.log(`Import log written to ${logFile}`);
}

main().catch((err) => {
  console.error('Importer failed:', err);
  process.exit(1);
});
