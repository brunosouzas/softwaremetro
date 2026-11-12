## MODIFIED Requirements

### Requirement: Home links
With `spec.site.home.links` set, the home SHALL show a `Links` heading after the cards, then the `icon` links as a row ("Home link icons"), then the others as a list of `title` with `description`, if set, after it; each group in the order given. Every item, icon or text, SHALL be an anchor to its `url` with `rel="noopener noreferrer"` and no `target`. Without links, or with an error in the `Settings` in use, there is no `Links` heading; with the error the banner shows the default text.

#### Scenario: Two links
- **WHEN** `spec.site.home.links` lists `Articles` (`https://example.org/articles/`, description `What I write`) then `Team wiki` (`http://wiki.example.org/`)
- **THEN** the home shows `Links` with `Articles` then `Team wiki`, each an anchor to its URL with `rel="noopener noreferrer"`, and `What I write` after `Articles`

#### Scenario: Icon row before text links
- **WHEN** `spec.site.home.links` lists `Source` (`icon: github`), then `Blog` (no icon, description `Posts`), then `Catalogue` (`icon: stackledger`)
- **THEN** after the `Links` heading the home shows the row with `Source` then `Catalogue`, then the list with `Blog` and `Posts`; every anchor, in the row and in the list, has its link's `url` as `href`, `rel="noopener noreferrer"` and no `target`

#### Scenario: Only icon links
- **WHEN** every link of `spec.site.home.links` has `icon`
- **THEN** the home shows the `Links` heading and the row, and no list of text links

#### Scenario: Broken settings, no links
- **WHEN** the `Settings` has `spec.site.home.links` with one valid link and an error in `spec.site.colors`
- **THEN** the home has no `Links` heading and shows the default text

#### Scenario: Hostile link text
- **WHEN** a link's title is `<script>alert(1)</script>`
- **THEN** the home shows that text literally and holds no `script` element from it

#### Scenario: Site art is inert
- **WHEN** `home-banner.svg`, `brand-mark-dark.svg` and each link icon are read
- **THEN** none holds a `script`, `foreignObject` or `style` element, a `style` attribute, an attribute starting with `on`, or an `href` or `url(…)` other than an internal `url(#id)`

#### Scenario: Icon with broken settings
- **WHEN** the `Settings` has a link with `icon: github` and an error elsewhere
- **THEN** the home has no `Links` heading and no link icon

### Requirement: Home link icons
A link with `icon` SHALL be an anchor with no text other than whitespace, `aria-label` equal to its `title`, no `title` attribute, and only its own icon's two decorative `img` (`alt=""`) from `link-icons/`: `<icon>-light.svg` shown in the light theme, `<icon>-dark.svg` in the dark, each the design system's `linkIcon` for that surface. Its `description` SHALL NOT appear. The row SHALL come from CSS over separate anchors, never from a combined image, sprite or `background-image`.

#### Scenario: Link with an icon
- **WHEN** `spec.site.home.links` lists `Source` (`https://github.example.com/northwind/`, `icon: github`, description `Our code`) then `Blog` (`https://blog.example.com/`, no icon)
- **THEN** the anchor of `Source` has `aria-label="Source"` and no `title` attribute, no text other than whitespace, and `img` elements with `alt=""` and relative `src` ending in `link-icons/github-light.svg` and `link-icons/github-dark.svg`; `Our code` is not in the page; the anchor of `Blog` holds no `img` and has the text `Blog`

#### Scenario: Accessible name of an icon link
- **WHEN** the home with the `Source` icon link is opened in a browser
- **THEN** it has exactly one link with the accessible name `Source`, its accessible description is empty and it has no `title` attribute, so no tooltip repeats the name to a screen reader

#### Scenario: Each icon link holds only its own icon
- **WHEN** the home lists the icon links `Site` (`icon: website`), `Source` (`icon: github`) and `Catalogue` (`icon: stackledger`)
- **THEN** each `ul.home-icon-links a` holds exactly two `img`, `link-icons/<its icon>-light.svg` and `link-icons/<its icon>-dark.svg`, and no anchor holds another link's icon

#### Scenario: Same icon twice
- **WHEN** the home lists `Source` (`https://github.example.com/northwind/`) and `Mirror` (`https://github.example.com/mirror/`), both with `icon: github`
- **THEN** the row has two separate anchors, each with its own `href` and `aria-label`, and each holds exactly its own two `img`, `github-light.svg` and `github-dark.svg`

#### Scenario: No combined image
- **WHEN** the home with icon links is opened in a browser
- **THEN** no element of the row (the `ul`, its items, anchors and images) has a computed `background-image` other than `none`

#### Scenario: Link with the stackledger icon
- **WHEN** `spec.site.home.links` also lists `Catalogue` (`https://catalogue.example.com/`, `icon: stackledger`)
- **THEN** the anchor of `Catalogue` is named `Catalogue`, has no `title` attribute, and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/stackledger-light.svg` and `link-icons/stackledger-dark.svg`, and both files are in each built site

#### Scenario: Link with the brunosouzas icon
- **WHEN** `spec.site.home.links` also lists `Bruno Souza` (`https://www.example.com/`, `icon: brunosouzas`)
- **THEN** the anchor of `Bruno Souza` is named `Bruno Souza`, has no `title` attribute, and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/brunosouzas-light.svg` and `link-icons/brunosouzas-dark.svg`, and both files are in each built site

#### Scenario: Hostile icon title
- **WHEN** a link with `icon: github` has the title `"><script>alert(1)</script>`
- **THEN** its anchor's `aria-label` holds that text literally, escaped, and the home holds no `script` element from it

#### Scenario: Link icon follows the theme
- **WHEN** the home with the `Source` link is shown in the light theme, then in the dark theme
- **THEN** only `github-light.svg` is visible in light and only `github-dark.svg` in dark, the shown one with the computed `display` `block`

#### Scenario: Link icon files are the design system's
- **WHEN** each file in `site/public/link-icons/` is read
- **THEN** there are twelve, one per icon and surface, each a 46 × 46 SVG whose shapes equal those of `linkIcon({ icon, x: 0, y: 0, surface })`

## ADDED Requirements

### Requirement: Home link icon row
The icon links SHALL be a `ul` with `role="list"` (VoiceOver drops list semantics under `list-style: none`), side by side, wrapping when the page is narrow. Each icon SHALL be 2rem (32 × 32 CSS pixels at the default text size), each anchor's target at least 24 × 24 CSS pixels (WCAG 2.2, 2.5.8), the site's focus ring visible around an anchor on keyboard focus, and the gap between two anchors the same across and between lines and wider than two focus rings.

#### Scenario: Icons side by side
- **WHEN** the home lists eight icon links in a 1280-pixel-wide window
- **THEN** the row's `ul` has `role="list"` and is exposed as a list of eight items; their anchors share one top, the gap between two neighbouring anchors is more than 10 pixels (two rings of a 3-pixel outline 2 pixels out), each icon shows at 32 × 32 and each anchor is at least 24 × 24

#### Scenario: Focus ring on an icon link
- **WHEN** the reader moves the keyboard focus to the first icon link
- **THEN** that anchor is focused and its outline is 3 pixels, solid, in the accent colour; no ancestor up to the section has an `overflow` other than `visible`, and the outline box lies inside the viewport

#### Scenario: Narrow row
- **WHEN** the same home with eight icon links is shown in a 320-pixel-wide window
- **THEN** the row wraps: at least one anchor has a top different from the first anchor's, the vertical gap between the lines equals the gap between neighbours on a line, both more than 10 pixels, no anchor extends past the page's container, and each is still at least 24 × 24
