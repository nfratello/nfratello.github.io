#!/usr/bin/env node
/**
 * P34: Dynamics 365 skills — card cleanup + full-page view + full-screen
 * viewer. Idempotent: re-running after the transform is a no-op (detects the
 * Expand button / skSkillData script already present and exits early).
 *
 * What this does to Dynamics_365_Skills.html:
 *  1. For each of the 25 `.sk` cards: adds a `data-slug`, removes the `.vz`
 *     placeholder graphic, and replaces the `.skshare` (Copy GIF link |
 *     Download GIF) row with an `.skexpand` "Expand" button.
 *  2. Extracts every card's data (title, description, prompt, tags, source,
 *     video/poster/gif paths) and merges it with
 *     assets/data/skill_details.json (eyebrow + "What you get", published
 *     from the OneDrive v0.6-skill-detail build) by slug.
 *  3. Embeds the merged dataset as a <script type="application/json"> block
 *     and appends the CSS + JS for the full-page view and full-screen
 *     viewer, both addressed by URL hash (#skill=<slug> / #view=<slug>).
 *
 * Run: node tools/build-skill-detail.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'Dynamics_365_Skills.html');
const DETAILS_SRC = path.join(
  ROOT,
  '..',
  '..',
  'OneDrive - Microsoft',
  'Documents',
  'Cowork',
  'Frontier Hub',
  'Builds',
  'v0.6-skill-detail',
  'skill_details.json'
);
const DETAILS_DEST = path.join(ROOT, 'assets', 'data', 'skill_details.json');

const DRY = process.argv.includes('--dry');

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function main() {
  let html = fs.readFileSync(HTML_PATH, 'utf8');

  if (html.includes('id="skSkillData"')) {
    console.log('build-skill-detail: already applied (skSkillData present) — nothing to do.');
    return;
  }

  // ---- 1. Publish skill_details.json into the repo -----------------------
  if (!fs.existsSync(DETAILS_SRC)) {
    throw new Error('Missing source: ' + DETAILS_SRC);
  }
  const detailsRaw = JSON.parse(fs.readFileSync(DETAILS_SRC, 'utf8'));
  const detailsByName = {};
  detailsRaw.skills.forEach((s) => {
    detailsByName[s.name.trim().toLowerCase()] = s;
  });
  if (!DRY) {
    fs.mkdirSync(path.dirname(DETAILS_DEST), { recursive: true });
    fs.writeFileSync(DETAILS_DEST, JSON.stringify(detailsRaw, null, 1) + '\n', 'utf8');
  }

  // ---- 2. Walk every `.sk` card, extract + transform ----------------------
  const cardRe = /<article class="sk"[^>]*>.*?<\/article>/gs;
  const skills = [];
  let cardIndex = 0;

  html = html.replace(cardRe, (cardHtml) => {
    cardIndex++;
    const g = /data-g="([^"]*)"/.exec(cardHtml)[1];
    const usesD365 = /data-d="1"/.test(cardHtml);
    const nocrm = /data-c="1"/.test(cardHtml);
    const searchText = /data-t="([^"]*)"/.exec(cardHtml)[1];

    const videoSrc = /<source src="([^"]*)"/.exec(cardHtml)[1];
    const posterSrc = /poster="([^"]*)"/.exec(cardHtml)[1];
    const gifUrlMatch = /data-url="([^"]*)"/.exec(cardHtml);
    const gifUrl = gifUrlMatch ? gifUrlMatch[1] : '';
    const gifPath = /class="skdl" href="([^"]*)"/.exec(cardHtml)[1];

    const title = decodeEntities(/<h3>([^<]*)<\/h3>/.exec(cardHtml)[1]);
    const desc = decodeEntities(/<h3>[^<]*<\/h3><p>([^<]*)<\/p>/.exec(cardHtml)[1]);

    const askMatch = /<div class="ask"><small>([^<]*)(?:<span[^>]*><\/span>)?([^<]*)<\/small><q>([^<]*)<\/q><\/div>/.exec(
      cardHtml
    );
    const askPersona = askMatch ? decodeEntities((askMatch[1] + askMatch[2]).trim()) : '';
    const askQuote = askMatch ? decodeEntities(askMatch[3]) : '';

    const tagsBlockMatch = /<div class="tags">(.*?)<\/div>/s.exec(cardHtml);
    const tagsHtml = tagsBlockMatch ? tagsBlockMatch[1] : '';
    const tags = [...tagsHtml.matchAll(/<span class="tg2 (\w+)">([^<]*)<\/span>/g)].map((m) => ({
      cls: m[1],
      text: decodeEntities(m[2]),
    }));

    const srcMatch = /<a class="src" href="([^"]*)">([^<]*)<\/a>/.exec(cardHtml);
    const sourceHref = srcMatch ? srcMatch[1] : '';
    const sourceText = srcMatch ? decodeEntities(srcMatch[2]) : '';

    const slug = slugify(title);
    const detail = detailsByName[title.trim().toLowerCase()];
    if (!detail) {
      throw new Error('No skill_details.json entry for "' + title + '"');
    }

    // "What it reads" chips: derived from the existing data-g/data-d/data-c
    // flags (no new data source — skill_details.json does not define a
    // per-skill "reads" field). See Scout_Report_P34.md, Decisions made
    // without asking.
    const readsChips = [];
    if (usesD365) {
      readsChips.push(
        g === 'serve'
          ? { icon: 'pi-d365-customer-service', text: 'Dynamics 365 Customer Service' }
          : { icon: 'pi-d365-sales', text: 'Dynamics 365 Sales' }
      );
    }
    if (nocrm || !usesD365) {
      readsChips.push({ icon: 'pi-cowork', text: 'Email and meetings' });
    }

    skills.push({
      slug,
      title,
      desc,
      group: g,
      groupLabel: g === 'serve' ? 'Serve' : 'Sell',
      eyebrow: detail.eyebrow,
      whatYouGet: detail.what_you_get,
      askPersona,
      askQuote,
      videoSrc,
      posterSrc,
      gifUrl,
      gifPath,
      readsChips,
      tags,
      sourceHref,
      sourceText,
      searchText,
      usesD365,
      nocrm,
      order: cardIndex,
    });

    // ---- Transform the card markup ----
    let out = cardHtml;
    // Add data-slug to the opening tag.
    out = out.replace(/^<article class="sk"/, '<article class="sk" data-slug="' + slug + '"');
    // Remove the .vz placeholder graphic entirely. Lazily match up to the
    // </div> that sits immediately before the following <div class="bd">,
    // which is always the .vz node's own closing tag regardless of how many
    // nested rows/pills it contains.
    out = out.replace(/<div class="vz">.*?<\/div>(?=<div class="bd">)/s, '');
    // Replace the .skshare row with an Expand button.
    out = out.replace(
      /<div class="skshare">.*?<\/div>/s,
      '<button type="button" class="skexpand" data-slug="' +
        slug +
        '" aria-label="Expand ' +
        title.replace(/"/g, '&quot;') +
        '"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M14 3h7v7h-2V6.41l-5.29 5.3-1.42-1.42 5.3-5.29H14V3zM5 5h5v2H7v10h10v-3h2v5H5V5z" fill="currentColor"/></svg><span>Expand</span></button>'
    );
    return out;
  });

  if (cardIndex !== 25) {
    throw new Error('Expected 25 cards, found ' + cardIndex);
  }

  // ---- 3. Convert the Pause all checkbox+label into a toggle button -------
  html = html.replace(
    '<label class="pauseall"><input type="checkbox" id="pauseAll"> Pause all animations</label>',
    '<button type="button" class="pauseall" id="pauseAll" aria-pressed="false">Pause all animations</button>'
  );

  // ---- 4. Add a "View all full screen" button beside the filter bar -------
  html = html.replace(
    '<input id="q" type="search" placeholder="Search Dynamics 365 skills" aria-label="Search Dynamics 365 skills">',
    '<input id="q" type="search" placeholder="Search Dynamics 365 skills" aria-label="Search Dynamics 365 skills"><button type="button" id="skViewAllBtn" class="skviewall">View all full screen</button>'
  );

  // ---- 5. Rewrite the pause/play init script (icon-paint-bug fix + new
  //          toggle-button wiring; same IntersectionObserver logic kept) ----
  const oldInitScriptRe = /<script>\s*\(function\s*\(\)\s*\{\s*var reducedMotion[\s\S]*?\}\)\(\);\s*<\/script>/;
  if (!oldInitScriptRe.test(html)) {
    throw new Error('Could not locate the pause/play init <script> to replace.');
  }
  html = html.replace(oldInitScriptRe, buildInitScript());

  // ---- 6. Embed the merged skill dataset + append the detail-view CSS/JS --
  const dataScript =
    '<script type="application/json" id="skSkillData">' +
    JSON.stringify(skills) +
    '</script>';
  html = html.replace('</body>', dataScript + buildDetailStyles() + buildDetailScript() + buildPaintFixScript() + '</body>');

  if (DRY) {
    console.log('Dry run OK. ' + cardIndex + ' cards processed, ' + skills.length + ' skills in dataset.');
    return;
  }
  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log('build-skill-detail: applied. ' + cardIndex + ' cards transformed.');
}

function buildInitScript() {
  return `<script>
(function(){
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var playing = []; // ordered list of currently-playing <video> elements (max 3)
  var MAX_PLAYING = 3;
  var pauseAll = false;
  try { pauseAll = localStorage.getItem('skPauseAll') === '1'; } catch (e) {}

  var cards = [...document.querySelectorAll('.sk')].map(function (card) {
    var media = card.querySelector('.skmedia');
    var video = card.querySelector('video.skv');
    var btn = card.querySelector('.skplay');
    return { card: card, media: media, video: video, btn: btn, visible: false, userPaused: false };
  });

  function setButton(c, isPlaying) {
    c.btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    c.btn.setAttribute('aria-label', isPlaying ? 'Pause animation' : 'Play animation');
    // Set the icon visibility directly instead of relying solely on the
    // [aria-pressed] CSS attribute selector: a confirmed browser repaint
    // bug means toggling aria-pressed alone does not always repaint the
    // swapped icon path (reproduced on this page both locally and on the
    // live site). Direct inline style toggling repaints reliably.
    var playIcon = c.btn.querySelector('.ic-play');
    var pauseIcon = c.btn.querySelector('.ic-pause');
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }

  function stop(c) {
    c.media.classList.remove('skready');
    c.video.pause();
    var i = playing.indexOf(c.video);
    if (i !== -1) playing.splice(i, 1);
    setButton(c, false);
  }

  function start(c) {
    c.media.classList.add('skready');
    c.video.play().catch(function () {});
    if (playing.indexOf(c.video) === -1) playing.push(c.video);
    setButton(c, true);
  }

  // Delegated so a later clone/replace of a .skplay button (see the
  // trailing paint-fix script at the end of the page) never loses its
  // click behavior: the listener lives on the document, not the button.
  function handlePlayClick(btnEl, ev) {
    ev.stopPropagation();
    var cardEl = btnEl.closest('.sk');
    var c = cards.find(function (x) { return x.card === cardEl; });
    if (!c) return;
    var isPlaying = playing.indexOf(c.video) !== -1;
    if (isPlaying) {
      c.userPaused = true;
      stop(c);
      fillSlots();
    } else {
      // Manual play always honors the 3-at-once cap: evict the
      // longest-running other video first so the limit never breaks.
      c.userPaused = false;
      if (playing.length >= MAX_PLAYING) {
        var oldest = cards.find(function (x) { return x.video === playing[0]; });
        if (oldest) stop(oldest);
      }
      start(c);
    }
  }
  document.addEventListener('click', function (ev) {
    var btnEl = ev.target.closest && ev.target.closest('.skplay');
    if (btnEl) handlePlayClick(btnEl, ev);
  });

  // Auto-play driven by visibility, the 3-at-once cap, reduced motion and the
  // per-card/pause-all user overrides. Never called for a manual click.
  function fillSlots() {
    if (reducedMotion || pauseAll) return;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (playing.length >= MAX_PLAYING) break;
      if (c.card.hidden) continue;
      if (!c.visible || c.userPaused) continue;
      if (playing.indexOf(c.video) !== -1) continue;
      start(c);
    }
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var c = cards.find(function (x) { return x.media === entry.target; });
      if (!c) return;
      c.visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      if (!c.visible && playing.indexOf(c.video) !== -1) stop(c);
    });
    fillSlots();
  }, { threshold: [0, 0.6, 1] });

  cards.forEach(function (c) {
    io.observe(c.media);
  });

  // Clicking the animation itself (outside the play/pause button) opens
  // the full-page view for that skill. Delegated for the same reason as
  // the play-button handler above.
  document.addEventListener('click', function (ev) {
    var mediaEl = ev.target.closest && ev.target.closest('.skmedia');
    if (!mediaEl || (ev.target.closest && ev.target.closest('.skplay'))) return;
    var cardEl = mediaEl.closest('.sk');
    var slug = cardEl && cardEl.getAttribute('data-slug');
    if (slug) location.hash = 'skill=' + slug;
  });

  // Filter/search hides cards via the \`hidden\` attribute (see ap() above);
  // make sure a card that just became hidden pauses immediately.
  window.skSyncHidden = function () {
    cards.forEach(function (c) {
      if (c.card.hidden && playing.indexOf(c.video) !== -1) stop(c);
    });
    fillSlots();
  };

  // Expand buttons open the full-page view for their skill.
  document.querySelectorAll('.skexpand').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var slug = btn.getAttribute('data-slug');
      if (slug) location.hash = 'skill=' + slug;
    });
  });

  var pauseAllBtn = document.getElementById('pauseAll');
  if (pauseAllBtn) {
    function syncPauseAllLabel() {
      pauseAllBtn.textContent = pauseAll ? 'Play all animations' : 'Pause all animations';
      pauseAllBtn.setAttribute('aria-pressed', pauseAll ? 'true' : 'false');
    }
    syncPauseAllLabel();
    pauseAllBtn.addEventListener('click', function () {
      pauseAll = !pauseAll;
      try { localStorage.setItem('skPauseAll', pauseAll ? '1' : '0'); } catch (e) {}
      syncPauseAllLabel();
      if (pauseAll) {
        cards.slice().forEach(function (c) { if (playing.indexOf(c.video) !== -1) stop(c); });
      } else {
        fillSlots();
      }
    });
  }

  // Copy GIF link / Download GIF (Download already works natively via the
  // \`download\` attribute; this wires the copy button to the same
  // copy-and-"Link copied" pattern as the share line). Exposed on
  // window.skCopyText so the full-page view and viewer share it.
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy command failed')); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  window.skCopyText = copyText;
  document.querySelectorAll('.skcopy').forEach(function (btn) {
    var url = btn.getAttribute('data-url');
    var label = btn.querySelector('.skcopy-txt');
    var original = label ? label.textContent : 'Copy GIF link';
    var restingWidth = btn.getBoundingClientRect().width;
    if (restingWidth) btn.style.minInlineSize = restingWidth + 'px';
    var timer;
    btn.addEventListener('click', function () {
      copyText(url).then(function () {
        btn.classList.add('done');
        if (label) label.textContent = 'Link copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('done');
          if (label) label.textContent = original;
        }, 1600);
      });
    });
  });

  window.skPauseAllVideosForDetailView = function () {
    cards.slice().forEach(function (c) { if (playing.indexOf(c.video) !== -1) stop(c); });
  };
  window.skResumeAutoplayForDetailView = fillSlots;

  // Work around a confirmed browser first-paint bug: the pause/play icon
  // never paints on a \`.skplay\` button as originally parsed (reproduced on
  // this page both locally and on the live site, and not specific to the
  // inline SVG icon markup). Replacing the node in place (cloneNode +
  // replaceChild) does not reliably fix it no matter when it runs. What
  // does reliably fix it in every tested configuration: leaving the
  // original node in the DOM (inert, hidden) and inserting a freshly
  // created clone as a new sibling right after it. Exposed so the trailing
  // <script> block at the very end of the page (after all other content,
  // including the full-page view and viewer, has been inserted) can run
  // it. All click handling is delegated to the document by class name
  // (above), so the fresh sibling needs no listeners re-wired; only
  // \`cards[].btn\` (used for aria-pressed/aria-label) is updated to point
  // at the new, visible node.
  window.skRefreshPlayButtons = function () {
    cards.forEach(function (c) {
      var stale = c.btn;
      var fresh = stale.cloneNode(true);
      stale.insertAdjacentElement('afterend', fresh);
      stale.style.display = 'none';
      stale.setAttribute('aria-hidden', 'true');
      stale.setAttribute('tabindex', '-1');
      c.btn = fresh;
    });
  };
})();
</script>`;
}

function buildPaintFixScript() {
  // Final pass of the pause/play icon paint-bug workaround (see
  // window.skRefreshPlayButtons above): must run as the very last script on
  // the page, after all other content (including the full-page view and
  // viewer markup) has been inserted, or the fix does not reliably stick.
  return '<script>window.skRefreshPlayButtons && window.skRefreshPlayButtons();</script>';
}

function buildDetailStyles() {
  return `<style>
/* P34: Expand button, full-page view, full-screen viewer */
.skexpand{display:inline-flex;align-items:center;gap:6px;margin-block:10px 2px;padding:6px 14px;border:1.5px solid #0f6cbd;border-radius:999px;background:#fff;color:#0f6cbd;font-weight:600;font-size:13px;cursor:pointer;font:inherit;width:fit-content}
.skexpand:hover{background:#eff6fc}
.skexpand:focus-visible{outline:2px solid #0f6cbd;outline-offset:2px}
.skmedia{cursor:pointer}
.skviewall{margin-inline-start:8px;padding:8px 14px;border:1.5px solid #0f6cbd;border-radius:999px;background:#fff;color:#0f6cbd;font-weight:600;font-size:13px;cursor:pointer;font:inherit}
.skviewall:hover{background:#eff6fc}
.pauseall{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#334155;margin-inline-start:auto;padding:6px 12px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;cursor:pointer;font:inherit}
.pauseall[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#312e81}
@media (max-width:760px){.pauseall{margin-inline-start:0;width:100%;order:99}.skviewall{width:100%;margin-inline-start:0;margin-block-start:8px}}

/* ---- Full-page view ---- */
.skfp{position:fixed;inset:0;z-index:60;background:#f1f5f9;overflow-y:auto;touch-action:pan-y}
.skfp[hidden]{display:none}
.skfp-top{display:flex;align-items:center;gap:16px;padding:14px 24px;background:#fff;border-block-end:1px solid #e2e8f0;position:sticky;top:0;z-index:2}
.skfp-back{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:8px 16px;font-weight:600;font-size:13px;color:#0f172a;cursor:pointer;font:inherit}
.skfp-back:hover{background:#f8fafc}
.skfp-loc{flex:1;text-align:center;font-size:13px;color:#64748b}
.skfp-nav{display:flex;gap:8px}
.skfp-prev,.skfp-next{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;color:#0f172a;cursor:pointer;font:inherit}
.skfp-prev:hover,.skfp-next:hover{background:#f8fafc}
.skfp-prev:disabled,.skfp-next:disabled{opacity:.4;cursor:default}
.skfp-body{max-width:1240px;margin:0 auto;padding:28px 24px 8px;display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:28px;align-items:start}
.skfp-left{min-width:0}
.skfp-media{position:relative;border-radius:14px;overflow:hidden;background:#000;box-shadow:0 8px 24px rgba(15,23,42,.12)}
.skfp-media video,.skfp-media img{display:block;width:100%;height:auto}
.skfp-mediactrls{position:absolute;inset-block-end:14px;inset-inline-end:14px;display:flex;gap:8px}
.skfp-mediabtn{width:40px;height:40px;border-radius:999px;border:none;background:rgba(15,23,42,.85);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.skfp-hint{display:flex;justify-content:space-between;color:#64748b;font-size:13px;margin:10px 2px}
.skfp-replay{border:none;background:none;color:#0f6cbd;font-weight:600;cursor:pointer;font:inherit;padding:0}
.skfp-share{margin-block-start:18px;padding:18px;background:#fff;border:1px solid #e2e8f0;border-radius:14px}
.skfp-sharebtns{display:flex;flex-wrap:wrap;gap:10px;margin-block:10px}
.skfp-copygif,.skfp-copypage{padding:9px 16px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer;font:inherit;border:1.5px solid #0f6cbd}
.skfp-copygif{background:#0f6cbd;color:#fff;border-color:#0f6cbd}
.skfp-copygif:hover{background:#115ea3}
.skfp-copypage{background:#fff;color:#0f6cbd}
.skfp-copypage:hover{background:#eff6fc}
.skfp-dlgif{display:inline-flex;align-items:center;padding:9px 16px;border-radius:999px;font-weight:600;font-size:13px;border:1.5px solid #0f6cbd;color:#0f6cbd;text-decoration:none}
.skfp-dlgif:hover{background:#eff6fc}
.skfp-copygif.done,.skfp-copypage.done{background:#e6f4ea;border-color:#107c41;color:#107c41}
.skfp-right h1{font-size:30px;margin:4px 0 10px;line-height:1.2}
.skfp-right .eb{margin-block:16px 6px}
.skfp-right .eb:first-child{margin-block-start:0}
.skfp-right p{margin:0}
.skfp-right .ask{background:#eef2ff;border-inline-start:4px solid #6366f1;border-radius:8px;padding:14px 16px;margin-block-start:6px}
.skfp-right .ask small{display:block;color:#475569;font-size:12.5px;margin-block-end:6px}
.skfp-right .ask q{font-size:15px;color:#1e293b;quotes:'\\201C' '\\201D'}
.skfp-copyprompt{border:none;background:none;color:#0f6cbd;font-weight:600;cursor:pointer;font:inherit;padding:6px 0;display:inline-flex;align-items:center;gap:6px}
.skfp-copyprompt.done{color:#107c41}
.skfp-reads,.skfp-workswith{display:flex;flex-wrap:wrap;gap:8px}
.skfp-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:#f1f5f9;color:#334155;font-size:12.5px;font-weight:600}
.skfp-chip .pi{width:14px;height:14px}
.skfp-wyg{margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:6px;font-size:14px;color:#1e293b}
.skfp-right .src{display:block;margin-block-start:4px;font-size:12.5px}
.skfp-right .muted{font-size:12px}
.skfp-nextfilter{max-width:1240px;margin:0 auto;padding:8px 24px 40px}
.skfp-nextfilter h2{font-size:18px;margin-block-end:14px}
.skfp-nextgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.skfp-nextcard{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;cursor:pointer;text-align:start;padding:0;font:inherit;display:flex;flex-direction:column}
.skfp-nextcard img{width:100%;display:block;aspect-ratio:16/9;object-fit:cover;background:#000}
.skfp-nextcard .nc-bd{padding:12px 14px}
.skfp-nextcard .nc-bd b{display:block;font-size:14px;margin-block-end:4px;color:#0f172a}
.skfp-nextcard .nc-bd span{font-size:12.5px;color:#64748b}
.skfp-backall{display:flex;align-items:center;justify-content:center;background:#fff;border:1px dashed #cbd5e1;border-radius:12px;color:#0f6cbd;font-weight:600;cursor:pointer;font:inherit;min-block-size:100px}
.skfp-backall:hover{background:#eff6fc}
@media (max-width:1060px){.skfp-body{grid-template-columns:1fr}.skfp-right{order:2}.skfp-nextgrid{grid-template-columns:1fr 1fr}}
@media (max-width:760px){
.skfp-top{flex-wrap:wrap;gap:8px;padding:10px 14px}
.skfp-loc{order:3;width:100%;text-align:start}
.skfp-nav{order:2;margin-inline-start:auto}
/* Phone order: animation, then details, then share (item 4). .skfp-left
   becomes display:contents so its children re-order alongside .skfp-right,
   which is itself a direct grid item of .skfp-body. */
.skfp-body{grid-template-columns:1fr;padding:16px 16px 84px}
.skfp-left{display:contents}
.skfp-media{order:1}
.skfp-hint{order:2}
.skfp-right{order:3}
.skfp-share{order:4}
.skfp-nextfilter{order:5}
.skfp-nextgrid{grid-template-columns:1fr}
/* Previous/Next become a fixed bottom bar; reuses the existing buttons. */
.skfp-nav{position:fixed;inset-inline:0;inset-block-end:0;z-index:3;background:#fff;border-block-start:1px solid #e2e8f0;padding:10px 14px;display:flex;gap:10px;margin:0;order:unset;width:100%}
.skfp-prev,.skfp-next{flex:1}
}

/* ---- Full-screen viewer ---- */
.skvw{position:fixed;inset:0;z-index:70;background:rgba(10,14,40,.95);color:#fff;display:flex;flex-direction:column;align-items:center;touch-action:pan-y}
.skvw[hidden]{display:none}
.skvw-top{position:fixed;top:0;inset-inline:0;display:flex;align-items:center;gap:16px;padding:16px 24px;z-index:2}
.skvw-back{border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:8px 16px;font-weight:600;font-size:13px;cursor:pointer;font:inherit}
.skvw-back:hover{background:rgba(255,255,255,.18)}
.skvw-counter{flex:1;text-align:center;font-size:13px;color:#cbd5e1}
.skvw-close{width:36px;height:36px;border-radius:999px;border:none;background:rgba(255,255,255,.12);color:#fff;font-size:20px;line-height:1;cursor:pointer}
.skvw-close:hover{background:rgba(255,255,255,.25)}
.skvw-arrow{position:fixed;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;border:none;background:rgba(255,255,255,.12);color:#fff;font-size:22px;cursor:pointer;z-index:2}
.skvw-arrow:hover{background:rgba(255,255,255,.25)}
.skvw-prev{inset-inline-start:24px}
.skvw-next{inset-inline-end:24px}
.skvw-stage{margin-block-start:88px;width:min(1100px,92vw)}
.skvw-media{position:relative;border-radius:14px;overflow:hidden;background:#000}
.skvw-media video,.skvw-media img{display:block;width:100%;height:auto}
.skvw-mediabtn{position:absolute;inset-block-end:14px;inset-inline-end:14px;width:40px;height:40px;border-radius:999px;border:none;background:rgba(15,23,42,.85);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.skvw-progress{height:3px;background:rgba(255,255,255,.18);border-radius:999px;overflow:hidden;margin-block-start:-4px;position:relative;z-index:1}
.skvw-progress i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#a855f7)}
.skvw-title{font-size:20px;margin:18px 0 6px;text-align:center}
.skvw-desc{max-width:680px;text-align:center;color:#cbd5e1;font-size:14px;margin:0 auto}
.skvw-sharebtns{display:flex;justify-content:center;gap:10px;margin-block-start:14px;flex-wrap:wrap}
.skvw-copygif,.skvw-dlgif{padding:9px 16px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer;font:inherit;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);color:#fff;text-decoration:none;display:inline-flex;align-items:center}
.skvw-copygif:hover,.skvw-dlgif:hover{background:rgba(255,255,255,.18)}
.skvw-copygif.done{background:#107c41;border-color:#107c41}
.skvw-bottom{margin-block:18px 30px;display:flex;flex-direction:column;align-items:center;gap:14px}
.skvw-autoplay{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#cbd5e1;cursor:pointer}
.skvw-end{display:flex;gap:10px}
.skvw-end button{padding:9px 18px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer;font:inherit;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);color:#fff}
.skvw-end button:hover{background:rgba(255,255,255,.18)}
@media (max-width:760px){.skvw-arrow{width:40px;height:40px;font-size:18px}.skvw-prev{inset-inline-start:8px}.skvw-next{inset-inline-end:8px}.skvw-stage{margin-block-start:72px}.skvw-top{padding:12px 16px}}
@media (prefers-reduced-motion:reduce){.skfp-media video,.skvw-media video{display:none}}
</style>`;
}

function buildDetailScript() {
  return `<script>
(function(){
  var DATA = JSON.parse(document.getElementById('skSkillData').textContent);
  var BY_SLUG = {};
  DATA.forEach(function (d) { BY_SLUG[d.slug] = d; });

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var activeFilter = 'all', activeQuery = '';
  document.querySelectorAll('.bar2 button[data-f]').forEach(function (b) {
    b.addEventListener('click', function () { activeFilter = b.dataset.f; });
  });
  var qInput = document.getElementById('q');
  if (qInput) qInput.addEventListener('input', function () { activeQuery = qInput.value.trim().toLowerCase(); });

  function matchesActive(d) {
    var ok = activeFilter === 'all'
      || ((activeFilter === 'sell' || activeFilter === 'serve') ? d.group === activeFilter
        : activeFilter === 'nocrm' ? d.nocrm
        : d.usesD365);
    return ok && (!activeQuery || d.searchText.includes(activeQuery));
  }
  function filteredSlugs() {
    return DATA.filter(matchesActive).map(function (d) { return d.slug; });
  }

  function chipHtml(c) {
    return '<span class="skfp-chip"><span class="pi ' + c.icon + '" aria-hidden="true"></span>' + c.text + '</span>';
  }
  function tagChipHtml(t) {
    var icon = t.cls === 'd365' ? (t.text.indexOf('Customer Service') !== -1 ? 'pi-d365-customer-service' : 'pi-d365-sales') : 'pi-cowork';
    return '<span class="skfp-chip"><span class="pi ' + icon + '" aria-hidden="true"></span>' + t.text + '</span>';
  }

  // ---------------- Full-page view ----------------
  var fp = document.createElement('div');
  fp.className = 'skfp';
  fp.id = 'skillFullPage';
  fp.hidden = true;
  fp.innerHTML =
    '<div class="skfp-top">' +
      '<button type="button" class="skfp-back">\\u2190 All skills</button>' +
      '<div class="skfp-loc" id="skfpLoc"></div>' +
      '<div class="skfp-nav"><button type="button" class="skfp-prev">\\u2039 Previous</button><button type="button" class="skfp-next"></button></div>' +
    '</div>' +
    '<div class="skfp-body">' +
      '<div class="skfp-left">' +
        '<div class="skfp-media" id="skfpMedia"></div>' +
        '<p class="skfp-hint"><span>Pause or replay any time</span><button type="button" class="skfp-replay">\\u21BB Replay</button></p>' +
        '<div class="skfp-share">' +
          '<p class="eb">Share this skill</p>' +
          '<div class="skfp-sharebtns">' +
            '<button type="button" class="skfp-copygif">Copy GIF link</button>' +
            '<a class="skfp-dlgif" download>Download GIF</a>' +
            '<button type="button" class="skfp-copypage">Copy link to this page</button>' +
          '</div>' +
          '<p class="muted">The GIF plays in email, Teams and slides. The page link opens this view directly.</p>' +
        '</div>' +
      '</div>' +
      '<div class="skfp-right">' +
        '<p class="eb" id="skfpEyebrow"></p>' +
        '<h1 id="skfpTitle" tabindex="-1"></h1>' +
        '<p id="skfpDesc"></p>' +
        '<p class="eb">Try this prompt</p>' +
        '<div class="ask"><small id="skfpPersona"></small><q id="skfpQuote"></q></div>' +
        '<button type="button" class="skfp-copyprompt">\\u{1F517} Copy prompt</button>' +
        '<p class="eb">What it reads</p>' +
        '<div class="skfp-reads" id="skfpReads"></div>' +
        '<p class="eb">What you get</p>' +
        '<ul class="skfp-wyg" id="skfpWyg"></ul>' +
        '<p class="eb">Works with</p>' +
        '<div class="skfp-workswith" id="skfpWorks"></div>' +
        '<a class="src" id="skfpSrc"></a>' +
        '<p class="muted">Illustrative example. Contoso and Fabrikam are fictional.</p>' +
      '</div>' +
    '</div>' +
    '<div class="skfp-nextfilter"><h2>Next in this filter</h2><div class="skfp-nextgrid" id="skfpNextGrid"></div></div>';
  document.body.appendChild(fp);

  var fpState = { slug: null, filterSnapshot: null, returnFocusEl: null, scrollY: 0 };

  function renderFullPage(slug) {
    var d = BY_SLUG[slug];
    if (!d) return false;
    var list = fpState.filterSnapshot || filteredSlugs();
    var idx = list.indexOf(slug);
    if (idx === -1) { list = filteredSlugs(); idx = list.indexOf(slug); }
    fpState.filterSnapshot = list;
    var n = list.length, pos = idx + 1;

    document.getElementById('skfpLoc').textContent = 'Dynamics 365 skills \\u203A ' + d.groupLabel + ' \\u203A ' + d.title + ' \\u00B7 ' + pos + ' of ' + n;
    document.title = d.title + ' | Dynamics 365 skills';

    var prevBtn = fp.querySelector('.skfp-prev');
    var nextBtn = fp.querySelector('.skfp-next');
    if (idx > 0) { prevBtn.disabled = false; prevBtn.dataset.slug = list[idx - 1]; }
    else { prevBtn.disabled = true; delete prevBtn.dataset.slug; }
    if (idx < n - 1) { var nd = BY_SLUG[list[idx + 1]]; nextBtn.disabled = false; nextBtn.dataset.slug = list[idx + 1]; nextBtn.textContent = 'Next: ' + nd.title + ' \\u203A'; }
    else { nextBtn.disabled = true; delete nextBtn.dataset.slug; nextBtn.textContent = 'Next \\u203A'; }

    var mediaHtml =
      '<video class="skv" muted playsinline loop controls preload="metadata" poster="' + d.posterSrc + '" aria-label="Animation: ' + d.title + ' in Copilot Cowork">' +
        '<source src="' + d.videoSrc + '" type="video/mp4"></video>';
    var reducedMediaHtml =
      '<img src="' + d.posterSrc + '" alt="" width="960" height="540">' +
      '<button type="button" class="skfp-mediabtn skfp-rmplay" aria-label="Play animation"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>';
    document.getElementById('skfpMedia').innerHTML = reducedMotion ? reducedMediaHtml : mediaHtml;
    var rmPlay = document.getElementById('skfpMedia').querySelector('.skfp-rmplay');
    if (rmPlay) {
      rmPlay.addEventListener('click', function () {
        document.getElementById('skfpMedia').innerHTML = mediaHtml;
        var v = document.querySelector('#skfpMedia video');
        if (v) v.play().catch(function () {});
      });
    }

    document.getElementById('skfpEyebrow').textContent = d.eyebrow.toUpperCase();
    document.getElementById('skfpTitle').textContent = d.title;
    document.getElementById('skfpDesc').textContent = d.desc;
    document.getElementById('skfpPersona').textContent = d.askPersona;
    document.getElementById('skfpQuote').textContent = d.askQuote;
    document.getElementById('skfpReads').innerHTML = d.readsChips.map(chipHtml).join('');
    document.getElementById('skfpWyg').innerHTML = d.whatYouGet.map(function (b) { return '<li>' + b + '</li>'; }).join('');
    document.getElementById('skfpWorks').innerHTML = d.tags.map(tagChipHtml).join('');
    var src = document.getElementById('skfpSrc');
    src.href = d.sourceHref; src.textContent = d.sourceText;

    var copyGif = fp.querySelector('.skfp-copygif');
    var dl = fp.querySelector('.skfp-dlgif');
    dl.href = d.gifPath; dl.download = d.gifPath.split('/').pop();
    copyGif.onclick = function () { wireCopy(copyGif, d.gifUrl, 'Copy GIF link'); };
    var copyPage = fp.querySelector('.skfp-copypage');
    copyPage.onclick = function () { wireCopy(copyPage, location.origin + location.pathname + '#skill=' + d.slug, 'Copy link to this page'); };
    fp.querySelector('.skfp-copyprompt').onclick = function (ev) { wireCopy(ev.currentTarget, d.askQuote, '\\u{1F517} Copy prompt'); };
    fp.querySelector('.skfp-replay').onclick = function () {
      var v = fp.querySelector('.skfp-media video');
      if (v) { v.currentTime = 0; v.play().catch(function () {}); }
    };

    var nextGrid = document.getElementById('skfpNextGrid');
    var nextTwo = list.slice(idx + 1, idx + 3).map(function (s) { return BY_SLUG[s]; });
    var cardsHtml = nextTwo
      .map(function (nd) {
        return '<button type="button" class="skfp-nextcard" data-slug="' + nd.slug + '"><img src="' + nd.posterSrc + '" alt="" loading="lazy"><div class="nc-bd"><b>' + nd.title + '</b><span>' + nd.desc + '</span></div></button>';
      })
      .join('');
    nextGrid.innerHTML = cardsHtml + '<button type="button" class="skfp-backall">\\u2190 Back to all ' + DATA.length + ' skills</button>';
    nextGrid.querySelectorAll('.skfp-nextcard').forEach(function (btn) {
      btn.addEventListener('click', function () { location.hash = 'skill=' + btn.dataset.slug; });
    });
    nextGrid.querySelector('.skfp-backall').addEventListener('click', function () { closeFullPage(); });

    return true;
  }

  function wireCopy(btn, text, original) {
    if (window.skCopyText) {
      window.skCopyText(text).then(function () {
        btn.classList.add('done');
        var prevHtml = btn.innerHTML;
        btn.textContent = '\\u2713 Link copied';
        setTimeout(function () { btn.classList.remove('done'); btn.innerHTML = prevHtml; }, 1600);
      });
    }
  }

  function openFullPage(slug, fromHash) {
    if (!renderFullPage(slug)) return;
    if (!fromHash) {
      fpState.scrollY = window.scrollY;
      fpState.returnFocusEl = document.querySelector('.sk[data-slug="' + fpState.slug + '"]') || document.activeElement;
    }
    fpState.slug = slug;
    fp.hidden = false;
    document.body.classList.add('sk-modal-open');
    if (window.skPauseAllVideosForDetailView) window.skPauseAllVideosForDetailView();
    document.getElementById('skfpTitle').focus();
  }

  function closeFullPage(skipHash) {
    fp.hidden = true;
    document.body.classList.remove('sk-modal-open');
    document.title = 'Dynamics 365 skills | Microsoft Becoming Frontier';
    if (!skipHash && (location.hash.indexOf('#skill=') === 0)) history.pushState('', document.title, location.pathname + location.search);
    window.scrollTo(0, fpState.scrollY || 0);
    var focusTarget = document.querySelector('.sk[data-slug="' + fpState.slug + '"] .skexpand') || fpState.returnFocusEl;
    if (focusTarget && focusTarget.focus) focusTarget.focus();
    if (window.skResumeAutoplayForDetailView) window.skResumeAutoplayForDetailView();
    fpState.slug = null;
  }

  fp.querySelector('.skfp-back').addEventListener('click', function () { closeFullPage(); });
  fp.querySelector('.skfp-prev').addEventListener('click', function (ev) { if (ev.currentTarget.dataset.slug) location.hash = 'skill=' + ev.currentTarget.dataset.slug; });
  fp.querySelector('.skfp-next').addEventListener('click', function (ev) { if (ev.currentTarget.dataset.slug) location.hash = 'skill=' + ev.currentTarget.dataset.slug; });

  // Swipe support (phones) — FH47: mirrors the viewer's swipe below, stepping
  // Previous/Next within the active filter via the same hash the buttons use.
  (function () {
    var startX = null, startY = null, lock = null;
    fp.addEventListener('touchstart', function (ev) {
      startX = ev.touches[0].clientX; startY = ev.touches[0].clientY; lock = null;
    }, { passive: true });
    fp.addEventListener('touchmove', function (ev) {
      if (startX === null) return;
      var dx = ev.touches[0].clientX - startX, dy = ev.touches[0].clientY - startY;
      if (lock === null) lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lock === 'x') ev.preventDefault(); // own the gesture so the page never scrolls sideways
    }, { passive: false });
    fp.addEventListener('touchend', function (ev) {
      if (startX === null) return;
      var dx = ev.changedTouches[0].clientX - startX;
      if (lock === 'x' && Math.abs(dx) > 50) {
        var btn = dx < 0 ? fp.querySelector('.skfp-next') : fp.querySelector('.skfp-prev');
        if (btn && !btn.disabled && btn.dataset.slug) location.hash = 'skill=' + btn.dataset.slug;
      }
      startX = null; startY = null; lock = null;
    }, { passive: true });
  })();

  // ---------------- Full-screen viewer ----------------
  var vw = document.createElement('div');
  vw.className = 'skvw';
  vw.id = 'skillViewer';
  vw.hidden = true;
  vw.setAttribute('role', 'dialog');
  vw.setAttribute('aria-modal', 'true');
  vw.innerHTML =
    '<div class="skvw-top">' +
      '<button type="button" class="skvw-back">\\u2190 All skills</button>' +
      '<div class="skvw-counter" id="skvwCounter"></div>' +
      '<button type="button" class="skvw-close" aria-label="Close">\\u00D7</button>' +
    '</div>' +
    '<button type="button" class="skvw-arrow skvw-prev" aria-label="Previous skill">\\u2039</button>' +
    '<button type="button" class="skvw-arrow skvw-next" aria-label="Next skill">\\u203A</button>' +
    '<div class="skvw-stage">' +
      '<div class="skvw-media" id="skvwMedia"></div>' +
      '<div class="skvw-progress"><i id="skvwProgressBar"></i></div>' +
    '</div>' +
    '<h2 class="skvw-title" id="skvwTitle" tabindex="-1"></h2>' +
    '<p class="skvw-desc" id="skvwDesc"></p>' +
    '<div class="skvw-sharebtns">' +
      '<button type="button" class="skvw-copygif">Copy GIF link</button>' +
      '<a class="skvw-dlgif" download>Download GIF</a>' +
    '</div>' +
    '<div class="skvw-bottom">' +
      '<label class="skvw-autoplay"><input type="checkbox" id="skvwAutoplay"> Auto-play</label>' +
      '<div class="skvw-end" id="skvwEnd" hidden><button type="button" class="skvw-backall">Back to all skills</button><button type="button" class="skvw-restart">Start again</button></div>' +
    '</div>';
  document.body.appendChild(vw);

  var vwState = { slugs: [], idx: 0, autoplay: false, returnFocusEl: null, scrollY: 0 };

  function renderViewer() {
    var slug = vwState.slugs[vwState.idx];
    var d = BY_SLUG[slug];
    if (!d) return;
    vw.setAttribute('aria-label', d.title);
    document.title = d.title + ' | Dynamics 365 skills';
    document.getElementById('skvwCounter').textContent = 'Skill ' + (vwState.idx + 1) + ' of ' + vwState.slugs.length + ' \\u00B7 filtered: ' + filterLabel();
    var liveMediaHtml = '<video class="skv" muted playsinline loop preload="metadata" poster="' + d.posterSrc + '" aria-label="Animation: ' + d.title + ' in Copilot Cowork"><source src="' + d.videoSrc + '" type="video/mp4"></video>' +
        '<button type="button" class="skvw-mediabtn" aria-pressed="true" aria-label="Pause animation"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg></button>';
    var mediaHtml = reducedMotion
      ? '<img src="' + d.posterSrc + '" alt="" width="960" height="540">' +
        '<button type="button" class="skvw-mediabtn skvw-rmplay" aria-label="Play animation"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>'
      : liveMediaHtml;
    document.getElementById('skvwMedia').innerHTML = mediaHtml;
    document.getElementById('skvwTitle').textContent = d.title;
    document.getElementById('skvwDesc').textContent = d.desc;
    document.getElementById('skvwEnd').hidden = vwState.idx < vwState.slugs.length - 1;

    var rmPlay = document.getElementById('skvwMedia').querySelector('.skvw-rmplay');
    if (rmPlay) {
      rmPlay.addEventListener('click', function () {
        document.getElementById('skvwMedia').innerHTML = liveMediaHtml;
        wireViewerVideo();
      });
    }
    wireViewerVideo();
    updateViewerChrome(d);
  }

  // Wires the video's progress bar, end-of-clip auto-advance and manual
  // pause button. Split out so the reduced-motion "Play animation" button
  // can call it again after swapping the still image for the real video.
  function wireViewerVideo() {
    var v = vw.querySelector('.skvw-media video');
    var bar = document.getElementById('skvwProgressBar');
    bar.style.width = '0%';
    if (v) {
      v.play().catch(function () {});
      v.addEventListener('timeupdate', function () {
        if (v.duration) bar.style.width = ((v.currentTime / v.duration) * 100) + '%';
      });
      v.addEventListener('ended', function () {
        if (vwState.autoplay) {
          if (vwState.idx < vwState.slugs.length - 1) { vwState.idx++; renderViewer(); }
          else { document.getElementById('skvwEnd').hidden = false; }
        }
      });
      var mbtn = vw.querySelector('.skvw-mediabtn:not(.skvw-rmplay)');
      if (mbtn) mbtn.addEventListener('click', function () {
        if (v.paused) { v.play(); mbtn.setAttribute('aria-pressed', 'true'); mbtn.setAttribute('aria-label', 'Pause animation'); }
        else { v.pause(); mbtn.setAttribute('aria-pressed', 'false'); mbtn.setAttribute('aria-label', 'Play animation'); }
      });
    }
  }

  function updateViewerChrome(d) {
    vw.querySelector('.skvw-prev').disabled = vwState.idx === 0;
    vw.querySelector('.skvw-next').disabled = vwState.idx === vwState.slugs.length - 1;
    var copyGif = vw.querySelector('.skvw-copygif');
    copyGif.onclick = function () { wireCopy(copyGif, d.gifUrl, 'Copy GIF link'); };
    var dl = vw.querySelector('.skvw-dlgif');
    dl.href = d.gifPath; dl.download = d.gifPath.split('/').pop();

    if (!skipHashUpdate) location.hash = 'view=' + d.slug;
  }

  var skipHashUpdate = false;
  function filterLabel() {
    if (activeFilter === 'all') return 'All';
    if (activeFilter === 'sell') return 'Sell';
    if (activeFilter === 'serve') return 'Serve';
    if (activeFilter === 'nocrm') return 'Also works without CRM';
    return 'Uses Dynamics 365 data';
  }

  function openViewer(startSlug) {
    vwState.slugs = filteredSlugs();
    if (!vwState.slugs.length) vwState.slugs = DATA.map(function (d) { return d.slug; });
    var idx = vwState.slugs.indexOf(startSlug);
    vwState.idx = idx === -1 ? 0 : idx;
    vwState.returnFocusEl = document.activeElement;
    vwState.scrollY = window.scrollY;
    vwState.autoplay = document.getElementById('skvwAutoplay').checked;
    vw.hidden = false;
    document.body.classList.add('sk-modal-open');
    if (window.skPauseAllVideosForDetailView) window.skPauseAllVideosForDetailView();
    renderViewer();
    document.getElementById('skvwTitle').focus();
  }

  function closeViewer(skipHash) {
    var v = vw.querySelector('.skvw-media video');
    if (v) v.pause();
    vw.hidden = true;
    document.body.classList.remove('sk-modal-open');
    document.title = 'Dynamics 365 skills | Microsoft Becoming Frontier';
    if (!skipHash && location.hash.indexOf('#view=') === 0) history.pushState('', document.title, location.pathname + location.search);
    window.scrollTo(0, vwState.scrollY || 0);
    if (vwState.returnFocusEl && vwState.returnFocusEl.focus) vwState.returnFocusEl.focus();
    if (window.skResumeAutoplayForDetailView) window.skResumeAutoplayForDetailView();
  }

  function step(delta) {
    var ni = vwState.idx + delta;
    if (ni < 0 || ni >= vwState.slugs.length) return;
    vwState.idx = ni;
    renderViewer();
  }

  vw.querySelector('.skvw-back').addEventListener('click', function () { closeViewer(); });
  vw.querySelector('.skvw-close').addEventListener('click', function () { closeViewer(); });
  vw.querySelector('.skvw-prev').addEventListener('click', function () { step(-1); });
  vw.querySelector('.skvw-next').addEventListener('click', function () { step(1); });
  vw.querySelector('.skvw-backall').addEventListener('click', function () { closeViewer(); });
  vw.querySelector('.skvw-restart').addEventListener('click', function () { vwState.idx = 0; renderViewer(); });
  document.getElementById('skvwAutoplay').addEventListener('change', function (ev) { vwState.autoplay = ev.target.checked; });

  // Swipe support (phones) — FH47: axis-locked like the full-page view so a
  // horizontal swipe never scrolls the page sideways.
  (function () {
    var startX = null, startY = null, lock = null;
    vw.addEventListener('touchstart', function (ev) {
      startX = ev.touches[0].clientX; startY = ev.touches[0].clientY; lock = null;
    }, { passive: true });
    vw.addEventListener('touchmove', function (ev) {
      if (startX === null) return;
      var dx = ev.touches[0].clientX - startX, dy = ev.touches[0].clientY - startY;
      if (lock === null) lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lock === 'x') ev.preventDefault(); // own the gesture so the page never scrolls sideways
    }, { passive: false });
    vw.addEventListener('touchend', function (ev) {
      if (startX === null) return;
      var dx = ev.changedTouches[0].clientX - startX;
      if (lock === 'x' && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      startX = null; startY = null; lock = null;
    }, { passive: true });
  })();

  var viewAllBtn = document.getElementById('skViewAllBtn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', function () {
    var list = filteredSlugs();
    location.hash = 'view=' + (list[0] || DATA[0].slug);
  });
  document.querySelectorAll('.skfp-media').forEach(function () {}); // (reserved)

  // "Full screen" entry point is added to the full-page view's media controls.
  var fsBtn = document.createElement('button');
  fsBtn.type = 'button';
  fsBtn.className = 'skfp-mediabtn';
  fsBtn.setAttribute('aria-label', 'Full screen');
  fsBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>';
  var ctrls = document.createElement('div');
  ctrls.className = 'skfp-mediactrls';
  ctrls.appendChild(fsBtn);
  document.getElementById('skfpMedia').parentElement.querySelector('#skfpMedia').appendChild(ctrls);
  fsBtn.addEventListener('click', function () {
    if (fpState.slug) { closeFullPage(true); location.hash = 'view=' + fpState.slug; }
  });

  // ---------------- Keyboard + Esc + focus trap ----------------
  document.addEventListener('keydown', function (ev) {
    if (!fp.hidden) {
      if (ev.key === 'Escape') { closeFullPage(); return; }
      if (ev.key === 'ArrowLeft') { var p = fp.querySelector('.skfp-prev'); if (!p.disabled) location.hash = 'skill=' + p.dataset.slug; return; }
      if (ev.key === 'ArrowRight') { var n = fp.querySelector('.skfp-next'); if (!n.disabled) location.hash = 'skill=' + n.dataset.slug; return; }
      trapFocus(ev, fp);
    } else if (!vw.hidden) {
      if (ev.key === 'Escape') { closeViewer(); return; }
      if (ev.key === 'ArrowLeft') { step(-1); return; }
      if (ev.key === 'ArrowRight') { step(1); return; }
      trapFocus(ev, vw);
    }
  });
  function trapFocus(ev, root) {
    if (ev.key !== 'Tab') return;
    var focusables = [...root.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')].filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === first) { last.focus(); ev.preventDefault(); }
    else if (!ev.shiftKey && document.activeElement === last) { first.focus(); ev.preventDefault(); }
  }

  // ---------------- Hash routing ----------------
  function handleHash() {
    var h = location.hash.slice(1);
    if (h.indexOf('skill=') === 0) {
      var slug = decodeURIComponent(h.slice(6));
      if (BY_SLUG[slug]) { if (!vw.hidden) closeViewer(true); openFullPage(slug, true); return; }
    } else if (h.indexOf('view=') === 0) {
      var vslug = decodeURIComponent(h.slice(5));
      if (BY_SLUG[vslug]) { if (!fp.hidden) closeFullPage(true); openViewer(vslug); return; }
    } else {
      if (!fp.hidden) closeFullPage(true);
      if (!vw.hidden) closeViewer(true);
    }
  }
  window.addEventListener('hashchange', handleHash);
  handleHash();
})();
</script>`;
}

main();
