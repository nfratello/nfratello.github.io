# Frontier with Microsoft Design Standards

Version 2.2, updated November 21, 2026. Applies to the front door, The Brief, The Hub, The Coach, storyboards and the App Library.

Human page: https://nfratello.github.io/style-guide/
Tokens: https://nfratello.github.io/frontier-tokens.json
Styles: https://nfratello.github.io/frontier.css
Icon library: https://nfratello.github.io/icons/icons.json

## Use with your agent

Follow the Frontier with Microsoft Design Standards v1.3 for everything you build.
1. Read https://nfratello.github.io/style-guide/ and https://nfratello.github.io/design-standards.md before you start.
2. Use the colors, fonts and spacing in https://nfratello.github.io/frontier-tokens.json and the styles in https://nfratello.github.io/frontier.css. Do not invent new ones.
3. Use product icons only from the Frontier icon library listed in https://nfratello.github.io/icons/icons.json. Put the icon beside the product name every time a product is named in a chip, label, header, card or table. If the library has no icon, use the name as text.
4. Ground every product name and screen label in current Microsoft Learn wording.
5. Before you hand anything back, run the numbered checklist in the standards and report pass or fail for each item.

## Rules

- **Canvas.** White and off-white sections with small pops of color. Navy for the hero and the footer. The header is white.
- **Hero.** Photo on the right 62 percent, with the navy fade from the left: solid to 40 percent, soft by 55 percent, clear by 80 percent. People and the device sit in the right of the photo. Keep it: it is our signature.
- **Colors per page.** Neutrals, navy and one industry or site color. No more than three colors working together.
- **Industry colors.** Accents only: the label, a 4 px rule, a tile edge, a chip dot. Never a full background. Always show the industry name next to the color.
- **Type.** Segoe Sans, falling back to Segoe UI. Three sizes per page: headline (34 to 56), section head (26 to 34), body (17). Labels in small capitals above headlines.
- **Microsoft logo.** Full Microsoft logo (four-square and wordmark, official file) at the upper left of the white header, then a divider, then Becoming Frontier. Clear space equal to the four-square height.
- **Header.** Microsoft color strip, 4 px, under the sub header, four equal parts #f25022 #7fba00 #00a4ef #ffb900, decoration only, never recolored or reordered, never used anywhere else on the page.
- **Copilot + Dynamics 365 lockup.** White rounded box (14 px radius, 12 px 20 px padding), each icon at 32 px beside its name in 20 px semibold dark text, grey "+" between. A 1 px #e2e8f0 border on white backgrounds; no border when the box sits on navy. Use it once per page, near the top. Never alter the icons or the order.
- **Naming.** "Industry Editions" (both words capitalized) is the label for the 10 industry editions of The Brief, in navigation, buttons and section headings. In a running sentence use lowercase: "industry edition" / "industry editions". The Executive version is not an industry edition. Copilot is the brand: headlines, hero lockups, page titles, meta titles, section titles, share text and video/storyboard titles lead with "Copilot", never "Cowork" alone. In body text, write "Copilot Cowork" on first mention of the delegated-work capability on a page, then "Cowork" alone is fine after that. Leave unchanged: app-screen mockups whose window title is the product UI, the Cowork icon on those screens, published file names and URLs, and quotes.
- **Section highlight.** Row 2 (the site's own section links) shows where the viewer is with the same active marker as row 1: a 3 px Microsoft blue #0f6cbd bar under the link, fully rounded ends, sitting 6 px above the bottom edge of row 2 so there is a clear gap before the color strip; active text in #111827. Row 1 uses the identical bar and color on whichever link is already marked current in that page's markup. Row 2's match comes from one shared script, not a per-page table: a link whose href points to the current page (or a path the current page sits under) is marked by path; a link whose href is an in-page anchor that exists on the current page is tracked with IntersectionObserver scrollspy so the bar follows the section in view, moving to the clicked link immediately and to the loaded page's hash on landing; before the first section, no row-2 link is marked (row 1 still is). The bar slides with a 200 ms transition (none under `prefers-reduced-motion: reduce`) and never shifts neighbouring links. On phones, the current item in the Menu panel is shown in the same blue with the bar on the left edge instead of underneath.
- **No orphans.** No single word may sit alone on its own last line in any heading, lede, button or card title. Apply `text-wrap:balance` to headings/buttons/card titles and `text-wrap:pretty` to body paragraphs, lists and captions as a baseline, then join the last two words with `&nbsp;` wherever a short heading still breaks down to a one-word final line (roughly 24 characters or fewer combined). Never join across a UI badge/chip (e.g. a status pill) glued to the end of a heading — badges are not part of the heading's own last line.
- **Share line.** A discreet "Built with Copilot | aka.ms/&lt;link&gt;" line, far right of row 1 after Subscribe on desktop, after a 1 px #d1d5db divider, in small grey text (13 px, #6b7280), no box. "Built with Copilot" is plain text with the Microsoft Copilot icon (14 px), never a link. The `aka.ms/<link>` text is a real button with a link icon (14 px, never a copy icon) before the short link text: clicking copies the full `https://aka.ms/<link>` URL to the clipboard, swaps the icon for a green check and the text to "Link copied" in #107c41 (#6ee7a8 on dark footers) for 1.6 seconds (`aria-live="polite"`), then restores; keyboard accessible (Enter and Space, since it is a native `<button>`); if the clipboard is blocked, the link text is selected instead so the user can copy manually; hover shows the full link via `title`, and hover/keyboard focus turn the icon and text Microsoft blue #0f6cbd with an underline on the text (#50e6ff on dark footers). The button has a `min-inline-size` equal to its resting width so the header never shifts when the text/icon change. Link icon before the short link; never a copy icon. On phones (under 760 px) the line is hidden from row 1 and instead appears at the top of the Menu panel and in the page footer. One share line per page, always pointing at that page's own site/section link (never a different site's link), and never in a styled box. Page-to-link table:

  | Page(s) | Link |
  |---|---|
  | Front door (Frontier_Home.html, index.html) | aka.ms/TheFrontierHub |
  | The Hub (Intelligent_Business_Process_Hub.html, the storyboard) | aka.ms/BusinessProcessHub |
  | Dynamics 365 skills page | aka.ms/Dynamics365Skills |
  | Design standards and icon library pages | aka.ms/TheFrontierHub |
  | The Brief (all Brief pages except below) | aka.ms/MicrosoftBrief |
  | The Coach pages | aka.ms/CopilotCoach |
  | Convergence page | aka.ms/ConvergenceBrief |
  | Ignite event page | aka.ms/IgniteBrief |
  | Ignite recap page | aka.ms/MicrosoftIgniteRecap |
- **One page width.** One shared width token, `--page-max: 1240px`, with `--page-pad: 28px` side padding (16px under 760 px). Row 1 content, row 2 content, the hero text and every page section's content sit inside that same centered container so their left edges line up: the Microsoft logo, the row 2 title and the hero eyebrow all start at the same x position, and Subscribe / the share line end at the same right edge as page content. Backgrounds stay full width — the white row 1, the light grey row 2, the color strip and the navy hero still run edge to edge; only the content inside is constrained. Row 2 keeps sideways scrolling on phones. A page that deliberately uses a wider full-bleed element (video, image band, a scoped promo strip) may leave that one element full bleed.
- **Journey.** Front-door-only component: a horizontal row of four pill buttons (Home, The Brief, The Hub, The Coach), joined by a thin gradient line that runs through the centre of the first and last pill with no overshoot, directly under the hero lede. Each pill: white bold 16 px text, fully rounded, minimum width 132 px, soft shadow, lifts 2 px on hover and keyboard focus. Home carries a 2 px white outline and a "YOU ARE HERE" label and `aria-current="page"`. Option A gradients, left to right, each pill starting where the previous ends: Home `#0ea5e9` to `#2563eb`; The Brief `#2563eb` to `#6366f1`; The Hub `#6366f1` to `#a855f7`; The Coach `#a855f7` to `#db2777`. Connecting line: gradient `#2563eb, #6366f1, #a855f7, #db2777`. On phones (under 760 px) the pills stack vertically with the label beside each pill and the line running vertically through the pill centres. One journey per site, on the front door only; never recolor it with the Microsoft strip colors.
- **Product icons.** Wherever a product is named in a chip, label, layer header, card, table or screen, show its official icon right beside the name. Body sentences stay plain text.
- **Card links.** Any card grid that ends in a text link (industry cards, scenario cards, Industry Editions cards, Coach cards) uses Microsoft blue #0f6cbd text, weight 600, 13 px, with a 12 px chevron SVG after the text (stroke currentColor, never an arrow character). Hover and focus turn #0b5394 with an underline and a visible focus ring; never light cyan on white (minimum 4.5:1 contrast). Use the same short label on every card in a grid (for example "Read the Brief"), keeping the specific name in the accessible name (`aria-label="Read the &lt;Name&gt; Brief"`) so links still fit on one line. The link gets `margin-top:auto` and 14 px top padding inside a `display:flex;flex-direction:column` card, so every link in a row sits on the same baseline; cards in a row share one height (`align-items:stretch` or `grid-auto-rows:1fr`). Give any two-line eyebrow a minimum block size so titles still line up across the row.
- **Icon library.** Use only icons from the Frontier icon library. Official Microsoft Learn packs, never changed, cropped, recolored or redrawn. No official icon yet: show the name as text.
- **Spacing.** 4 px grid: 4, 8, 12, 16, 24, 32, 48, 64. Cards 16 px corners and 24 px padding. Sections 56 px top and bottom.
- **Photos.** Real industry scenes, faces visible, screens facing the people using them, natural light, uncluttered.
- **Product screens.** Show what is real. Real screenshots from a Contoso demo environment first; otherwise exact recreations from current official screenshots, with real labels and controls. Flat and straight on, never angled or stacked. Each screen lists its source and last-checked date.
- **Imagery and video — Product icons on every app screen.** Any app window shown in an image, mockup or video carries the official product icon in its title bar: Cowork icon for Cowork, the specific Dynamics 365 app icon (Contact Center, Customer Service, Sales, Finance, Supply Chain Management and so on) for Dynamics 365 screens, and the Copilot Studio icon on agent labels. Product chips and footers use the icon plus name. Icons come only from the Frontier icon library. Never use the Microsoft 365 Copilot icon; the brand is Microsoft Copilot.
- **Product names stay on one line.** Never split these names across a line break in visible text: Dynamics 365 (and every "Dynamics 365 &lt;App&gt;" pair keeps "Dynamics 365" together at minimum), Microsoft 365, Microsoft Copilot, Copilot Studio, Copilot Cowork, Agent 365, Power Platform, Power Apps, Power Automate, Power BI, Microsoft Teams, Microsoft Fabric, Business Central, Contact Center, Customer Service, Supply Chain Management, Field Service. Join the two words with a non-breaking space (or `<span class="nobr">` with `.nobr{white-space:nowrap}`) wherever the name appears: headings, body, buttons, chips, nav, captions. Apply this in the build step or a shared script, not by hand, so new pages get it automatically. Numbers stay with their units, and `aka.ms/...` links stay whole.
- **Words.** Plain sentences. Product name first, then what it does. No emoji or arrows. Contoso and other Microsoft fictional names only on public pages.

## Colors

- Navy: #081628 (hero, footer, Subscribe button)
- Ink: #0f172a (Text and primary buttons)
- Muted: #475569 (Supporting text)
- Off-white: #f6f7f9 (Alternate sections)
- Dynamics 365 layer: #002050 (System of record)
- Agent layer: #6d28d9 (Agents)
- Cowork layer: #0e7490 (Copilot Cowork)
- Microsoft color strip: #f25022 #7fba00 #00a4ef #ffb900 (4 px, under the sub header, decoration only)

Industry colors (accents only, always with the industry name):

- All Industries: #c2410c (5.2:1 on white)
- Hospitality: #0e7490 (5.4:1 on white)
- Manufacturing: #a16207 (4.9:1 on white)
- High Tech: #6d28d9 (7.1:1 on white)
- Telecom: #a21caf (6.3:1 on white)
- Healthcare: #0f766e (5.5:1 on white)
- Financial Services: #1d4ed8 (6.7:1 on white)
- Retail: #be123c (6.3:1 on white)
- Energy: #15803d (5.0:1 on white)
- Professional Services: #475569 (7.6:1 on white)
- State, Local and Education: #0369a1 (5.9:1 on white)

## Checklist (report pass or fail for each)

1. Text contrast is at least 4.5 to 1 on its background.
2. No more than three colors work together on the page: neutrals, navy and one site or industry color.
3. The hero uses the navy fade from the left, with the photo on the right.
4. Every product named in a chip, label, header, card or table has its icon from the Frontier icon library beside it, or plain text if the library has none.
5. No icon is cropped, flipped, rotated, recolored, redrawn or generated.
6. Every product name and screen label matches current Microsoft Learn wording.
7. Every product screen is a real screenshot or an exact recreation, and lists its source and last-checked date.
8. Only Contoso and other Microsoft fictional company names appear. No customer names.
9. No emoji or arrow symbols anywhere.
10. Fonts follow the Segoe Sans stack, with no more than three sizes per page.
11. Spacing follows the 4 px grid; cards use 16 px corners.
12. The header matches the v1.4 header rules: Microsoft logo, divider, Becoming Frontier; The Brief, The Hub, The Coach and Subscribe on the right with the current link marked by the blue bar; a section row with the section's own links and the same active marker; the Microsoft color strip under the sub header; the Copilot + Dynamics 365 lockup used once per page, near the top.
13. The page reads well at phone width (390 px).
14. The footer says Contoso is fictional and when labels were last checked.
15. Every app screen shows its product icon.
16. No product name (Dynamics 365, Microsoft 365, Copilot Studio and the rest of the list) is split across a line break.
17. Every card link is Microsoft blue #0f6cbd (never light cyan), at least 4.5:1 contrast, and lines up at the bottom of its card across the row.

## Header (v1.4, every page)
One shared header on the front door, The Brief, The Hub, The Coach, the storyboards and Design standards. Copy it exactly from the published pages; do not restyle it.
1. White bar, 60 px tall (56 px on phones), thin bottom border #e0e0e0, sticky at the top.
2. Left: the full Microsoft logo (four-square and wordmark, official file), a 1 px divider #bdbdbd, then "Becoming Frontier" (18 px, semibold, #242424). The lockup links to the front door.
3. Right-aligned: The Brief, The Hub, The Coach (15 px, #616161, semibold), then a navy Subscribe button (#081628). The current link is #111827 with a 3 px Microsoft blue #0f6cbd bar underneath, fully rounded ends, 6 px above the bottom edge of row 1/the section row. Nothing else in this row.
4. Section row under it (44 px, #fafafa): the section name in bold, then that section's own links in the same style and active-marker pattern as row 1 (see Section highlight). The front door has no section row.
5. Microsoft color strip: a 4 px strip, full width, along the bottom edge of the section row (or the bottom of row 1 on pages with no section row), in four equal parts left to right: #f25022, #7fba00, #00a4ef, #ffb900 (the Microsoft logo colors). Decoration only: no text, aria-hidden, not clickable, stays with the sticky header. Never recolored, reordered or used anywhere else on the page. Use once per header.
6. Phones: lockup plus a Menu button that opens the same links (current item shown in #111827 with a 3 px blue left-edge bar); the section row scrolls sideways with a soft fade at the scrollable edge.
7. Below the header: the navy fade hero, unchanged. Anchor offsets: 112 px with a section row, 68 px without.
8. Email editions of the Brief keep their own email-safe header.
