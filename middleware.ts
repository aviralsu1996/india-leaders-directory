/**
 * Vercel Edge Middleware — serves real Open Graph/Twitter Card meta tags for
 * leader profile pages to known social-media crawler user agents only.
 *
 * Why this exists: this app is a client-rendered Vite SPA with no
 * server-side rendering. The meta tags App.tsx injects on the client
 * (title, og:*, twitter:*, JSON-LD) work fine for Google's crawler (which
 * executes JavaScript), but Facebook/Twitter/WhatsApp/LinkedIn/Slack link
 * previews do NOT run JavaScript — they only ever see index.html's static
 * <head>, so a shared /leaders/<slug> link would show a generic preview
 * with no leader-specific title/image.
 *
 * This middleware intercepts ONLY requests from those known crawler user
 * agents on /leaders/:slug and returns a small, real HTML document with the
 * correct per-leader meta tags fetched directly from Supabase. Every other
 * visitor (regular browsers, Googlebot) is passed through untouched via
 * next() — the SPA behaves exactly as before for them.
 *
 * UNVERIFIED: written against Vercel's documented Edge Middleware /
 * @vercel/edge API; this sandbox has no live Vercel deployment to test
 * against. Verify the crawler preview actually renders correctly (e.g. via
 * Facebook's Sharing Debugger / Twitter's Card Validator) after deploying.
 */
import { next } from '@vercel/edge';

export const config = {
  matcher: '/leaders/:slug*',
};

const CRAWLER_USER_AGENT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Discordbot/i,
  /Pinterest/i,
];

function isSocialCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!isSocialCrawler(userAgent)) {
    return next();
  }

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/leaders\/([^/]+)\/?$/);
  if (!match) return next();
  const slug = decodeURIComponent(match[1]);

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return next();

  try {
    const restUrl =
      `${supabaseUrl}/rest/v1/leaders` +
      `?slug=eq.${encodeURIComponent(slug)}&status=eq.Published` +
      `&select=name,designation,party,constituency,state,bio,image&limit=1`;

    const res = await fetch(restUrl, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (!res.ok) return next();

    const rows = (await res.json()) as Array<Record<string, string>>;
    const leader = rows?.[0];
    if (!leader) return next();

    const title = `${leader.name} - ${leader.designation} (${leader.party}, ${leader.constituency}) | Verified Public Profile`;
    const description = `Official public dossier for ${leader.name}, serving as ${leader.designation} representing ${leader.constituency}, ${leader.state}.`;
    const image = leader.image || `${url.origin}/favicon.svg`;
    const canonicalUrl = `${url.origin}/leaders/${encodeURIComponent(slug)}`;

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="India Leaders Directory">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>${escapeHtml(title)}</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch {
    return next();
  }
}
