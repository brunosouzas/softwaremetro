# Design: home links as a row of icons

## Order of a mixed list

- **Chosen: the icon row first, then the text links**, each group in the order the catalogue gives. A row cannot sit between list items without breaking the list into pieces, and the row is the short, scannable part (profiles, code, mail), so it goes right under the `Links` heading; the text links, with their descriptions, read as the longer part after it. Within each group the author's order is kept, so moving a link inside its group still works.
- **Not chosen: the given order, as one list** with icon items inline: either a list item holds only an icon (no row), or the row is split by every text link between two icon links.
- **Not chosen: text links first.** It hides the icons below the descriptions and gains nothing.

## Markup

Under the `Links` heading: `<ul class="home-icon-links" role="list">` when a link has `icon`, then the existing `<ul class="home-external">` when a link has none. Each icon item is `<a href={url} rel="noopener noreferrer" aria-label={title}>` holding the two themed `img` elements (`alt=""`, `width`/`height` 32) and no text other than whitespace. A `ul` keeps the row announced as a list of n links; the explicit `role="list"` is there because VoiceOver (Safari) drops the list semantics of a `ul` styled `list-style: none`.

- **Name by `aria-label`**, as the owner decided, and no `title`: the accessible description is empty (`toHaveAccessibleDescription('')` and no `title` attribute, in the e2e test).
- **Not chosen: a `title` tooltip** equal to the name. The design assumed that a `title` equal to the accessible name is not used as the description; in practice Chromium 156 and Playwright's own computation both expose it as the description, so a screen reader reads the title twice ("Source, Source"). The owner's rule also stands against it (2026-11-11): links show no explanation, and his own icons need none. A reader who does not know an icon still has the link's URL in the status bar.
- **Not chosen: visually hidden text** (`.visually-hidden` span). It survives page translation better, but the owner asked for `aria-label`, and an anchor without text keeps "no text" checkable in the HTML. Recorded as a possible later change, not planned.

## Separate icon links

Each link icon stays a separate piece: an icon link's anchor holds only its own icon's two files (light and dark), and the row is laid out by CSS over separate anchors. No combined image, sprite or CSS `background-image` draws the row, so each icon keeps its own anchor, name, target and focus ring, and two links with the same icon are still two anchors, each with its own two `img`. Checked in the built HTML (each `ul.home-icon-links a` holds exactly its own two `img`) and in the browser (no element of the row has a computed `background-image`).

## Size, target, spacing

The design system has no spacing tokens and `tokens.css` only `--radius`; `pages.css` uses rem steps (0.5rem, 0.75rem, 1.25rem). So:

- icon `2rem` (32 px at the default size), up from 1.5rem: alone, without a title, the 46-unit sticker must be recognisable, and 2rem is the next step of the scale used for the header marks (28) and the old icons (24);
- anchor `display: inline-flex` with `padding: 0.25rem` and `border-radius: var(--radius)`: a 40 × 40 target (WCAG 2.2 2.5.8 asks 24 × 24), and the focus ring follows the rounded corner;
- the `img` is sized only (`width`, `height`), never given a `display`: `.home-icon-links img { display: block }` would outrank `.themed-dark { display: none }` (`base.css`) and show both icons. Inside the `inline-flex` anchor the shown `img` is a flex item, so its computed `display` is `block` (the theme test expected `inline` before);
- row `display: flex; flex-wrap: wrap; gap: max(0.75rem, 12px)`, no bullets, no indent, and each `li` `display: flex`, so an item is as tall as its anchor: a block `li` holding an `inline-flex` anchor gets a line box with the strut's descent under it, and the gap between lines would be wider than the gap across. So 12 px between targets, across and between lines, more than the two rings of the site's `:focus-visible` (3 px outline, 2 px offset, so 5 px each side), so two rings never touch. The 12 px floor is there because the root text is smaller under 768 px (`--text-base-sm`, `base.css`), where `0.75rem` alone is 9.6 px, less than the two rings; the rings are in pixels, so the gap's floor is too.

The focus ring is the site's own `:focus-visible` rule; no new focus style. The `.link-icon` rule for icons before a title goes, since a text link no longer has an icon.

## Description beside an icon

- **Chosen: accepted, no warning, documented** ("not shown when `icon` is set"). The field stays optional for every link: it means something for text links, and a catalogue that turns an icon on or off keeps its description without editing.
- **Not chosen: a warning** in `validate`: noise on a valid catalogue, every time, for a harmless field. **Not chosen: an error**: catalogues valid on 0.9.0 would fail, a breaking change.

## The `brunosouzas` icon

As in `stackledger-link-icon`: the schema keeps its own copy of the names (`HOME_LINK_ICONS`), so `validate` does not load the design system, with the unit test that it equals `LINK_ICON_NAMES`. `scripts/site-art.mjs` loops over `LINK_ICON_NAMES` and writes the two new files without change; every other art file it writes stays byte-identical.
