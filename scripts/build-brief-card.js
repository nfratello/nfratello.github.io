// scripts/build-brief-card.js
//
// P42: regenerates the front door "This week" Brief card's date, headline,
// top three stories and link in Frontier_Home.html and index.html, from the
// Brief repo's public issues/issues.json manifest. Never hand-edit the card's
// date/headline/story-list/link — this script is the only thing that writes
// them. Run: node scripts/build-brief-card.js
//
// Normal mode: the newest send date has an "All Industries" issue -> use its
// title, its k3 (top 3) story lines and its own issue URL.
// Fallback mode: the newest send date has no "All Industries" issue (that
// week went out purely by industry) -> headline becomes "This week's
// Industry Editions", the three newest editions' headlines stand in for the
// story list, and the link points at /microsoft-brief/brief/latest/, which
// itself renders a "Choose your edition" list for that exact week.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ISSUES_URL = 'https://nfratello.github.io/microsoft-brief/issues/issues.json';
const FILES = ['Frontier_Home.html', 'index.html'];

const WKEB = '<span class="wkeb" style="color:#2563eb">THE BRIEF | THIS WEEK</span>';
const ARTICLE_START = '<article class="wkcard"><img class="wkimg" src="assets/img/Brief_Card_Art';

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#x27;')
    .replace(/"/g, '&quot;');
}

function niceDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

async function fetchIssues() {
  const res = await fetch(ISSUES_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${ISSUES_URL}: HTTP ${res.status}`);
  return res.json();
}

function pickCardData(issues) {
  const allDates = [...new Set(issues.map((i) => i.date))].sort();
  const newestDate = allDates[allDates.length - 1];
  const allIssuesAtNewest = issues.filter((i) => i.edition === 'All Industries' && i.date === newestDate);

  if (allIssuesAtNewest.length) {
    // Prefer the non-executive edition if more than one shares the date.
    const issue = allIssuesAtNewest.find((i) => !i.exec) || allIssuesAtNewest[0];
    return {
      mode: 'all-industries-issue',
      date: `Week of ${niceDate(issue.date)}`,
      headline: issue.title,
      stories: (issue.k3 || []).slice(0, 3),
      link: `https://nfratello.github.io/microsoft-brief/issues/${issue.url}`,
    };
  }

  const thisWeek = issues
    .filter((i) => i.date === newestDate)
    .slice()
    .sort((a, b) => a.edition.localeCompare(b.edition));
  const top3 = thisWeek.slice(0, 3);
  return {
    mode: 'choose-your-edition-fallback',
    date: `Week of ${niceDate(newestDate)}`,
    headline: "This week's Industry Editions",
    stories: top3.map((i) => `${i.edition}: ${i.title}`),
    link: 'https://nfratello.github.io/microsoft-brief/brief/latest/',
  };
}

function buildCard(html, data) {
  const start = html.indexOf(ARTICLE_START);
  if (start === -1) throw new Error('Could not find the Brief wkcard start marker.');
  const end = html.indexOf('</article>', start) + '</article>'.length;
  if (end === -1) throw new Error('Could not find the Brief wkcard end marker.');
  let card = html.slice(start, end);
  const original = card;

  // 1. Date: insert/replace the <span class="wkdate"> right after the eyebrow.
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

  // 2. Headline: the first <h3>...</h3> in the card.
  card = card.replace(/<h3>[\s\S]*?<\/h3>/, `<h3>${escHtml(data.headline)}</h3>`);

  // 3. Top three stories: the <ol class="wklist">...</ol> contents.
  const storyItems = data.stories
    .map((s) => `<li><a href="${escHtml(data.link)}">${escHtml(s)}</a></li>`)
    .join('');
  card = card.replace(/<ol class="wklist">[\s\S]*?<\/ol>/, `<ol class="wklist">${storyItems}</ol>`);

  // 4. Link: the "Read this week's Brief" button's href (keep its label/arrow).
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
