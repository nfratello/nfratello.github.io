// scripts/build-brief-card.js
//
// P42/P44: regenerates the front door "This week" Brief card's date,
// headline, image, top three stories and link in Frontier_Home.html and
// index.html, from the Brief repo's public issues/issues.json manifest.
// Never hand-edit the card's date/headline/image/story-list/link — this
// script is the only thing that writes them. Run:
//   node scripts/build-brief-card.js
//
// Normal mode: the newest send date has an "All Industries" issue -> use its
// title, its k3 (top 3) story lines, its own issue URL, and its own hero
// image (event art, e.g. Ignite, only when that issue IS the event issue).
// Fallback mode (P44): the newest send date has no "All Industries" issue
// (that week went out purely by industry) -> headline becomes "This week's
// Industry Editions", the link points at /microsoft-brief/brief/latest/
// (which itself renders a "Choose your edition" list for that exact week),
// the three stories are the first three editions in front-door tile order
// (Hospitality & Travel first, Federal/Defense never shown — both were
// removed from the front door in v0.4), and the image is the hero photo of
// whichever edition is first in that list.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ISSUES_URL = 'https://nfratello.github.io/microsoft-brief/issues/issues.json';
const BRIEF_ASSET_BASE = 'https://nfratello.github.io/microsoft-brief/assets/img/';
const FILES = ['Frontier_Home.html', 'index.html'];

const WKEB = '<span class="wkeb" style="color:#2563eb">THE BRIEF | THIS WEEK</span>';
const ARTICLE_START = '<article class="wkcard"><img class="wkimg"';

// Same 10 editions, same order, as the front door's own "Start with your
// industry" tile grid below this card (Hospitality & Travel first). Federal
// Government and Defense Industry are deliberately absent — removed from
// the front door in v0.4 (P44) — so the card must never show either, even
// in a week where one of them has the alphabetically-earliest issue.
const FRONT_DOOR_ORDER = [
  'Hospitality & Travel',
  'Manufacturing & Mobility',
  'High Tech & Software',
  'Telecom & Media',
  'Healthcare & Life Sciences',
  'Financial Services',
  'Retail & Consumer Goods',
  'Energy & Utilities',
  'Professional Services',
  'State, Local & Education',
];

// Local, Hub-repo-hosted event art — used only when the selected All
// Industries issue IS that event's own issue (matched by URL slug or kind).
// Every other issue (ordinary weekly issues and the fallback view) uses a
// real, text-free, people-first photo instead (see EDITION_IMAGE below).
const EVENT_ART = {
  ignite: { src: 'assets/img/Brief_Card_Art_Ignite.jpg', alt: 'Microsoft logo artwork from Ignite 2026' },
};

// Text-free, people-first "wide" hero photo already published per edition
// on that edition's own Brief page, reused here via a cross-repo URL (no
// file duplication). `pos` reuses that same photo's own tuned CSS
// object-position from the edition page's hero so people stay in view.
const EDITION_IMAGE = {
  'Hospitality & Travel': { file: 'hero-hospitality-wide.jpg', pos: '50% 40%', alt: 'People at work in travel' },
  'Manufacturing & Mobility': { file: 'ind-manufacturing-wide.jpg', pos: '50% 20%', alt: 'People at work in manufacturing' },
  'High Tech & Software': { file: 'ind-hightech-wide.jpg', pos: '50% 20%', alt: 'People at work in tech' },
  'Telecom & Media': { file: 'ind-telecom-wide.jpg', pos: '50% 25%', alt: 'People at work in telecom and media' },
  'Healthcare & Life Sciences': { file: 'ind-healthcare-wide.jpg', pos: '50% 20%', alt: 'People at work in healthcare' },
  'Financial Services': { file: 'ind-finserv-wide.jpg', pos: '50% 20%', alt: 'People at work in financial services' },
  'Retail & Consumer Goods': { file: 'ind-retail-wide.jpg', pos: '50% 20%', alt: 'People at work in retail' },
  'Energy & Utilities': { file: 'ind-energy-wide.jpg', pos: '50% 20%', alt: 'People at work in energy' },
  'Professional Services': { file: 'ind-profserv-wide.jpg', pos: '50% 10%', alt: 'People at work in professional services' },
  'State, Local & Education': { file: 'ind-sle-wide.jpg', pos: '50% 20%', alt: 'People at work in public sector' },
};

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#x27;')
    .replace(/"/g, '&quot;');
}

async function fetchIssues() {
  const res = await fetch(ISSUES_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${ISSUES_URL}: HTTP ${res.status}`);
  return res.json();
}

function eventArtFor(issue) {
  const haystack = `${issue.url} ${issue.kind || ''}`.toLowerCase();
  const key = Object.keys(EVENT_ART).find((k) => haystack.includes(k));
  return key ? EVENT_ART[key] : null;
}

function pickCardData(issues) {
  const allDates = [...new Set(issues.map((i) => i.date))].sort();
  const newestDate = allDates[allDates.length - 1];
  const allIssuesAtNewest = issues.filter((i) => i.edition === 'All Industries' && i.date === newestDate);

  if (allIssuesAtNewest.length) {
    // Prefer the non-executive edition if more than one shares the date.
    const issue = allIssuesAtNewest.find((i) => !i.exec) || allIssuesAtNewest[0];
    const art = eventArtFor(issue);
    const image = art
      ? { src: art.src, alt: art.alt, pos: '50% 50%', external: false }
      : {
          src: BRIEF_ASSET_BASE + issue.img,
          // No separately-curated card caption exists for this image in the
          // Brief repo; the issue's own headline is the closest accurate,
          // human-written description of what that week's Brief shows.
          alt: issue.title,
          pos: '50% 30%',
          external: true,
        };
    return {
      mode: 'all-industries-issue',
      date: issue.week || `Week of ${issue.nice}`,
      headline: issue.title,
      stories: (issue.k3 || []).slice(0, 3),
      link: `https://nfratello.github.io/microsoft-brief/issues/${issue.url}`,
      image,
    };
  }

  const thisWeek = issues.filter((i) => i.date === newestDate);
  const ordered = FRONT_DOOR_ORDER
    .map((edition) => thisWeek.find((i) => i.edition === edition))
    .filter(Boolean);
  const top3 = ordered.slice(0, 3);
  const first = top3[0];
  const img = first ? EDITION_IMAGE[first.edition] : null;
  const image = img
    ? { src: BRIEF_ASSET_BASE + img.file, alt: img.alt, pos: img.pos, external: true }
    : { src: 'assets/img/Brief_Card_Art_Ignite.jpg', alt: 'Microsoft Brief artwork', pos: '50% 50%', external: false };

  return {
    mode: 'choose-your-edition-fallback',
    date: (first && first.week) || `Week of ${newestDate}`,
    headline: "This week's Industry Editions",
    stories: top3.map((i) => `${i.edition}: ${i.title}`),
    link: 'https://nfratello.github.io/microsoft-brief/brief/latest/',
    image,
  };
}

function buildCard(html, data) {
  const start = html.indexOf(ARTICLE_START);
  if (start === -1) throw new Error('Could not find the Brief wkcard start marker.');
  const end = html.indexOf('</article>', start) + '</article>'.length;
  if (end === -1) throw new Error('Could not find the Brief wkcard end marker.');
  let card = html.slice(start, end);
  const original = card;

  // 1. Image: the <img class="wkimg" ...> tag (src + alt + inline object-position).
  card = card.replace(
    /<img class="wkimg"[^>]*>/,
    `<img class="wkimg" src="${escHtml(data.image.src)}" width="1280" height="720" loading="lazy" style="object-position:${data.image.pos}" alt="${escHtml(data.image.alt)}">`
  );

  // 2. Date: insert/replace the <span class="wkdate"> right after the eyebrow.
  const wkebIdx = card.indexOf(WKEB);
  if (wkebIdx === -1) throw new Error('Could not find the Brief wkcard eyebrow span.');
  const afterWkeb = wkebIdx + WKEB.length;
  const dateSpan = `<span class="wkdate">${escHtml(data.date)}</span>`;
  const existingDateMatch = card.slice(afterWkeb).match(/^<span class="wkdate">[^<]*<\/span>/);
  if (existingDateMatch) {
    card = card.slice(0, afterWkeb) + dateSpan + card.slice(afterWkeb + existingDateMatch[0].length);
  } else {
    card = card.slice(0, afterWkeb) + dateSpan + card.slice(afterWkeb);
  }

  // 3. Headline: the first <h3>...</h3> in the card.
  card = card.replace(/<h3>[\s\S]*?<\/h3>/, `<h3>${escHtml(data.headline)}</h3>`);

  // 4. Top three stories: the <ol class="wklist">...</ol> contents.
  const storyItems = data.stories
    .map((s) => `<li><a href="${escHtml(data.link)}">${escHtml(s)}</a></li>`)
    .join('');
  card = card.replace(/<ol class="wklist">[\s\S]*?<\/ol>/, `<ol class="wklist">${storyItems}</ol>`);

  // 5. Link: the "Read this week's Brief" button's href (keep its label/arrow).
  card = card.replace(
    /(<a class="btn btn-brief" href=")[^"]*(">Read this week&#x27;s Brief)/,
    `$1${escHtml(data.link)}$2`
  );

  const changed = card !== original;
  const nextHtml = html.slice(0, start) + card + html.slice(end);
  return { nextHtml, changed };
}

async function main() {
  const issues = await fetchIssues();
  const data = pickCardData(issues);
  console.log(`mode=${data.mode} date="${data.date}" headline="${data.headline}" link=${data.link}`);
  console.log(`image=${data.image.src}${data.image.external ? ' (Brief repo, cross-origin)' : ' (Hub repo, local)'}`);

  let anyChanged = false;
  const results = [];
  for (const file of FILES) {
    const filePath = path.join(ROOT, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const { nextHtml, changed } = buildCard(html, data);
    if (changed) {
      fs.writeFileSync(filePath, nextHtml, 'utf8');
      anyChanged = true;
    }
    results.push({ file, changed });
  }

  // Guard: Frontier_Home.html and index.html must stay byte-identical.
  const a = fs.readFileSync(path.join(ROOT, 'Frontier_Home.html'), 'utf8');
  const b = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (a !== b) throw new Error('Frontier_Home.html and index.html diverged after regeneration.');

  for (const r of results) console.log(`  ${r.changed ? 'UPDATED' : 'unchanged'}  ${r.file}`);
  console.log(anyChanged ? '\nDone (changed).' : '\nDone (no changes needed).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
