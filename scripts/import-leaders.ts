import * as fs from 'fs/promises';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const allowedCategories = new Set([
  'Prime Minister',
  'Chief Minister',
  'Deputy Chief Minister',
  'Cabinet Minister',
  'Minister of State',
  'Lok Sabha MP',
  'Rajya Sabha MP',
  'Governor'
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

async function main() {
  const dotenv = await import('dotenv');
  const envPath = process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env');
  const dotenvResult = dotenv.config({ path: envPath });

  if (dotenvResult.error) {
    console.error(`Unable to load env file at ${envPath}:`, dotenvResult.error);
    process.exit(1);
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase service role configuration is missing.');
    console.error('Loaded env path:', envPath);
    console.error('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
    console.error('SUPABASE_URL:', !!process.env.SUPABASE_URL);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
    console.error('SERVICE_ROLE_KEY:', !!process.env.SERVICE_ROLE_KEY);
    console.error('Please set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  if (!supabase) {
    console.error('Unable to initialize Supabase client.');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), 'data-store.json');
  const fileContents = await fs.readFile(filePath, 'utf-8');
  const json = JSON.parse(fileContents);
  const leaders = Array.isArray(json.directoryLeaders) ? json.directoryLeaders : [];

  if (leaders.length === 0) {
    console.log('No directoryLeaders found in data-store.json.');
    process.exit(0);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const seenSlugs = new Set<string>();

  for (const leader of leaders) {
    const slug = (leader?.slug || '').toString().trim();
    if (!slug) {
      skipped += 1;
      continue;
    }
    if (seenSlugs.has(slug)) {
      skipped += 1;
      continue;
    }
    seenSlugs.add(slug);

    const payload = {
      slug,
      name: leader?.name || '',
      designation: leader?.designation || '',
      category: normalizeCategory(leader?.category),
      state: leader?.state || '',
      constituency: leader?.constituency || '',
      party: leader?.party || '',
      gender: leader?.gender || '',
      bio: leader?.bio || '',
      education: leader?.education || '',
      profession: leader?.profession || '',
      image: leader?.image || '',
      cover_image: leader?.cover_image || '',
      featured: typeof leader?.featured === 'boolean' ? leader.featured : false,
      status: normalizeStatus(leader?.status),
      official_profile_url: leader?.official_profile_url || leader?.website || '',
      source_name: leader?.source_name || '',
      parliament_member_id: leader?.parliament_member_id || ''
    };

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

  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

main().catch((error) => {
  console.error('Importer failed:', error);
  process.exit(1);
});
