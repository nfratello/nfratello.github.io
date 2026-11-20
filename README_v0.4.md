# Frontier with Microsoft, prototype v0.4

Updated November 20, 2026. Builds on v0.3 (live at https://nfratello.github.io/).

## What changed
1. Top bar shows only Frontier with Microsoft, The Brief, The Hub and The Coach. Design standards moved to a footer link.
2. Federal and Defense removed from the front door and The Hub: 10 industries in two rows of five, 27 planned scenarios.
3. Design standards v1.1: agent prompt to copy, 12 rules (new: product icons wherever a product is named, icon library only, show what is real), a 14-item pass/fail checklist, version and date.
4. Agent-readable files at the site root: design-standards.md, frontier-tokens.json, frontier.css, icons/icons.json.
5. Frontier icon library (icons/): official Dynamics 365 icons with source, terms and last-checked date. Copilot Studio, Agent 365 and Power Platform icons are listed as "to download"; Microsoft 365 Copilot shows as text until an official source is found.
6. Storyboard: product icons on the scenario chips and layer labels; section headings no longer slide under the top menu.
7. The Hub file is about half the size (each icon defined once).

## Still to do
- Download the Power Platform icon pack (Copilot Studio, Agent 365) into icons/ and rebuild.
- Re-render the three videos to remove background jitter and add icons to the title cards. Until then, use the v0.3 videos.
- Real product screens for the three hospitality scenarios (shot list to follow).
- Brief restyle pull request: apply Manufacturing #a16207 and Financial Services #1d4ed8, then merge after review.
