/**
 * scripts/fix-lok-sabha-images.ts
 *
 * One-purpose maintenance fix: Lok Sabha MP rows already in Supabase have no
 * real profile photo — most were seeded with a generic Unsplash placeholder
 * URL, which src/lib/imageUtils.ts correctly detects and the UI correctly
 * hides behind the silhouette fallback. This script finds a REAL photo for
 * exactly those rows (via the same Wikipedia Commons lookup already trusted
 * elsewhere in this codebase — see dbService.scanMissingImages() in
 * src/lib/supabaseClient.ts and wikipediaCommonsProvider in
 * src/services/leaders/providers.ts), re-hosts it in the project's existing
 * `leaders` Supabase Storage bucket (same bucket/folder convention as
 * src/services/storage/storageService.ts), and writes only the resulting
 * public URL into leaders.image.
 *
 * Deliberately NOT touched: scripts/import-lok-sabha-mps.ts (the importer),
 * routing, UI components, search. This is a standalone script, run manually.
 *
 * Scope: only leaders where category = 'Lok Sabha MP' AND the current image
 * is missing/placeholder (per isPlaceholderImage — empty, Unsplash, or any
 * other known placeholder pattern). Confirmed against live data: 0 of 555
 * Lok Sabha MP rows have a literally-empty `image` — the 543 needing a real
 * photo all currently hold an Unsplash placeholder URL, which is why
 * isPlaceholderImage (not isMissingImage) is the correct target filter here.
 * Rows with a real, non-placeholder image already set are never touched,
 * even if that image is only hotlinked and not yet re-hosted. If no real
 * photo is found for a leader, that row is left exactly as-is — a
 * placeholder is never written to "fix" the gap.
 * Only the `image` column is ever written — name/party/bio/etc. are never
 * touched. (image_hash/image_source/verified/last_verified from
 * supabase/migrations/001_add_verification_fields.sql were checked against
 * the live project and do NOT exist there — that migration was never
 * applied. Per "do not modify database schema," this script does not add
 * them; it only uses columns confirmed to exist: id, slug, name, image,
 * category.)
 *
 * Usage:
 *   npx tsx scripts/fix-lok-sabha-images.ts [--validate] [--limit=20]
 *
 * Flags:
 *   --validate   Look up candidates and report what WOULD be updated. No
 *                downloads, no Storage uploads, no Supabase writes.
 *   --limit=N    Only process the first N matching leaders (safety valve for
 *                a first run — this will make one Wikipedia request and,
 *                on a hit, one download + one Storage upload per leader).
 */
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { hashBlob, isPlaceholderImage, STORAGE_BUCKET, STORAGE_PATHS } from '../src/lib/imageUtils';

const CATEGORY = 'Lok Sabha MP';
const FETCH_TIMEOUT_MS = 10000;

const POLITICAL_KEYWORDS = [
  'politician', 'member of parliament', 'lok sabha', 'rajya sabha', 'minister',
  'chief minister', 'governor', 'mla', 'mp ', 'parliament', 'cabinet',
];

interface LogEntry {
  name: string;
  slug: string;
  status: string;
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cleanName(name: string): string {
  return name.replace(/^(Shri|Smt|Dr|Mr|Mrs|Ms|Prof|Thiru|Kumari)\.?\s+/i, '').trim();
}

/** Same defensive approach as wikipediaCommonsProvider in src/services/leaders/providers.ts:
 * only accept a match whose extract actually mentions a political role, to
 * avoid grabbing an unrelated namesake's photo. */
async function findVerifiedWikipediaPortrait(name: string): Promise<string | null> {
  const title = encodeURIComponent(cleanName(name));
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${title}` +
    `&prop=pageimages|extracts&exintro=1&explaintext=1&pithumbsize=500&format=json&origin=*`;

  const res = await fetchWithTimeout(url);
  if (!res || !res.ok) return null;

  const json = await res.json().catch(() => null);
  const pages = json?.query?.pages;
  if (!pages) return null;

  for (const key of Object.keys(pages)) {
    const page = pages[key];
    const thumb = page?.thumbnail?.source;
    const extract = String(page?.extract || '').toLowerCase();
    if (!thumb) continue;
    if (!POLITICAL_KEYWORDS.some((kw) => extract.includes(kw))) continue;
    return thumb as string;
  }
  return null;
}

async function downloadAndHost(
  supabase: any,
  slug: string,
  sourceUrl: string,
  seenHashesThisRun: Map<string, string>
): Promise<{ publicUrl?: string; status: string }> {
  const response = await fetchWithTimeout(sourceUrl);
  if (!response) return { status: 'download-failed: network error' };
  if (!response.ok) return { status: `download-failed: HTTP ${response.status}` };

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    return { status: `not-an-image (content-type: ${contentType || 'unknown'})` };
  }

  const blob = await response.blob();
  // No image_hash column exists on the live leaders table (see header note),
  // so cross-run dedup isn't possible — this only catches the same source
  // photo being reused for two leaders within a single run.
  const hash = await hashBlob(blob);
  const duplicateOf = seenHashesThisRun.get(hash);
  if (duplicateOf && duplicateOf !== slug) {
    return { status: `skipped-duplicate-image (byte-identical to ${duplicateOf} earlier in this run)` };
  }

  const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg';
  const storagePath = `${STORAGE_PATHS.profile}/${slug}-${hash.slice(0, 16)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, blob, { contentType, upsert: true });
  if (uploadError) return { status: `storage-upload-failed: ${uploadError.message}` };

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  seenHashesThisRun.set(hash, slug);
  return { publicUrl: publicUrlData.publicUrl, status: 'hosted' };
}

async function main() {
  const argv = process.argv.slice(2);
  const validateOnly = argv.includes('--validate');
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

  const { data: allLokSabha, error: fetchError } = await supabase
    .from('leaders')
    .select('id,slug,name,image')
    .eq('category', CATEGORY);

  if (fetchError) {
    console.error('Failed to load Lok Sabha MP leaders:', fetchError.message);
    process.exit(1);
  }

  const seenHashesThisRun = new Map<string, string>();

  let targets = (allLokSabha || []).filter((l: any) => isPlaceholderImage(l.image));
  console.log(`[SCAN] ${allLokSabha?.length ?? 0} Lok Sabha MP row(s) total, ${targets.length} with a missing/placeholder image.`);
  if (limit) targets = targets.slice(0, limit);
  console.log(`[SCAN] Processing ${targets.length} row(s)${limit ? ` (--limit=${limit})` : ''}.`);

  const logs: LogEntry[] = [];
  const summary = { scanned: targets.length, updated: 0, notFound: 0, failed: 0 };

  for (const leader of targets) {
    const candidate = await findVerifiedWikipediaPortrait(leader.name);
    if (!candidate) {
      console.log(`[NOT-FOUND] ${leader.name} (${leader.slug}) — no verified photo found`);
      logs.push({ name: leader.name, slug: leader.slug, status: 'not-found' });
      summary.notFound++;
      continue;
    }

    if (validateOnly) {
      console.log(`[VALIDATE] ${leader.name} (${leader.slug}) — would host ${candidate} and update image`);
      logs.push({ name: leader.name, slug: leader.slug, status: 'would-update (validate mode)' });
      summary.updated++;
      continue;
    }

    const outcome = await downloadAndHost(supabase, leader.slug, candidate, seenHashesThisRun);
    if (outcome.status !== 'hosted' || !outcome.publicUrl) {
      console.log(`[FAILED] ${leader.name} (${leader.slug}) — ${outcome.status}`);
      logs.push({ name: leader.name, slug: leader.slug, status: outcome.status });
      summary.failed++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('leaders')
      .update({ image: outcome.publicUrl })
      .eq('id', leader.id);

    if (updateError) {
      console.error(`[UPDATE-FAILED] ${leader.name} (${leader.slug}): ${updateError.message}`);
      logs.push({ name: leader.name, slug: leader.slug, status: `update-failed: ${updateError.message}` });
      summary.failed++;
      continue;
    }

    console.log(`[UPDATED] ${leader.name} (${leader.slug}) -> ${outcome.publicUrl}`);
    logs.push({ name: leader.name, slug: leader.slug, status: 'updated' });
    summary.updated++;
  }

  console.log('\n=== Fix Summary ===');
  console.log(summary);

  const logDir = path.resolve(process.cwd(), 'output/logs');
  await fs.mkdir(logDir, { recursive: true });
  const logFile = path.join(logDir, `fix-lok-sabha-images-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logFile, JSON.stringify({ mode: validateOnly ? 'validate' : 'live', summary, logs }, null, 2));
  console.log(`Log written to ${logFile}`);
}

main().catch((err) => {
  console.error('Fix script failed:', err);
  process.exit(1);
});
