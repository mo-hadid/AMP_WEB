#!/usr/bin/env node
// Builds dist/ from content/*.json, src/pages.mjs and public/. No dependencies.
// Cloudflare Pages: build command `node build.mjs`, output directory `dist`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, esc } from './src/pages.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const site = read('content/site.json');
const data = { properties: read('content/properties.json'), projects: read('content/projects.json') };
const DIST = path.join(ROOT, 'dist');
const year = new Date().getFullYear();

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

const NAV = [['sell', '/sell/', 'Sell to us'], ['properties', '/properties/', 'Properties'], ['contractors', '/contractors/', 'Contractors'], ['about', '/about/', 'About']];
const header = cur => `<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap">
  <a class="brand" href="/" aria-label="${esc(site.name)} home"><img src="/images/logo-640.png" alt="${esc(site.name)}" width="640" height="292"></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav" aria-label="Main">${NAV.map(([k, h, t]) => `<a href="${h}"${cur === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}<a class="btn primary" href="/contact/"${cur === 'contact' ? ' aria-current="page"' : ''}>Contact us</a></nav>
</div></header>`;

const footer = `<footer class="site-footer"><div class="wrap">
  <div class="cols">
    <div><img src="/images/logo-640.png" alt="${esc(site.name)}" width="640" height="292" loading="lazy"><p class="muted small">${esc(site.tagline)}</p></div>
    <div><h3>Work with us</h3><ul><li><a href="/sell/">Sell your property</a></li><li><a href="/properties/">Properties for sale</a></li><li><a href="/contractors/">Contractors</a></li><li><a href="/contact/">Request a quote</a></li></ul></div>
    <div><h3>Company</h3><ul><li><a href="/about/">About</a></li>${site.team.map(m => `<li><a href="mailto:${esc(m.email)}">${esc(m.name)}</a></li>`).join('')}<li><a href="/privacy/">Privacy</a></li></ul></div>
    <div><h3>Contact</h3><ul><li><a href="mailto:${esc(site.emails.general)}">${esc(site.emails.general)}</a></li><li><a href="mailto:${esc(site.emails.contractors)}">${esc(site.emails.contractors)}</a></li>${site.phone ? `<li><a href="tel:${esc(site.phone.replace(/[^0-9+]/g, ''))}">${esc(site.phone)}</a></li>` : ''}<li>${esc(site.city)}, ${esc(site.state)}</li></ul></div>
  </div>
  <div class="legal"><span>&copy; ${year} ${esc(site.legalName)}. All rights reserved.</span><span>We buy and sell property for our own account and do not act as real-estate agents for others. Equal Housing Opportunity.</span></div>
</div></footer>`;

const org = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': site.url + '/#org',
  name: site.legalName, alternateName: site.name, url: site.url, logo: site.url + '/images/icon-512.png',
  description: 'Small real-estate company that buys, improves and sells land and homes in Central Florida.',
  email: site.emails.general, ...(site.phone ? { telephone: site.phone } : {}),
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.state, addressCountry: 'US' },
  areaServed: [{ '@type': 'AdministrativeArea', name: 'Polk County, Florida' }, { '@type': 'State', name: 'Florida' }],
  founder: site.team.map(m => ({ '@type': 'Person', name: m.name, jobTitle: m.title, ...(m.linkedin ? { sameAs: m.linkedin } : {}) })),
};

function render(p) {
  const canonical = site.url + (p.path === '/404.html' ? '/' : p.path);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${site.url}/images/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#4ADD97">
<link rel="icon" href="/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/fraunces-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css">
${p.path === '/' ? `<script type="application/ld+json">${JSON.stringify(org)}</script>` : ''}
${site.turnstileSiteKey && /js-form/.test(p.html) ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''}
<script src="/js/main.js" defer></script>
</head>
<body>
${header(p.nav)}
<main id="main">${p.html}</main>
${footer}
</body>
</html>
`;
}

const urls = [];
for (const p of pages) {
  p.html = p.body(site, data);
  const out = p.file ? path.join(DIST, p.file) : path.join(DIST, p.path, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(p));
  if (!p.noindex) urls.push(p.path);
}
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages into dist/ (${data.properties.items.length} listings, ${data.projects.items.length} open projects).`);
