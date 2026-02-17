# UniverCcity – Joey Self Healing

## Project overview
This repository contains the marketing site for the UniverCcity healing initiative, featuring The Wealthy Loser book, the healing program, donation flows, and outreach pages. The stack is intentionally lightweight—static HTML, a shared stylesheet, and a tiny helper script—so the content can be edited quickly without a build system.

## Quick start
1. Clone or download the repo.
2. Open `index.html` directly in a browser, or serve the folder with any static server (for example `npx serve .`).
3. Update the content in the HTML pages or partials, refresh, and publish via your preferred static host.

## Important documentation & file map
- `index.html` – landing page hero, vision section, donor wall, and CTA buttons. Update this for any major messaging changes.
- `book/index.html` – dedicated sales/summary page for *The Wealthy Loser*; contains direct purchase buttons and redirects.
- `program/index.html` – outlines the UniverCcity program pillars and the $20B “Twin Towers of Recovery” plan.
- `payments/index.html` – hubs all donation/payment options (Stripe, PayPal, Interac). Flags coming-soon links with `data-coming-soon`.
- `contact/index.html` – simple form/contact instructions for outreach or dedication notes.
- `partials/header.html` & `partials/footer.html` – shared navigation and footer injected via `main.js`.
- `styles.css` – global typography, layout utilities, hero + donor wall styling, responsive tweaks.
- `main.js` – minimal script that loads partials dynamically and applies `[data-coming-soon]` tooltips.
- `images/` – favicon, hero art, and partner logos. Keep optimized PNG/SVG assets here.

## Editing guidance
- **Hero / CTA copy**: adjust the `<section class="hero-wireframe">` in `index.html`. Buttons route to `program/index.html` and `payments/index.html`.
- **Vision narrative & donor wall**: both live in `index.html`. Each donor entry is a `<li>` with `.donor-org` link + amount—duplicate the markup to add names.
- **Navigation links**: update once inside `partials/header.html`; changes propagate to every page because `main.js` injects the partials.
- **Payment notices**: update the tooltip text by editing the `data-coming-soon` attribute on each anchor (shown on hover).
- **Styling**: keep new rules scoped with descriptive class names. Mobile breakpoints currently target 768px and 1024px in `styles.css`.

## Deployment tips
- Because the site is static, you can host it on GitHub Pages, Netlify Drop, Vercel, or any S3-style bucket.
- If you add new top-level pages, remember to update `partials/header.html` and review Open Graph/meta tags in each HTML file for consistent previews.
