/* scripts/apply-button-tokens.js — P40: solid CTA button colors by destination
 * site, Subscribe hover-text-disappears fix.
 *
 * For each HTML file:
 * 1. Rewrites the `.btn{...}` base rule (whatever page-specific background it
 *    had — var(--ink), #0f172a, #111827, etc.) to the new shared, color-less
 *    base plus hover/press/focus-visible mechanics (lift, glow, arrow motion,
 *    reduced-motion guard), and appends the three color variants:
 *    .btn-brief / .btn-hub / .btn-coach.
 * 2. Classifies every `<a class="btn" href="...">` (and `<a class="btn ...">`
 *    with other existing modifier classes preserved) by its href and adds
 *    the matching variant class. Skips `.btn.o` outline/secondary buttons
 *    (those are "Coming soon" style badges, not solid CTAs) and any `.btn`
 *    that is not inside an `href` anchor (e.g. mock product-screen UI text).
 * 3. Fixes the header Subscribe button: scopes the generic nav hover-color
 *    rule to exclude `.cta`, and recolors `.gh a.cta` to the new primary
 *    token (#0f6cbd / hover #115ea3 / pressed #0f548c), guaranteeing white
 *    text in every state.
 *
 * Run with: node scripts/apply-button-tokens.js
 */
'use strict';
const fs = require('fs');
const { listHtmlFiles } = require('../tools/lib');

function classify(href) {
  if (!href) return null;
  if (/\/coach\//.test(href)) return 'btn-coach';
  if (/microsoft-brief/.test(href)) return 'btn-brief';
  return 'btn-hub';
}

function newBtnBlock(existingOutline) {
  // Appends hover/press/focus mechanics and the three destination color
  // variants. Deliberately does NOT touch the original `.btn{...}` rule's
  // own background — real CTAs get recolored via the added .btn-brief /
  // .btn-hub / .btn-coach modifier class (later in the cascade, so it wins
  // on specificity-tie by source order); anything NOT classified (e.g. a
  // mock product-screen button like `<span class="btn">Edit</span>` inside
  // a Contoso screen recreation) keeps its original color untouched, which
  // is correct — those aren't live navigational CTAs.
  return (
    '.btn{display:inline-flex;align-items:center;gap:4px;transition:background-color .15s ease,transform .15s ease,box-shadow .15s ease}' +
    '.btn .arr{display:inline-block;transition:transform .15s ease}' +
    '.btn:hover{transform:translateY(-1px)}.btn:hover .arr{transform:translateX(4px)}' +
    '.btn:active{transform:translateY(0)}' +
    '.btn:focus-visible{outline:2px solid #fff;box-shadow:0 0 0 2px #fff,0 0 0 4px currentColor}' +
    '@media (prefers-reduced-motion:reduce){.btn,.btn .arr{transition:none}.btn:hover{transform:none}.btn:hover .arr{transform:none}}' +
    '.btn-brief{background:#1d4ed8;color:#fff}.btn-brief:hover{background:#1e40af;color:#fff;box-shadow:0 6px 16px -4px rgba(29,78,216,.6)}.btn-brief:active{background:#1e3a8a;color:#fff}' +
    '.btn-hub{background:#4f46e5;color:#fff}.btn-hub:hover{background:#4338ca;color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.6)}.btn-hub:active{background:#3730a3;color:#fff}' +
    '.btn-coach{background:#9333ea;color:#fff}.btn-coach:hover{background:#7e22ce;color:#fff;box-shadow:0 6px 16px -4px rgba(147,51,234,.6)}.btn-coach:active{background:#6b21a8;color:#fff}' +
    (existingOutline || '')
  );
}

let filesTouched = 0;
let buttonsClassified = { brief: 0, hub: 0, coach: 0 };
let headerFixed = 0;

for (const file of listHtmlFiles()) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;

  const fullBtnMatch = content.match(/\.btn\{[^}]*\}\s*(\.btn\.o\{[^}]*\})?/);
  if (fullBtnMatch) {
    content = content.replace(fullBtnMatch[0], fullBtnMatch[0] + newBtnBlock(null));
  }

  content = content.replace(/<a class="btn([^"]*)" href="([^"]+)"/g, (full, extra, href) => {
    if (/\bo\b/.test(extra.trim())) return full;
    const variant = classify(href);
    if (!variant) return full;
    buttonsClassified[variant.replace('btn-', '')]++;
    return `<a class="btn ${variant}${extra}" href="${href}"`;
  });

  if (content.includes('.gh .gnav a:hover{color:#242424}')) {
    content = content.split('.gh .gnav a:hover{color:#242424}').join('.gh .gnav a:not(.cta):hover{color:#242424}');
    headerFixed++;
  }
  // Only the .gh a.cta{...} rule that actually sets a background (the real
  // button style, not the @media margin/padding-only override) gets recolored.
  content = content.replace(
    /\.gh a\.cta\{([^}]*background:#081628[^}]*)\}/,
    (full, body) => {
      const newBody = body.replace('background:#081628', 'background:#0f6cbd');
      return `.gh a.cta{${newBody}}.gh a.cta:hover,.gh a.cta:focus-visible{background:#115ea3;color:#fff}.gh a.cta:active{background:#0f548c;color:#fff}`;
    }
  );

  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    filesTouched++;
  }
}

console.log(`Touched ${filesTouched} file(s). Header Subscribe fix applied to ${headerFixed} file(s).`);
console.log('Buttons classified:', buttonsClassified);
