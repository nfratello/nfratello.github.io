# Scout prompt: bring the Brief and the Coach onto the Frontier style (v1.0)

Paste everything below into Scout on the laptop.

---

Work in the repo at C:\Users\nifra\source\microsoft-brief (keep .git). Run gh auth switch to nfratello, then gh auth setup-git. Make the changes below as one commit, without changing any edition content.

1. Shared top bar on every page:
   - Navy bar, background #081628.
   - Upper left: the Microsoft four-square (8 px squares, 2 px gap, colors #f25022, #7fba00, #00a4ef, #ffb900) followed by the words "Frontier with Microsoft". This links to https://nfratello.github.io/.
   - Then the links Home, The Brief, The Hub (https://nfratello.github.io/intelligent-business-process/) and The Coach. The current site is highlighted.
2. Fonts: font-family "Segoe Sans Text","Segoe UI Variable Text","Segoe UI",Arial,sans-serif for body text. Use the Display versions for h1 to h3 at weight 600. Use no more than three type sizes per page: headline 34 to 56, section head 26 to 34, body 17.
3. Industry colors in patch_editions.py and the CSS:
   - Manufacturing #a16207 (was #2563eb)
   - Healthcare #0f766e (was #0d9488)
   - Federal #1e3a8a (was #1e40af)
   - Retail #be123c (was #be185d)
   - All other colors stay the same.
   - Industry colors are accents only: labels, a 4 px top rule on cards, and chip dots. Never full backgrounds.
4. Canvas: sections alternate white and off-white #f6f7f9. Navy is used only for the top bar, heroes and the footer. KEEP the existing hero photo with the navy fade from the left exactly as it is.
5. Spacing: use the 4 px grid (4, 8, 12, 16, 24, 32, 48, 64). Cards get 16 px corners, 24 px padding and a 1 px #e2e8f0 border. Sections get 56 px padding top and bottom.
6. Product icons:
   - On the Dynamics 365 product page, show the official Dynamics 365 app icon (from the Microsoft Learn Dynamics 365 icon pack) at 18 to 32 px, directly before each product name.
   - Never use the icons alone, as a logo or as decoration.
   - Do not change, crop or recolor them.
7. Industry editions: each industry's "Contoso storyboard coming soon" card becomes "See scenarios in The Hub". It links to https://nfratello.github.io/intelligent-business-process/?ind=<Industry name>.
8. The Coach page:
   - Add a Cowork track with three levels: 1 Copilot Chat, 2 Copilot Cowork, 3 Agents in Dynamics 365.
   - Show each level as a card with a placeholder first move ("First move coming soon").
   - Keep the existing role and industry chips.
9. Footer: add the line "Part of Frontier with Microsoft: the Brief, The Hub and The Coach."
10. Check every page at 390 px and 1440 px wide. Check that no text color is below 4.5:1 on its background, and that no emoji or arrow characters were added.

Then:
- Commit and push. If the deploy hangs for more than 5 minutes, push an empty commit.
- Switch back with gh auth switch to nifra_microsoft and gh auth setup-git.
- Report the commit ID and three screenshots: Home, one edition and the Coach.
