# The stackledger link icon on home links (card 326)

## Problem

`@brunosouzas/design-system` 0.10.0 adds a fifth link icon, `stackledger` (its `LINK_ICON_NAMES` are `github`, `linkedin`, `email`, `website` and `stackledger`). stackledger pins 0.8.1, so a catalogue cannot show that icon on a home link: `icon: stackledger` is an error, and the site has no `link-icons/stackledger-*.svg`. A home that links to another stackledger site (a team's catalogue, the public demo) can only use `website`.

## What changes

- **Package:** `@brunosouzas/design-system` pinned exactly to `0.10.0` (from `0.8.1`) in `package.json` and `npm-shrinkwrap.json`; no other package moves.
- **Setting:** a home link's `icon` may be `stackledger`, besides `github`, `website`, `linkedin` and `email`. `stackledger validate`, the MCP `validate` tool and the build accept it; any other value is still an error on its path.
- **Site:** `scripts/site-art.mjs` writes `site/public/link-icons/stackledger-light.svg` and `stackledger-dark.svg` from the package's `linkIcon`, as for the other four, so a site built with `icon: stackledger` shows it before the link's title, by theme.
- **No other visible change from the bump.** Between 0.8.1 and 0.10.0 the package adds the `headline` piece and the Source Serif 4 Bold face (0.9.0), the `linkedin-banner` cover format, an optional avatar ground and the `stackledger` link icon (0.10.0), and changes only its release pipeline in 0.9.1; its tokens do not change, and the banner format, `ledgerMark`, `symbol` and the four existing link icons draw the same. Re-running `scripts/site-art.mjs` on 0.10.0 rewrites `home-banner.svg`, the favicon, the marks, the symbols, the four existing link icons and `docs/images/how-it-works.svg` byte for byte. The maps and diagrams keep equal to the outputs recorded with 0.8.1 (`test/fixtures/map-0.8.1`, `docs/images/map-*.svg`), so no recorded output is re-recorded and the specs that name 0.8.1 recordings stay true.

Out of scope:

- other uses of the new pieces (`headline`, `linkedin-banner`, the avatar ground);
- a default icon, or a choice of icon by the link's host;
- the demo site, rebuilt by hand at the next release as today (`docs/demo.md`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `catalogue`: "Home link icon setting" names five icons, with `stackledger`.
- `catalogue-site`: "Home link icons" ships ten icon files and shows the `stackledger` icon.

## Implicit requirements

- Errors and invalid input: an unknown icon stays an error on its path ("Unknown link icon", unchanged); `Stackledger` and `stackledger-dark` are unknown.
- Limits: n/a, the list of names is closed and comes from the design system.
- Repetition and idempotency: `scripts/site-art.mjs` writes the same bytes on every run (the art tests compare the files with the package).
- Concurrency: n/a.
- Security: the new icon files are static, written from the package and checked inert like the others ("Site art is inert"); the schema's enum is still the only way a value reaches an `img` `src`.
- Logs and observability: n/a.

## Documentation

`docs/catalogue-format.md` (`spec.site.home.links` row) and `docs/roadmap.md` (a new row). `docs/site.md` and the README do not list the icon names. No ADR; no vault note before the merge.
