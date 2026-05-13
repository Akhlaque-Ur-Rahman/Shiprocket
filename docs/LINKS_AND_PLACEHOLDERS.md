# Links and placeholders (site-wide)

This project is a static Shiprocket-style demo. Link behaviour follows these rules.

## Real internal routes

Primary navigation and footers use real HTML siblings: `index.html`, `shipping.html`, `solutions.html`, `pricing.html`, `resources.html`, `login.html`, `signup.html`. Section deep links use hashes that exist on `solutions.html` and `resources.html` (for example `solutions.html#solutions-segments`, `resources.html#resources-featured`).

Footer **Track Order** points to [`shipping.html`](../shipping.html) so users reach the tracking demo.

## `href="#"` placeholders

Many links still use `href="#"` on purpose: mega menu product tiles, mobile accordion product lines, footer company and social URLs, legal stubs, and some article CTAs (`Read more`, `Learn more`, and similar). They are **not broken files**: they scroll to the top of the page and act as visual stubs until you add real URLs or replace them with `<button type="button">` where navigation is not defined yet.

When you extend the site, prefer either:

- a dedicated placeholder page (for example `legal.html` for Privacy or Terms), or
- external official URLs if this becomes more than a learning clone.

## Account page scripts

[`account.html`](../account.html) uses the same script stack as [`login.html`](../login.html) (`script.js` plus [`auth-demo.js`](../auth-demo.js)) so no request is made to missing Supabase modules. If you wire Supabase or InsForge auth later, update scripts in one consistent pattern across auth pages.
