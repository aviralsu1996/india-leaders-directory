/**
 * Build-time sitemap.xml + robots.txt generator.
 *
 * This is a client-rendered Vite SPA with no server-side rendering, so there
 * is no per-route server to generate these dynamically on request — they're
 * written as static files into public/ before `vite build` runs (wired via
 * the "prebuild" npm script), and Vite copies public/ into the final build
 * output untouched.
 *
 * Run standalone: `npx tsx scripts/generate-sitemap.ts`
 * SITE_URL must be set to the production domain (e.g. in Vercel's env vars)
 * for the URLs inside the sitemap to be correct; without it, this generates
 * a sitemap with only static routes and warns rather than failing the build.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STATIC_ROUTES = ['/', '/search', '/about', '/contact'];

async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
  } catch {
    // dotenv not available or no .env file — fall back to whatever is already in process.env
  }
}

async function fetchPublishedLeaderSlugs(): Promise<string[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || !url.startsWith('https://')) {
    console.warn('[generate-sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not configured — sitemap will only include static routes.');
    return [];
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.from('leaders').select('slug').eq('status', 'Published');

  if (error) {
    console.warn('[generate-sitemap] Failed to fetch leaders from Supabase — sitemap will only include static routes:', error.message);
    return [];
  }

  return (data || []).map((row: { slug: string }) => row.slug).filter(Boolean);
}

function buildSitemapXml(siteUrl: string, leaderSlugs: string[]): string {
  const now = new Date().toISOString();
  const urls = [
    ...STATIC_ROUTES.map((route) => ({ loc: `${siteUrl}${route}`, priority: route === '/' ? '1.0' : '0.7' })),
    ...leaderSlugs.map((slug) => ({ loc: `${siteUrl}/leaders/${encodeURIComponent(slug)}`, priority: '0.8' })),
  ];

  const entries = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildRobotsTxt(siteUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

async function main() {
  await loadEnv();

  const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
  if (!siteUrl) {
    console.warn(
      '[generate-sitemap] SITE_URL is not set — writing sitemap.xml/robots.txt with a placeholder domain. ' +
      'Set SITE_URL (e.g. in Vercel project env vars) to your production domain for these to be correct.'
    );
  }
  const effectiveSiteUrl = siteUrl || 'https://example.com';

  const leaderSlugs = await fetchPublishedLeaderSlugs();

  const publicDir = path.resolve(__dirname, '../public');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemapXml(effectiveSiteUrl, leaderSlugs), 'utf-8');
  await fs.writeFile(path.join(publicDir, 'robots.txt'), buildRobotsTxt(effectiveSiteUrl), 'utf-8');

  console.log(`[generate-sitemap] Wrote sitemap.xml with ${STATIC_ROUTES.length + leaderSlugs.length} URLs (${leaderSlugs.length} leaders) and robots.txt.`);
}

main().catch((err) => {
  console.error('[generate-sitemap] Failed:', err);
  // Never fail the production build over a sitemap — log and continue.
  process.exit(0);
});
