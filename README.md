# 2 Sons Window Cleaning — Premium Homepage Demo

Custom-built premium homepage redesign demo for **2 Sons Window Cleaning & Power Washing** (Boyertown, PA), built with HTML5/CSS3/vanilla JavaScript and ready for GitHub Pages.

## Project scope
- Single-page responsive homepage (`index.html`) — mobile-first, premium editorial design.
- Self-hosted fonts (Bricolage Grotesque + Poppins), no external dependencies.
- Original logo and original portfolio/work photography reused unchanged — only the presentation was redesigned.
- Faithful demo recreation of the site's Google Reviews widget (names, ratings and review text verbatim).
- Interactive gallery filter, lightbox viewer, FAQ accordion, service list with hover previews, mobile navigation.
- GitHub Pages compatible — relative paths, static assets only, `.nojekyll` included.

## Structure
```
index.html
assets/
├── fonts/        (self-hosted woff2 fonts)
├── icons/        (SVG icons)
├── images/       (optimized WebP photos)
└── logo/         (original logo + favicons)
css/style.css
js/script.js
.nojekyll
README.md
```

## Deployment
Push to the repository root and enable GitHub Pages from the `main` (or `gh-pages`) branch root folder. No build step required.

## Notes
- Demo build for presentation purposes; carries `noindex` so it does not compete with the live business site in search results.
- Contact form is not functional by design (no backend) — the business phone/email are shown for real inquiries.
- Original site: https://www.2sonswindows.com/
