# Design: home links as a row of icons

## Order of a mixed list

- **Chosen: the icon row first, then the text links**, each group in the order the catalogue gives. A row cannot sit between list items without breaking the list into pieces, and the row is the short, scannable part (profiles, code, mail), so it goes right under the `Links` heading; the text links, with their descriptions, read as the longer part after it. Within each group the author's order is kept, so moving a link inside its group still works.
- **Not chosen: the given order, as one list** with icon items inline: either a list item holds only an icon (no row), or the row is split by every text link between two icon links.
- **Not chosen: text links first.** It hides the icons below the descriptions and gains nothing.

## Markup

Under the `Links` heading: `<ul class="home-icon-links">` when a link has `icon`, then the existing `<ul class="home-external">` when a link has none. Each icon item is `<a href rel="noopener noreferrer" aria-label={title} title={title}>` holding the two themed `img` elements (`alt=""`, `width`/`height` 32) and no text. A `ul` keeps the row announced as a list of n links.

- **Name by `aria-label`**, as the owner decided; `title` repeats it as the tooltip. With both equal, the title is not read twice (it is not used as the description when it equals the name).
- **Not chosen: visually hidden text** (`.visually-hidden` span). It survives page translation better, but the owner asked for `aria-label`, and an anchor without text keeps "no text" checkable in the HTML. Recorded as a possible later change, not planned.

## Size, target, spacing

The design system has no spacing tokens and `tokens.css` only `--radius`; `pages.css` uses rem steps (0.5rem, 0.75rem, 1.25rem). So:

- icon `2rem` (32 px at the default size), up from 1.5rem: alone, without a title, the 46-unit sticker must be recognisable, and 2rem is the next step of the scale used for the header marks (28) and the old icons (24);
- anchor `display: inline-flex` with `padding: 0.25rem` and `border-radius: var(--radius)`: a 40 × 40 target (WCAG 2.2 2.5.8 asks 24 × 24), and the focus ring follows the rounded corner;
- row `display: flex; flex-wrap: wrap; gap: 0.75rem`, no bullets, no indent: 12 px between targets, more than the two rings of the site's `:focus-visible` (3 px outline, 2 px offset, so 5 px each side), so two rings never touch.

The focus ring is the site's own `:focus-visible` rule; no new focus style. The `.link-icon` rule for icons before a title goes, since a text link no longer has an icon.

## Description beside an icon

- **Chosen: accepted, no warning, documented** ("not shown when `icon` is set"). The field stays optional for every link: it means something for text links, and a catalogue that turns an icon on or off keeps its description without editing.
- **Not chosen: a warning** in `validate`: noise on a valid catalogue, every time, for a harmless field. **Not chosen: an error**: catalogues valid on 0.9.0 would fail, a breaking change.

## The `brunosouzas` icon

As in `stackledger-link-icon`: the schema keeps its own copy of the names (`HOME_LINK_ICONS`), so `validate` does not load the design system, with the unit test that it equals `LINK_ICON_NAMES`. `scripts/site-art.mjs` loops over `LINK_ICON_NAMES` and writes the two new files without change.
