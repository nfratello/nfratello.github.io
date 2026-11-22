<!-- Scout-ready copy of the Frontier with Microsoft design standards instructions.
     Owner: Nick Fratello. Paste into Scout or point Scout at this file. -->

# Frontier with Microsoft Design Standards

Build and review content for the public "Frontier with Microsoft" sites so it matches the published design standards, and hand back a pass or fail report on the 17-point checklist.

## When to Use

- Building or reviewing a page, storyboard, scenario card, video, or app mockup for Frontier with Microsoft
- Content for the front door (https://nfratello.github.io/), The Hub (/intelligent-business-process/), The Brief (/microsoft-brief/), The Coach (inside The Brief), or the Design standards page (/style-guide/)
- "Check this against the Frontier design standards", "is this on-brand for The Hub?", "make a Frontier storyboard"

Audience: Nick Fratello's peers on Ted Kempf's team (for example Justin Raphael and Grant) and their agents.

## When NOT to Use

- General Microsoft brand, internal slide decks, Word documents, or emails not destined for the Frontier sites
- Publishing or deploying to the Frontier sites: contributors never publish directly; work goes to Nick Fratello for review
- Editing the source standards themselves (that is Nick's job)

## Source of Truth (read first; these win on any conflict)

Fetch and read these before building or reviewing anything:

1. https://nfratello.github.io/design-standards.md (plain-text standards, Version 2.3, updated November 22, 2026)
2. https://nfratello.github.io/frontier-tokens.json (colors, fonts, spacing, hero)
3. https://nfratello.github.io/frontier.css
4. https://nfratello.github.io/icons/icons.json (icon library)

If a published file disagrees with the summary in this skill, the published file wins. If a URL is not reachable, use the summary below and say so in the report (name the file that could not be read).

## Workflow

1. **Read the sources.** Fetch and read the four files above. Note the standards version and date. Record any file that failed to load.
2. **Build with the tokens and CSS only.** Use colors, fonts, spacing, radii and hero values from `frontier-tokens.json` and the classes in `frontier.css`. Never invent new colors, sizes or spacing. If a value you need is missing, use the nearest token and flag it in the report.
3. **Pull icons only from `icons.json`.** Use the official icon file it points to, unchanged. If a product has no entry, write the product name as plain text. Never generate, redraw, recolor, crop, flip or rotate an icon.
4. **Ground labels in Microsoft Learn.** Check every product name and on-screen label against current Microsoft Learn wording (learn.microsoft.com). For each product screen, record its source (Contoso demo screenshot, or the official screenshot it recreates) and the last-checked date.
5. **Run the 17-point checklist** (below). Report pass or fail for every item, with a one-line reason for each fail.
6. **Hand back, do not publish.** Deliver the work and the checklist report to the requester, ready to hand to Nick Fratello for review. Never push, commit or upload to the Frontier sites.

## Standards Summary (stable; the source files win on conflict)

### The 24 rules

1. **Canvas:** white and off-white sections with small pops of color; navy for the hero and footer; the header is white.
2. **Hero:** photo on the right 62 percent with the navy fade from the left (solid to 40 percent, 0.72 opacity at 55 percent, clear by 80 percent). Keep it; it is the signature.
3. **Colors per page:** neutrals, navy and one site or industry color; no more than three colors working together.
4. **Industry colors:** accents only (label, 4 px rule, tile edge, chip dot), never a full background, always shown with the industry name.
5. **Type:** Segoe Sans stack falling back to Segoe UI; three sizes per page (headline 34 to 56, section head 26 to 34, body 17); small-capital labels above headlines.
6. **Logo:** full Microsoft logo (official file) upper left of the white header, then a divider and Becoming Frontier; clear space equal to the four-square height.
7. **Header:** Microsoft color strip, 4 px, under the sub header, four equal parts #f25022 #7fba00 #00a4ef #ffb900, decoration only, never recolored or reordered, never used anywhere else on the page.
8. **Copilot + Dynamics 365 lockup:** white rounded box (14 px radius, 12 px 20 px padding), each icon at 32 px beside its name in 20 px semibold dark text, grey "+" between. A 1 px #e2e8f0 border on white backgrounds; no border when the box sits on navy. Use it once per page, near the top. Never alter the icons or the order.
9. **Product icons:** wherever a product is named in a chip, label, layer header, card, table or screen, show its official icon beside the name; body sentences stay plain text.
10. **Card links:** any card grid ending in a text link (industry cards, scenario cards, Industry Editions cards, Coach cards) uses Microsoft blue #0f6cbd, weight 600, 13 px, with a 12 px chevron SVG after the text; hover/focus #0b5394 with underline and a visible focus ring; never light cyan on white (min 4.5:1). Same short label per grid (e.g. "Read the Brief"), specific name kept in the accessible name via `aria-label`. Link gets `margin-top:auto` + 14 px top padding in a flex-column card so every link in a row shares one baseline; cards stretch to one height per row; two-line eyebrows get a minimum block size so titles still line up.
11. **Icon library only:** official Microsoft Learn icon packs, never changed, cropped, recolored, redrawn or generated; no official icon means the name as text.
12. **Spacing:** 4 px grid (4, 8, 12, 16, 24, 32, 48, 64); cards have 16 px corners and 24 px padding; sections 56 px.
13. **Photos:** real industry scenes, faces visible, screens facing their users, natural light.
14. **Product screens:** show what is real. Real screenshots from a Contoso demo environment first; otherwise exact recreations from current official screenshots with real labels and controls; flat and straight on; each screen lists its source and last-checked date.
15. **Words:** plain sentences, product name first, no emoji or arrow symbols; Contoso and other Microsoft fictional names only on public pages.
16. **Naming:** "Industry Editions" (both words capitalized) is the label for the 10 industry editions of The Brief, in navigation, buttons and section headings. In a running sentence use lowercase: "industry edition" / "industry editions". The Executive version is not an industry edition. Copilot is the brand: headlines, hero lockups, page titles, meta titles, section titles, share text and video/storyboard titles lead with "Copilot", never "Cowork" alone; body text says "Copilot Cowork" on first mention per page, then "Cowork" alone is fine. Leave unchanged: app-screen mockup window titles/icons, published file names and URLs, and quotes.
17. **No orphans:** no single word may sit alone on its own last line in any heading, lede, button or card title. Apply `text-wrap:balance` to headings/buttons/card titles and `text-wrap:pretty` to body paragraphs, lists and captions as a baseline, then join the last two words with `&nbsp;` wherever a short heading still breaks down to a one-word final line (roughly 24 characters or fewer combined). Never join across a UI badge/chip glued to the end of a heading.
18. **Share line:** a discreet "Built with Copilot | aka.ms/&lt;link&gt;" line, far right of row 1 after Subscribe on desktop (1 px #d1d5db divider, 13 px #6b7280 text, no box), with "Built with Copilot" as plain text plus the Microsoft Copilot icon (14 px) and `aka.ms/<link>` as a real button with a link icon (14 px, never a copy icon) before the text, that copies the full URL, swaps to a green check and "Link copied" (#107c41, #6ee7a8 on dark footers) for 1.6 seconds (`aria-live="polite"`, keyboard accessible), hover/focus turn blue #0f6cbd (#50e6ff on dark footers) with text underline, and a fixed `min-inline-size` so the header never shifts. On phones it moves to the top of the Menu panel and the footer only. One share line per page, always that page's own site/section link. Link icon before the short link; never a copy icon.
19. **One page width:** one shared width token, `--page-max: 1240px`, with `--page-pad: 28px` side padding (16px under 760 px). Row 1 content, row 2 content, the hero text and every page section's content sit inside that same centered container so their left edges line up (Microsoft logo, row 2 title, hero eyebrow); Subscribe / the share line end at the same right edge as page content. Backgrounds (row 1, row 2, color strip, navy hero) stay full width; only the content inside is constrained. Row 2 keeps sideways scrolling on phones. A deliberately wider full-bleed element (video, image band, a scoped promo strip) may stay full bleed.
20. **Journey:** front-door-only component — a horizontal row of four pill buttons (Home, The Brief, The Hub, The Coach) joined by a thin gradient line through the centre of the first and last pill (no overshoot), under the hero lede. Pills: white bold 16 px text, fully rounded, min width 132 px, soft shadow, lift 2 px on hover/focus. Home: 2 px white outline, "YOU ARE HERE" label, `aria-current="page"`. Option A gradients: Home `#0ea5e9`→`#2563eb`; The Brief `#2563eb`→`#6366f1`; The Hub `#6366f1`→`#a855f7`; The Coach `#a855f7`→`#db2777`; line `#2563eb, #6366f1, #a855f7, #db2777`. Under 760 px, pills stack vertically with the line running through their centres. One per site, front door only; never recolor with the Microsoft strip colors.
21. **Imagery and video — Product icons on every app screen:** any app window shown in an image, mockup or video carries the official product icon in its title bar: Cowork icon for Cowork, the specific Dynamics 365 app icon (Contact Center, Customer Service, Sales, Finance, Supply Chain Management and so on) for Dynamics 365 screens, and the Copilot Studio icon on agent labels. Product chips and footers use the icon plus name. Icons come only from the Frontier icon library. Never use the Microsoft 365 Copilot icon; the brand is Microsoft Copilot.
22. **Product names stay on one line:** never split Dynamics 365 (and every "Dynamics 365 &lt;App&gt;" pair, keeping "Dynamics 365" together at minimum), Microsoft 365, Microsoft Copilot, Copilot Studio, Copilot Cowork, Agent 365, Power Platform, Power Apps, Power Automate, Power BI, Microsoft Teams, Microsoft Fabric, Business Central, Contact Center, Customer Service, Supply Chain Management, Field Service across a line break in visible text (headings, body, buttons, chips, nav, captions) — join with a non-breaking space or `.nobr{white-space:nowrap}`, applied in the build step so new pages inherit it automatically. Numbers stay with their units; `aka.ms/...` links stay whole.
23. **Section highlight:** row 2 shows the current section with the same active marker as row 1 — a 3 px Microsoft blue #0f6cbd bar under the link, fully rounded ends, 6 px above the bottom edge of row 2 (clear gap before the color strip), active text #111827. One shared script drives both rows: row 1 reads the `.on` class already set in markup; row 2 matches by path prefix for cross-page links, or IntersectionObserver scrollspy for in-page anchors that exist on the current page, moving to the clicked link immediately and to the page's hash on load. No link is marked before the first section. The bar slides with a 200 ms transition (disabled under `prefers-reduced-motion: reduce`) and never shifts neighbouring links. Phone Menu panel: current item in #111827 with a 3 px left-edge bar instead of underneath.
24. **This week cards:** the three front-door "This week" cards (The Brief, The Hub, The Coach) share one structure top to bottom — 16:9 image, eyebrow, title, description, a detail block, then a button — built with CSS subgrid so every row lines up across all three cards (fallback without subgrid support: fixed min-heights for title/description, the detail block set to `flex:1`, button pinned to the bottom with `margin-top:auto`). Card identity comes from the image and the eyebrow color only, never a colored top border: Brief blue #2563eb to indigo #6366f1, Hub indigo #6366f1 to violet #a855f7, Coach violet #a855f7 to pink #db2777 (eyebrow shown in #a21caf for contrast), matching the journey pill gradients. Buttons stay navy for all three.

### Colors

| Role | Name | Hex |
|------|------|-----|
| Neutral | Navy | #081628 |
| Neutral | Ink | #0f172a |
| Neutral | Muted | #475569 |
| Neutral | Line | #e2e8f0 |
| Neutral | Off-white | #f6f7f9 |
| Layer | Dynamics 365 | #002050 |
| Layer | Agents | #6d28d9 |
| Layer | Copilot Cowork | #0e7490 |
| Site | The Brief | #c2410c |
| Site | The Hub | #0e7490 |
| Site | The Coach | #6d28d9 |
| Header | Microsoft color strip | #f25022 #7fba00 #00a4ef #ffb900 |

Industry accents (all pass at least 4.5 to 1 on white): Hospitality #0e7490, Manufacturing #a16207, High Tech #6d28d9, Telecom #a21caf, Healthcare #0f766e, Financial Services #1d4ed8, Retail #be123c, Energy #15803d, Professional Services #475569, State, Local and Education #0369a1.

### Header (v1.4, every page)
One shared header on the front door, The Brief, The Hub, The Coach, the storyboards and Design standards. Copy it exactly from the published pages; do not restyle it.
1. White bar, 60 px tall (56 px on phones), thin bottom border #e0e0e0, sticky at the top.
2. Left: the full Microsoft logo (four-square and wordmark, official file), a 1 px divider #bdbdbd, then "Becoming Frontier" (18 px, semibold, #242424). The lockup links to the front door.
3. Right-aligned: The Brief, The Hub, The Coach (15 px, #616161, semibold), then a navy Subscribe button (#081628). The current link is #111827 with a 3 px Microsoft blue #0f6cbd bar underneath, rounded ends, 6 px above the bottom edge. Nothing else in this row.
4. Section row under it (44 px, #fafafa): the section name in bold, then that section's own links in the same active-marker pattern as row 1. The front door has no section row.
5. Microsoft color strip: a 4 px strip, full width, along the bottom edge of the section row (or the bottom of row 1 on pages with no section row), in four equal parts left to right: #f25022, #7fba00, #00a4ef, #ffb900. Decoration only: no text, aria-hidden, not clickable, stays with the sticky header. Never recolored, reordered or used anywhere else on the page.
6. Phones: lockup plus a Menu button that opens the same links (current item shown with a 3 px blue left-edge bar); the section row scrolls sideways with a soft edge fade.
7. Below the header: the navy fade hero, unchanged. Anchor offsets: 112 px with a section row, 68 px without.
8. Email editions of the Brief keep their own email-safe header.

### The 18-point checklist

1. Text contrast at least 4.5 to 1
2. No more than three colors working together
3. Hero uses the navy fade from the left with the photo on the right
4. Every product named in a chip, label, header, card or table has its library icon beside it, or plain text if none
5. No icon cropped, flipped, rotated, recolored, redrawn or generated
6. Product names and screen labels match current Microsoft Learn wording
7. Every product screen is a real screenshot or an exact recreation, with source and last-checked date
8. Only Contoso and other Microsoft fictional company names
9. No emoji or arrow symbols
10. Segoe Sans stack, no more than three type sizes per page
11. 4 px spacing grid, 16 px card corners
12. Header matches the v1.4 header rules (Microsoft logo, divider, Becoming Frontier; The Brief, The Hub, The Coach, Subscribe with the current link marked by the blue bar; section row with the same marker; Microsoft color strip); Copilot + Dynamics 365 lockup used once per page, near the top
13. Reads well at 390 px phone width
14. Footer says Contoso is fictional and when labels were last checked
15. Every app screen shows its product icon
16. No product name is split across a line break
17. Every card link is Microsoft blue, at least 4.5:1 contrast, and lines up at the bottom of its card across the row
18. The three "This week" cards line up row for row (eyebrow, title, description, detail block, button) and each card's identity color matches its journey pill

## Output Format

Return the work, then this report:

```
Frontier design check — {item name}
Standards: design-standards.md v{version}, {date} (or: "not reachable, used skill summary")
Sources unreachable: {list or "none"}

| # | Check | Result | Reason (fails only) |
|---|-------|--------|---------------------|
| 1 | Text contrast >= 4.5:1 | PASS | |
| ... (all 17 rows) |

Screens: {screen} — source: {Contoso demo / official screenshot URL}, last checked {date}
Next step: hand to Nick Fratello for review (not published).
```

## Guardrails

- Read the source files first; they win over this skill on any conflict. Say when one could not be read.
- Never invent colors, sizes, spacing or icons; use the tokens, CSS and icon library only.
- Never publish, push or upload to the Frontier sites; hand work to Nick Fratello for review.
- Never use real customer or partner company names on public pages; use Contoso and other Microsoft fictional names.
- Never fabricate product screens or labels; if a real screenshot or exact recreation is not possible, say so and leave a labeled placeholder.
- Report every checklist item honestly; never mark an item PASS you did not check.

## Common Issues

| Issue | Fix |
|-------|-----|
| A source URL returns 404 | Use the summary above, note the missing file in the report |
| Product has no entry in icons.json | Write the product name as plain text, no icon |
| Need a fourth color | Drop it; use neutrals, navy and one site or industry color |
| Industry color wanted as a background | Use it as a label, 4 px rule, tile edge or chip dot instead |
