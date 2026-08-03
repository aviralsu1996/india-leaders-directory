import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

type RawMla = Record<string, any>;

function slugify(input: string) {
  return input
    .toString()
    .replace(/^(Shri|Smt|Dr|Mr|Ms)\.?\s+/i, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeText(value: unknown) {
  return String(value || '').replace(/\n/g, ' ').trim();
}

function inferGender(record: RawMla) {
  const explicit = normalizeText(record.gender);
  if (explicit) return explicit;
  const name = normalizeText(record.name);
  if (/^(Smt|Mrs|Ms)\.?\s+/i.test(name)) return 'Female';
  if (/^(Shri|Mr|Sri)\.?\s+/i.test(name)) return 'Male';
  return 'Male';
}

function validateRecord(r: RawMla) {
  const errs: string[] = [];
  if (!r.name || typeof r.name !== 'string') errs.push('missing name');
  if (!r.state || typeof r.state !== 'string') errs.push('missing state');
  if (!r.party || typeof r.party !== 'string') errs.push('missing party');
  if (!r.constituency && !r.serial) errs.push('missing constituency/serial');
  if (!r.image || typeof r.image !== 'string') errs.push('missing image');
  return errs;
}

async function main() {
  const argv = process.argv.slice(2);
  const validateOnly = argv.includes('--validate');

  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase service role configuration missing. Set SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const filePath = path.resolve(process.cwd(), 'data/import/up_mlas.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  let json: any;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON in data/import/up_mlas.json');
    process.exit(1);
  }
  if (!Array.isArray(json)) {
    console.error('Expected an array in up_mlas.json');
    process.exit(1);
  }

  // Get existing leaders slugs and names to skip duplicates
  const { data: existingLeaders } = await supabase.from('leaders').select('id,slug,name');
  const existingBySlug = new Map<string, any>();
  const existingByName = new Map<string, any>();
  (existingLeaders || []).forEach((l: any) => {
    if (l.slug) existingBySlug.set(String(l.slug).toLowerCase(), l);
    if (l.name) existingByName.set(String(l.name).toLowerCase(), l);
  });

  const seenSlugs = new Set<string>();
  const toInsert: any[] = [];
  const summary = { inserted: 0, skipped: 0, invalid: 0, duplicates: 0 };

  for (const rawRec of json) {
    const rec: RawMla = rawRec;
    const errors = validateRecord(rec);
    if (errors.length) {
      console.warn('[INVALID]', rec.name || JSON.stringify(rec), errors.join('; '));
      summary.invalid++;
      continue;
    }

    const baseSlug = slugify(`${rec.name} ${rec.constituency || rec.serial || ''}`);
    let slug = baseSlug;
    let attempt = 1;
    while (seenSlugs.has(slug)) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const existsBySlug = existingBySlug.get(slug) || existingBySlug.get(String(rec.slug || '').toLowerCase());
    const existsByName = existingByName.get(String(rec.name).toLowerCase());
    if (existsBySlug || existsByName) {
      console.log('[DUPLICATE]', rec.name, '-> skipping (exists)');
      summary.duplicates++;
      continue;
    }

    const payload: any = {
      slug,
      name: rec.name,
      designation: rec.designation || 'MLA',
      category: 'MLA' as any,
      state: rec.state || 'Uttar Pradesh',
      constituency: rec.constituency || '',
      district: normalizeText(rec.district),
      party: normalizeText(rec.party) || 'Independent',
      gender: inferGender(rec),
      bio: normalizeText(rec.bio),
      education: normalizeText(rec.education) || 'Not specified',
      profession: normalizeText(rec.profession) || 'Public Service',
      image: rec.image || '',
      featured: false,
      status: 'Published'
    };

    toInsert.push(payload);
    seenSlugs.add(slug);
  }

  console.log('Preview:');
  console.log('Existing records in DB:', (existingLeaders || []).length);
  console.log('New records to insert:', toInsert.length);
  console.log('Duplicates skipped:', summary.duplicates);
  console.log('Invalid records:', summary.invalid);

  if (validateOnly) {
    console.log('Validation mode - exiting without writing.');
    process.exit(0);
  }

  if (toInsert.length === 0) {
    console.log('Nothing to insert.');
    process.exit(0);
  }

  // Insert in small batches
  const batchSize = 50;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('leaders').insert(batch);
    if (error) {
      console.error('Failed to insert batch:', error.message || error);
      process.exit(1);
    }
    summary.inserted += batch.length;
    console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length}`);
  }

  console.log('Import complete. Summary:', summary);
}

main().catch((err) => {
  console.error('Importer failed:', err);
  process.exit(1);
});
