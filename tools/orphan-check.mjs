// tools/orphan-check.mjs
// Design standards v1.4 — "No orphans" check.
//
// For each h1, h2, h3, .lede, button and card title (.card h3) on a page,
// measures the rendered position of every word (via a DOM Range per word,
// splitting ONLY on real ASCII whitespace so an &nbsp;-joined pair of words
// is treated as one unbreakable token), clusters words into visual lines by
// rounded top position (8px tolerance absorbs badge/pill sub-pixel jitter),
// and flags any element whose LAST visual line holds exactly one token while
// the element renders two or more lines total.
//
// Known UI badge/chip classes are excluded from analysis by class name
// (not by geometry) because they are glued to a heading or button's text in
// the markup with no separating space, but render as a visually distinct
// pill/chip rather than a continuation of the element's own prose or label:
//   - .st3  event status pills, e.g. "...CopilotGenerally available"
//   - .ck   edition-picker checkmark badge (paired with the .vh
//           screen-reader-only text " (in your Brief)")
//   - .vh   screen-reader-only helper text for the .ck badge
//
// Usage:
//   node tools/orphan-check.mjs <url1> <url2> ... --width=1440
//   node tools/orphan-check.mjs <url1> <url2> ... --width=390
//
// Requires Playwright (npm i -D playwright). This script is runner-agnostic:
// it exports `checkPage(page, url, width, height)` for use from any
// Playwright/Puppeteer-based test, and also runs standalone via Playwright
// if invoked directly with `node`.

const SELECTORS = ['h1', 'h2', 'h3', '.lede', 'button', '.card h3'];
const BADGE_CLASSES = ['st3', 'ck', 'vh'];

/**
 * Injected into the page. Returns an array of flagged elements:
 * { selector, text, lines, tag, className }
 */
function browserCheck([selectors, badgeClasses]) {
  function isInsideBadge(node) {
    let el = node.parentElement;
    while (el) {
      if (badgeClasses.some(c => el.classList && el.classList.contains(c))) return true;
      el = el.parentElement;
    }
    return false;
  }

  const flags = [];
  const seen = new Set();
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      if (seen.has(el)) return; // avoid double-flagging e.g. a button that is also .card h3
      seen.add(el);
      const style = getComputedStyle(el);
      if (style.display === 'none' || el.offsetParent === null) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      const nodeInfo = [];
      let fullText = '';
      while ((node = walker.nextNode())) {
        if (isInsideBadge(node)) continue;
        nodeInfo.push(node);
        fullText += node.textContent;
      }
      const text = fullText.replace(/\s+/g, ' ').trim();
      if (!text) return;

      const frags = [];
      // Split on real ASCII whitespace only; NBSP (\u00A0) must NOT split a
      // token, so an nbsp-joined "last two words" measures as one unit.
      const wordRe = /[^ \t\n\r\f]+/g;
      for (const info of nodeInfo) {
        const t = info.textContent;
        let m;
        while ((m = wordRe.exec(t))) {
          const r = document.createRange();
          r.setStart(info, m.index);
          r.setEnd(info, m.index + m[0].length);
          for (const rect of r.getClientRects()) {
            if (rect.width > 0 && rect.height > 0) frags.push({ top: rect.top, hasNbsp: m[0].includes('\u00A0') });
          }
        }
      }
      if (frags.length < 2) return;

      const TOL = 8; // px tolerance for clustering fragments into a visual line
      const sorted = [...frags].sort((a, b) => a.top - b.top);
      const lines = [];
      for (const f of sorted) {
        let placed = false;
        for (const line of lines) {
          if (Math.abs(line.top - f.top) < TOL) { line.frags.push(f); placed = true; break; }
        }
        if (!placed) lines.push({ top: f.top, frags: [f] });
      }
      if (lines.length < 2) return;
      const lastLine = lines.reduce((a, b) => (a.top > b.top ? a : b));
      // Orphan only if exactly one token sits on the last line AND that
      // token is a single real word (not an &nbsp;-glued pair of words).
      if (lastLine.frags.length === 1 && !lastLine.frags[0].hasNbsp) {
        flags.push({
          selector: sel,
          text: text.slice(0, 120),
          lines: lines.length,
          tag: el.tagName.toLowerCase(),
          className: el.className || null,
        });
      }
    });
  }
  return flags;
}

export async function checkPage(page, url, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: 'load' });
  const flags = await page.evaluate(browserCheck, [SELECTORS, BADGE_CLASSES]);
  return flags.map(f => ({ ...f, url, width }));
}

// Standalone CLI runner (Playwright required: `npm i -D playwright`).
if (import.meta.url === `file://${process.argv[1]}`) {
  const { chromium } = await import('playwright');
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const widthArg = process.argv.find(a => a.startsWith('--width='));
  const width = widthArg ? parseInt(widthArg.split('=')[1], 10) : 1440;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let totalFlags = 0;
  for (const url of args) {
    const flags = await checkPage(page, url, width);
    if (flags.length === 0) {
      console.log(`OK   (${width}px)  ${url}`);
    } else {
      totalFlags += flags.length;
      console.log(`FLAG (${width}px) ${url}`);
      for (const f of flags) {
        console.log(`  - <${f.tag}${f.className ? '.' + f.className.split(' ').join('.') : ''}> "${f.text}" (${f.lines} lines)`);
      }
    }
  }
  await browser.close();
  console.log(`\n${args.length} pages checked at ${width}px, ${totalFlags} flags.`);
  process.exit(totalFlags > 0 ? 1 : 0);
}
