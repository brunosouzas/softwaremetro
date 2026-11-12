# External links open in a new tab (card 336)

## Problem

A reader browsing a stackledger site who clicks a home link (the GitHub icon, say) loses the catalogue: the other site replaces it in the same tab, as `catalogue-site` asks today ("Home links": "no `target`"; "Map backdrop": the credit with "no `target`"). The owner's request (2026-11-12): links to other sites open in a new tab, so the reader keeps their place.

## What changes

- **Only external links open in a new tab** (owner, q57). An external link is an anchor to another site. The build already refuses every absolute URL except two kinds (site-security, "No external requests" and "Map credit link"), so the generated site has exactly these external anchors, all now with `target="_blank"` and, as today, `rel="noopener noreferrer"`:
  - the home's icon links (`spec.site.home.links` with `icon`, `ul.home-icon-links`);
  - the home's text links (`spec.site.home.links` without `icon`, `ul.home-external`);
  - the map page's OpenStreetMap credit, over a city backdrop (`.map-credit`).
  Item, line, licence and skills pages hold no external link (the scan fails the build on one), so nothing else changes. Internal links (header, sub-navigation, cards, tables, item and skill pages, the calendar download) keep the same tab.
- **The new tab is announced** (owner, q58 A; WCAG technique G201). Each new-tab link's accessible name gains ` (opens in a new tab)`: in `aria-label` for an icon link (`Source (opens in a new tab)`), in visually hidden text inside the anchor for a text link and the credit, so nothing changes on screen. No `title` attribute, no tooltip, no new icon.
- **Release.** A `fix:` pull request (visible behaviour change, released as a patch, 0.10.1) with a `BEGIN_COMMIT_OVERRIDE` block so the CHANGELOG says what readers will notice.

Out of scope:

- a setting to choose the tab per link or per site;
- a visible "new tab" icon or text;
- any change to which URLs the build allows (site-security unchanged), to the CSP or to `Referrer-Policy`;
- links inside the SVG maps (they hold none) and in `stackledger skills map` Markdown pages (not the site);
- the demo site, rebuilt by hand at the next release (`docs/demo.md`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `catalogue-site`: new "External links in a new tab" and "Internal links in the same tab"; "Home links", "Home link icons" and "Map backdrop" drop "no `target`" and name the icon link with the suffix.

## Implicit requirements

- Errors and invalid input: unchanged; a hostile title stays escaped in `aria-label`, the suffix after it ("Hostile icon title").
- Limits: n/a, at most 20 home links as today; the suffix is fixed text.
- Repetition and idempotency: the build stays deterministic.
- Concurrency: n/a, static pages.
- Security: `rel="noopener noreferrer"` stays on every new-tab anchor, so the opened page gets no `window.opener` (no reverse tabnabbing) and no referrer; no new URL is allowed; the visually hidden text is a fixed string, never catalogue data.
- Logs and observability: n/a, no new message.

## Documentation

`docs/site.md` (Home and Map rows of the pages table, the security paragraph: external links open in a new tab, announced), `docs/catalogue-format.md` (`spec.site.home.links`: new tab, the accessible name), `docs/roadmap.md` (a row for `external-links-new-tab`, and `home-link-icon-row` marked released in 0.10.0). No ADR (no project-wide decision); the vault note after the merge.
