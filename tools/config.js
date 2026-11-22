/* tools/config.js — pages this repo's tools treat as "the site" for
 * screenshots/check-all. Edit this list when new pages are added. */
'use strict';
module.exports = {
  repoName: 'nfratello.github.io',
  liveBase: 'https://nfratello.github.io/',
  // Representative pages checked by screenshots.js / check-all.js. Not
  // exhaustive — add a path here when a new page needs regular checking.
  pages: [
    'Frontier_Home.html',
    'index.html',
    'Intelligent_Business_Process_Hub.html',
    'Dynamics_365_Skills.html',
    'Frontier_Style_Guide.html',
    'Contoso_Hospitality_Cowork_Dynamics365_Storyboard.html',
  ],
  widths: [1920, 1440, 1024, 768, 390],
};
