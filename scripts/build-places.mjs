import { mkdir, writeFile } from 'node:fs/promises';
import { places, districts, sources, photos, photoSource } from '../dist/data.js';
import { publicOrigin, placePath, directions, escapeHtml as esc } from '../dist/place-guide.js';

const reviewed = '2026-11-20';
const guide = {
  'idrakpur-fort': {
    arrival: 'Start in Munshiganj town near the old court. If coming by road through Muktarpur, continue by rickshaw or auto-rickshaw to the fort.',
    access: 'The Tourism Board lists the fort, but current gate hours and interior access could not be verified. Ask locally before travelling.',
    refs: ['fort'],
  },
  'baba-adam-mosque': {
    arrival: 'From Munshiganj town, take a local rickshaw toward Rampal and ask for Baba Adam Shahid’s mosque beside the shrine in Qadi Kasba.',
    access: 'Active place of worship. Public visiting hours are unverified. Ask the caretaker about entry outside prayer times and before taking photographs.',
    refs: ['mosqueVisit'],
  },
  sonarang: {
    arrival: 'From Munshiganj town, travel via Tongibari Bazar to Sonarang village. Locally, ask for Sonarang Jora Moth.',
    access: 'Published opening hours and interior access are unverified. Check the approach locally and visit in daylight.',
    refs: ['sonarangVisit'],
  },
  nateshwar: {
    arrival: 'Use the Nateshwar Deul pin in Tongibari. Ask locally which entrance currently serves visitors.',
    access: 'Excavation and preservation work can affect access. Confirm locally before travelling.',
    refs: ['nateshwarPhotos'],
    photoSource: 'nateshwarPhotos',
  },
  'bikrampur-museum': {
    arrival: 'Head to Balasur near Bhagyakul in Sreenagar and ask for the museum at the former Jadunath Roy estate.',
    access: 'Current opening hours and admission could not be confirmed from an official venue announcement. Check with the museum before leaving.',
    refs: ['balasurPhotos'],
    photoSource: 'balasurPhotos',
  },
  bhagyakul: {
    arrival: 'Start at the Bikrampur Museum in Balasur. Ask locally which buildings belong to the heritage compound and which are private homes.',
    access: 'Public access varies by property. Ask for permission before entering or photographing private compounds.',
    refs: ['balasurPhotos'],
    photoSource: 'balasurPhotos',
  },
  'arial-beel': {
    arrival: 'Use the Sreenagar approach. The pin marks the wetland area. Ask locally for an accessible landing or public field approach.',
    access: 'Routes and boat availability change with water levels. Confirm a suitable landing before making a monsoon trip.',
    refs: ['beelSeason'],
  },
  mawa: {
    arrival: 'Approach via the Dhaka–Mawa corridor and use the map pin for the old ferry landing.',
    access: 'Use public riverfront approaches. Confirm the condition of the banks locally and keep away from unstable edges.',
    refs: ['water'],
  },
};
const link = (href, label, cls = 'text-link') => `<a class="${cls}" href="${esc(href)}">${esc(label)}</a>`;
const outbound = (href, label, cls = 'text-link') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

function picture(id, lead = false) {
  const [, author, caption, , license, licenseUrl] = photos[id];
  return `<figure><img src="/assets/${id}.webp" srcset="/assets/${id}-sm.webp 620w, /assets/${id}.webp 1060w" sizes="(max-width: 760px) 92vw, ${lead ? '50vw' : '28vw'}" ${lead ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" alt="${esc(caption)}"><figcaption>${esc(caption)} · ${outbound(photoSource(id), author)} · ${outbound(licenseUrl || 'https://creativecommons.org/licenses/by-sa/4.0/', license || 'CC BY-SA 4.0')} · resized</figcaption></figure>`;
}

function page(place) {
  const [district] = districts[place.district];
  const info = guide[place.id] || {};
  const image = place.image || 'fort';
  const title = place.name + ' · Munshiganj';
  const canonical = publicOrigin + placePath(place);
  const location = place.location || district + ', Munshiganj';
  const citations = [...new Set([...place.refs, ...(info.refs || [])])];
  const related = places.filter(other => other.id !== place.id && other.district === place.district).slice(0, 3);
  const gallery = (place.gallery || []).filter(id => id !== place.image);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(place.intro)}">
  <meta name="theme-color" content="#f8f5eb">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(place.intro)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${publicOrigin}/assets/${image}.webp">
  <meta property="og:image:alt" content="${esc(photos[image][2])}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48 64x64">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <link rel="stylesheet" href="/assets/fonts/fonts.css">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="place-page">
  <a href="#main" class="skip">Skip to content</a>
  <header class="header"><div class="nav-shell">
    <a class="brand" href="/" aria-label="Munshiganj home"><img src="/assets/mark.svg" width="43" height="43" alt=""><span>Munshiganj<small lang="bn">মুন্সীগঞ্জ</small></span></a>
    <nav class="place-page-nav" aria-label="Main navigation"><a href="/#places">Places</a><a href="/#map-section">Map</a><a href="/#travel">Travel Guide</a></nav>
  </div></header>
  <main id="main" class="wrap place-page-main">
    <nav aria-label="Breadcrumb" class="place-breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#places">Places</a><span aria-hidden="true">/</span><span aria-current="page">${esc(place.name)}</span></nav>
    <article>
      <div class="landmark-header${place.image ? '' : ' text-only'}">
        <div>
          <p class="eyebrow"><span></span> ${esc(place.category)} · ${esc(district)}</p>
          <h1>${esc(place.name)}</h1>
          <p lang="bn" class="place-bengali">${esc(place.bn)}</p>
          <p class="place-lead">${esc(place.intro)}</p>
          <div class="place-links">${outbound(directions(place), 'Get directions', 'button button-green')}${link('#visit', 'Visiting information', 'button button-line')}</div>
        </div>
        ${place.image ? picture(place.image, true) : ''}
      </div>
      <section id="visit" class="visit-information" aria-labelledby="visit-title">
        <h2 id="visit-title">Plan your visit</h2>
        <dl>
          <div><dt>Location</dt><dd>${esc(location)}</dd></div>
          <div><dt>How to get there</dt><dd>${esc(info.arrival || 'Use the directions link for the site or its nearest named approach. Confirm the final stretch locally.')}</dd></div>
          <div><dt>Access and opening hours</dt><dd>${esc(info.access || place.visit + ' Current opening details are unverified.')}</dd></div>
        </dl>
        ${info.refs ? `<div class="place-links">${info.refs.map(id => outbound(sources[id][1], sources[id][0])).join('')}</div><p class="review-date">Published sources reviewed <time datetime="${reviewed}">20 November 2026</time>.</p>` : ''}
      </section>
      <div class="landmark-body">
        <div><p class="eyebrow"><span></span> ${esc(place.period)}</p><h2>About this place</h2><p>${esc(place.body)}</p><p>${esc(place.visit)}</p>${info.photoSource ? outbound(sources[info.photoSource][1], 'See photographs in the source article') : ''}</div>
        <aside><h3>Sources</h3><ul>${citations.map(id => `<li>${outbound(sources[id][1], sources[id][0])}</li>`).join('')}${place.coordinateSource ? `<li>${outbound(place.coordinateSource, 'Map location source')}</li>` : ''}</ul></aside>
      </div>
      ${gallery.length ? `<section class="landmark-gallery" aria-label="More photographs">${gallery.map(id => picture(id)).join('')}</section>` : ''}
    </article>
    ${related.length ? `<section class="landmark-related"><h2>Explore nearby</h2><div class="place-links">${related.map(other => link(placePath(other), other.name, 'button button-line')).join('')}</div></section>` : ''}
  </main>
  <footer class="footer"><div class="wrap footer-base"><span>Munshiganj · Echoes of Bikrampur</span><a href="/#sources">Sources and photo credits</a></div></footer>
</body></html>
`;
}

for (const place of places) {
  const dir = new URL('../dist' + placePath(place), import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), page(place));
}
const urls = ['/', ...places.map(placePath)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${publicOrigin}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('../dist/sitemap.xml', import.meta.url), sitemap);
await writeFile(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${publicOrigin}/sitemap.xml\n`);
