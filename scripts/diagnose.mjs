/**
 * Supabase Production Diagnostic Script
 * Tests all 8 verification points using direct API calls.
 * Uses only native fetch (Node 18+) — no extra deps required.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

// --- Parse .env manually ---
const envRaw = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = val;
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// --- Helpers ---
function pass(msg)  { console.log(`  ✅ PASS: ${msg}`); }
function fail(msg)  { console.log(`  ❌ FAIL: ${msg}`); }
function info(msg)  { console.log(`  ℹ️  INFO: ${msg}`); }
function warn(msg)  { console.log(`  ⚠️  WARN: ${msg}`); }
function head(msg)  { console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`); }

async function supabaseRequest(path, key, { method = 'GET', body, prefer } = {}) {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (prefer) headers['Prefer'] = prefer;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data, headers: Object.fromEntries(res.headers.entries()) };
}

// ============================================================
// CHECK 1: Is Supabase connected?
// ============================================================
async function check1_connectivity() {
  head('CHECK 1: Supabase Connectivity');
  if (!SUPABASE_URL || !ANON_KEY) {
    fail('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env');
    return false;
  }
  info(`URL: ${SUPABASE_URL}`);
  info(`ANON_KEY: ${ANON_KEY.slice(0, 20)}...`);
  try {
    // Hit the Supabase REST root — 200/400/401 all mean the server is reachable
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    });
    info(`HTTP Status from ${SUPABASE_URL}/rest/v1/ → ${res.status}`);
    if (res.status >= 200 && res.status < 500) {
      pass(`Supabase REST API is reachable (HTTP ${res.status})`);
      return true;
    } else {
      fail(`Server-side error: HTTP ${res.status}`);
      return false;
    }
  } catch (e) {
    fail(`Network error: ${e.message}`);
    return false;
  }
}

// ============================================================
// CHECK 2: Verify anon key validity
// ============================================================
async function check2_envVars() {
  head('CHECK 2: Environment Variable Validity');
  // Decode JWT claims to verify it is for the right project
  try {
    const parts = ANON_KEY.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      info(`JWT role: ${payload.role}`);
      info(`JWT ref:  ${payload.ref || '(no ref)'}`);
      info(`JWT iss:  ${payload.iss || '(no iss)'}`);
      const projectRef = SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1];
      info(`URL project ref: ${projectRef}`);
      if (payload.ref && payload.ref !== projectRef) {
        fail(`Anon key ref "${payload.ref}" does NOT match URL project ref "${projectRef}"`);
        return false;
      }
      pass(`Anon key is valid for project ${projectRef}`);
    } else {
      warn('ANON_KEY does not look like a standard JWT (3 parts). It may be a new-style Supabase publishable key.');
      info('Will verify via actual API call instead.');
      // new-style "sb_publishable_..." keys are validated via API call
      const r = await supabaseRequest('leaders?limit=1', ANON_KEY);
      if (r.status === 401) {
        fail(`Anon key rejected by Supabase (401 Unauthorized). Key may be wrong.`);
        return false;
      }
      pass(`Anon key accepted by Supabase (status ${r.status})`);
    }
    return true;
  } catch (e) {
    fail(`Could not decode anon key: ${e.message}`);
    return false;
  }
}

// ============================================================
// CHECK 3: Does the leaders table contain records?
// ============================================================
async function check3_tableRecords() {
  head('CHECK 3: Leaders Table Record Count');
  // Use service role to bypass RLS entirely
  const r = await supabaseRequest('leaders?select=id,slug,name,status&limit=200', SERVICE_ROLE_KEY, {
    prefer: 'count=exact'
  });
  info(`HTTP ${r.status} from leaders table (service role)`);
  if (!r.ok) {
    fail(`Could not query leaders table: ${JSON.stringify(r.data)}`);
    return [];
  }
  const rows = Array.isArray(r.data) ? r.data : [];
  info(`Total rows returned: ${rows.length}`);
  if (rows.length === 0) {
    fail('leaders table is EMPTY. No records exist.');
  } else {
    pass(`leaders table has ${rows.length} records`);
    const sample = rows.slice(0, 5);
    sample.forEach(row => info(`  → id=${row.id} | slug="${row.slug}" | name="${row.name}" | status="${row.status}"`));
    if (rows.length > 5) info(`  ... and ${rows.length - 5} more`);
  }
  return rows;
}

// ============================================================
// CHECK 4: Are RLS policies blocking anon reads?
// ============================================================
async function check4_rlsPolicies(allRows) {
  head('CHECK 4: RLS Policy — Anon Read');
  // Use ANON key — should only see Published records
  const r = await supabaseRequest('leaders?select=id,slug,name,status&limit=200', ANON_KEY);
  info(`HTTP ${r.status} (anon key)`);
  if (!r.ok) {
    fail(`Anon read BLOCKED: ${JSON.stringify(r.data)}`);
    return;
  }
  const anonRows = Array.isArray(r.data) ? r.data : [];
  info(`Anon key can see ${anonRows.length} rows`);

  const published = allRows.filter(r => r.status === 'Published');
  const draft = allRows.filter(r => r.status === 'Draft');
  info(`Service role sees: ${published.length} Published, ${draft.length} Draft`);

  if (anonRows.length === 0 && published.length > 0) {
    fail('RLS IS BLOCKING anon reads even for Published leaders!');
    warn('Check that the policy "Allow public read access to Published leaders" is active.');
  } else if (anonRows.length === 0 && published.length === 0) {
    warn('Anon sees 0 rows — but that is because 0 leaders have status=Published');
    fail('Fix: set status="Published" on your leaders rows.');
  } else {
    pass(`Anon key can read ${anonRows.length} Published leaders — RLS is working correctly`);
  }
  return anonRows;
}

// ============================================================
// CHECK 5: Slug matching
// ============================================================
async function check5_slugMatch(allRows) {
  head('CHECK 5: Slug Stored in DB vs URL Slugs');
  if (allRows.length === 0) {
    warn('No rows to check slugs against');
    return;
  }
  let slugProblems = 0;
  for (const row of allRows) {
    const slug = row.slug || '';
    const expected = slug.toLowerCase().trim();
    if (slug !== expected) {
      fail(`Leader "${row.name}" has slug "${slug}" but URL would use "${expected}" — CASE MISMATCH`);
      slugProblems++;
    } else {
      // Check for URL-safe characters
      if (/[^a-z0-9\-]/.test(slug)) {
        warn(`Leader "${row.name}" slug "${slug}" contains special chars that may break URL routing`);
        slugProblems++;
      }
    }
  }
  if (slugProblems === 0) {
    pass(`All ${allRows.length} slugs are lowercase and URL-safe`);
  }
  // Show first few slugs
  info('Sample slugs in DB:');
  allRows.slice(0, 8).forEach(r => info(`  "${r.slug}"`));
}

// ============================================================
// CHECK 6: Does getLeaderBySlug() return a row?
// ============================================================
async function check6_getBySlug(allRows) {
  head('CHECK 6: getLeaderBySlug() — Direct API Test');
  if (allRows.length === 0) {
    warn('No rows — cannot test slug lookup');
    return;
  }
  // Pick the first slug to test
  const testSlug = allRows[0].slug;
  info(`Testing slug: "${testSlug}"`);

  // Test with anon key (mimics frontend)
  const r = await supabaseRequest(
    `leaders?or=(slug.eq.${testSlug})&select=*`,
    ANON_KEY,
    { prefer: 'return=representation' }
  );
  info(`Anon key → HTTP ${r.status}`);
  if (!r.ok) {
    fail(`getLeaderBySlug("${testSlug}") returned error: ${JSON.stringify(r.data)}`);
    return;
  }
  const rows = Array.isArray(r.data) ? r.data : [];
  if (rows.length === 0) {
    fail(`getLeaderBySlug("${testSlug}") returned 0 rows with anon key`);
    warn('This slug exists in DB but is invisible to anon — likely status is not Published');
    // Verify status
    const row = allRows.find(r => r.slug === testSlug);
    if (row) info(`DB record status: "${row.status}"`);
  } else {
    pass(`getLeaderBySlug("${testSlug}") returned 1 row — data flows correctly`);
    info(`  name: "${rows[0].name}", status: "${rows[0].status}"`);
  }

  // Also test with service role to distinguish RLS vs "not found"
  const rSvc = await supabaseRequest(
    `leaders?or=(slug.eq.${testSlug})&select=*`,
    SERVICE_ROLE_KEY
  );
  const rowsSvc = Array.isArray(rSvc.data) ? rSvc.data : [];
  info(`Service role → HTTP ${rSvc.status}, rows: ${rowsSvc.length}`);
}

// ============================================================
// CHECK 7: Browser receives 200 from Supabase REST API
// ============================================================
async function check7_httpResponse() {
  head('CHECK 7: HTTP Response Codes from Supabase REST');
  const endpoints = [
    { label: 'GET /leaders (anon)',   path: 'leaders?limit=1',   key: ANON_KEY },
    { label: 'GET /leaders (service)',path: 'leaders?limit=1',   key: SERVICE_ROLE_KEY },
  ];
  for (const ep of endpoints) {
    const r = await supabaseRequest(ep.path, ep.key);
    if (r.status === 200) {
      pass(`${ep.label} → ${r.status} OK`);
    } else {
      fail(`${ep.label} → ${r.status}: ${JSON.stringify(r.data)}`);
    }
  }
}

// ============================================================
// CHECK 8: CORS / Authentication failures
// ============================================================
async function check8_corsAuth() {
  head('CHECK 8: CORS & Authentication');
  // Hit with a preflight-like request (OPTIONS)
  try {
    const corsRes = await fetch(`${SUPABASE_URL}/rest/v1/leaders?limit=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'apikey,authorization',
      }
    });
    info(`OPTIONS preflight → HTTP ${corsRes.status}`);
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const allowHeaders = corsRes.headers.get('access-control-allow-headers');
    info(`Access-Control-Allow-Origin: ${allowOrigin}`);
    info(`Access-Control-Allow-Headers: ${allowHeaders}`);
    if (allowOrigin === '*' || allowOrigin?.includes('localhost')) {
      pass('CORS headers allow localhost origin — no CORS block');
    } else {
      warn(`CORS: Access-Control-Allow-Origin = "${allowOrigin}" — may block browser requests`);
    }
  } catch (e) {
    warn(`OPTIONS request failed: ${e.message} (this may be normal in Node.js)`);
  }

  // Test 401 scenario — no key provided
  const noKeyRes = await fetch(`${SUPABASE_URL}/rest/v1/leaders?limit=1`, {
    headers: { 'Accept': 'application/json' }
  });
  info(`Request with NO API key → HTTP ${noKeyRes.status}`);
  if (noKeyRes.status === 401) {
    pass('Supabase correctly returns 401 when no API key is provided');
  } else {
    info(`Got ${noKeyRes.status} without API key (may be OK if table is public)`);
  }

  // Test invalid key → should get 401
  const badKeyRes = await fetch(`${SUPABASE_URL}/rest/v1/leaders?limit=1`, {
    headers: {
      'apikey': 'invalid-key-test',
      'Authorization': 'Bearer invalid-key-test'
    }
  });
  info(`Request with INVALID key → HTTP ${badKeyRes.status}`);
  if (badKeyRes.status === 401) {
    pass('Supabase correctly rejects invalid API keys with 401');
  } else {
    info(`Got ${badKeyRes.status} with invalid key`);
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('\n🔍 SUPABASE PRODUCTION DIAGNOSTIC REPORT');
  console.log(`   Project: ${SUPABASE_URL}`);
  console.log(`   Date:    ${new Date().toISOString()}`);

  const connected = await check1_connectivity();
  if (!connected) {
    console.log('\n❌ Supabase is unreachable. Cannot continue diagnostics.');
    process.exit(1);
  }

  await check2_envVars();
  const allRows = await check3_tableRecords();
  const anonRows = await check4_rlsPolicies(allRows);
  await check5_slugMatch(allRows);
  await check6_getBySlug(allRows);
  await check7_httpResponse();
  await check8_corsAuth();

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60));

  // Summary
  const totalInDB = allRows.length;
  const publishedInDB = allRows.filter(r => r.status === 'Published').length;
  const draftInDB = allRows.filter(r => r.status === 'Draft').length;
  const anonVisible = Array.isArray(anonRows) ? anonRows.length : 0;

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total leaders in DB (service role): ${totalInDB}`);
  console.log(`   Published:                          ${publishedInDB}`);
  console.log(`   Draft:                              ${draftInDB}`);
  console.log(`   Visible to anon (frontend):         ${anonVisible}`);

  if (totalInDB === 0) {
    console.log('\n🚨 ROOT CAUSE: leaders table is EMPTY. No data has been inserted into Supabase.');
  } else if (publishedInDB === 0) {
    console.log('\n🚨 ROOT CAUSE: All leaders are in Draft status. RLS blocks anon reads of Draft records.');
    console.log('   FIX: Run UPDATE public.leaders SET status = \'Published\' WHERE status = \'Draft\';');
  } else if (anonVisible === 0) {
    console.log('\n🚨 ROOT CAUSE: RLS is blocking anon reads even though Published records exist.');
    console.log('   FIX: Re-apply the RLS policy in Supabase Dashboard.');
  } else {
    console.log('\n✅ Data pipeline appears healthy. Frontend should receive data from Supabase directly.');
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
