# Home links as a row of icons (card 326)

## Problem

On the home page every link is a list item with its title as text and its description after it; a link with `icon` only gains a 24-pixel icon before the title. The owner's decision (2026-11-11): links are just links, with no explanation. A link that has an icon is that icon and nothing else. Today a home of four profiles (GitHub, LinkedIn, email, a website) reads as a list of four labelled lines with notes where a row of four recognisable icons would do. Separately, `@brunosouzas/design-system` 0.11.0 adds the link icon `brunosouzas`, the parent brand's symbol, which a home cannot use yet.

## What changes

- **Icon links become a row.** The links with `icon` are shown side by side as icon-only anchors, before the other links, each group in the order given. Each anchor's accessible name (`aria-label`) is the link's title, with no tooltip (`title`) and no accessible description; it holds no text, and the link's description is not shown. The icons are 32 CSS pixels (2rem), up from 24, with a target of at least 24 × 24 CSS pixels (WCAG 2.2, 2.5.8), the site's focus ring visible on keyboard focus and a gap wide enough that two rings never overlap. The light and dark icons follow the theme as today.
- **Text links stay as they are.** A link without `icon` keeps its list item with its title and, when set, its description.
- **No new rule in `validate`.** `description` stays an optional field of any link; on a link with `icon` it is accepted, without a warning, and documented as not shown.
- **The `brunosouzas` icon.** `HOME_LINK_ICONS` gains `brunosouzas`, with `@brunosouzas/design-system` pinned exactly to `0.11.0` and `scripts/site-art.mjs` writing `link-icons/brunosouzas-light.svg` and `brunosouzas-dark.svg`. The test that the schema's names equal the package's `LINK_ICON_NAMES` stays. This part waits for the design system's 0.11.0 release.
- **Release.** A `feat:` pull request; release-please then proposes stackledger 0.10.0.

Out of scope:

- showing the description elsewhere (tooltip, hidden text) or deriving a title from the URL;
- an icon for a link without `icon` (no default, no choice by host), other new icon names, icon sizes set in the catalogue;
- any other use of what design system 0.11.0 adds;
- the cards' own links (Map, List, Journeys, Reports, Skills), unchanged;
- the demo site, rebuilt by hand at the next release (`docs/demo.md`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `catalogue-site`: "Home links" orders the icon row before the text links and makes every item of both groups an anchor to its `url`; "Home link icons" makes an icon link icon-only, named by its title (`aria-label`, no `title`), without description, holding only its own icon's two files, the row laid out by CSS over separate anchors (no combined image, sprite or `background-image`, two links with the same icon still two anchors), and ships twelve icon files; the new "Home link icon row" sets the list role (`role="list"`), size, target, focus ring, spacing and wrapping.
- `catalogue`: "Home link icon setting" names six icons, with `brunosouzas`, and accepts `description` beside `icon`.

## Implicit requirements

- Errors and invalid input: unchanged rules; an unknown icon stays an error on its path (`BrunoSouzas` and `brunosouzas-dark` included); `description` with `icon` is no problem and no warning. A title with HTML in it is written escaped in `aria-label` ("Hostile icon title").
- Limits: at most 20 links as today; the row wraps on a narrow screen and keeps every target at least 24 × 24 CSS pixels ("Narrow row").
- Repetition and idempotency: `scripts/site-art.mjs` writes the same bytes on every run, as today; the build is deterministic.
- Concurrency: n/a, a static page.
- Security: no new URL or attribute takes catalogue data except `aria-label`, escaped by Astro like every catalogue text (site-security "Escaped catalogue text", unchanged); the URL scan and the CSP do not change; the new icon files are static and checked inert ("Site art is inert").
- Logs and observability: n/a, no new message.

## Decisions

- The row and the `brunosouzas` icon ship together in stackledger 0.10.0, after `@brunosouzas/design-system` 0.11.0 is published (owner, 2026-11-11, q45 A). The row (task 1) is built first; the pull request is opened only once task 2 is done.

## Impact

- Code: `site/src/pages/index.astro`, `site/src/styles/pages.css`, `src/schema.ts`, `package.json` and `npm-shrinkwrap.json` (design system pinned to 0.11.0), two new files in `site/public/link-icons/`; tests in `test/integration/site.test.ts`, `test/browser/site.spec.ts`, `test/browser/serve.mjs`, `test/unit/settings.test.ts`.
- Visible change for the release notes (CHANGELOG): in 0.9.0 an icon link showed its title and its `description` after the icon; from 0.10.0 an icon link is the icon alone and its description is no longer shown. Catalogues stay valid without editing.

## Documentation

`docs/catalogue-format.md` (`spec.site.home.links`: six icon names; "the description is not shown when `icon` is set"; icon links are shown as a row of icons), `docs/site.md` (Home row of the pages table and the "Marks and art" paragraph), `docs/roadmap.md` (a row for `home-link-icon-row`), the README's version paragraph if the release notes go there. No ADR (no project-wide decision); the vault note after the merge.
