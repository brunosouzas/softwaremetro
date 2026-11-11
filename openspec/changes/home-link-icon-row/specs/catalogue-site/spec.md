## MODIFIED Requirements

### Requirement: Home links
When `spec.site.home.links` is set, the home page SHALL show a `Links` heading after the cards, then the links with `icon` as a row ("Home link icons"), then the others as a list of anchors with `title` as text and `description`, when set, after it; each group in the order given. Every anchor SHALL carry `rel="noopener noreferrer"` and no `target`. Without links, or with an error in the `Settings` in use, there is no `Links` heading; with the error the banner shows the default text.

#### Scenario: Two links
- **WHEN** `spec.site.home.links` lists `Articles` (`https://example.org/articles/`, description `What I write`) then `Team wiki` (`http://wiki.example.org/`)
- **THEN** the home shows `Links` with `Articles` then `Team wiki`, each an anchor to its URL with `rel="noopener noreferrer"`, and `What I write` after `Articles`

#### Scenario: Icon row before text links
- **WHEN** `spec.site.home.links` lists `Source` (`icon: github`), then `Blog` (no icon, description `Posts`), then `Catalogue` (`icon: stackledger`)
- **THEN** after the `Links` heading the home shows the row with `Source` then `Catalogue`, then the list with `Blog` and `Posts`, every anchor with `rel="noopener noreferrer"` and no `target`

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
A home link with `icon` SHALL be an anchor holding no text, whose `aria-label` and `title` are the link's `title`, with two decorative `img` elements (`alt=""`) from the site's `link-icons/` folder: `<icon>-light.svg` shown in the light theme and `<icon>-dark.svg` in the dark one, each the design system's `linkIcon` for that surface. Its `description` SHALL NOT appear in the page.

#### Scenario: Link with an icon
- **WHEN** `spec.site.home.links` lists `Source` (`https://github.example.com/northwind/`, `icon: github`, description `Our code`) then `Blog` (`https://blog.example.com/`, no icon)
- **THEN** the anchor of `Source` has `aria-label="Source"` and `title="Source"`, no text, and `img` elements with `alt=""` and relative `src` ending in `link-icons/github-light.svg` and `link-icons/github-dark.svg`; `Our code` is not in the page; the anchor of `Blog` holds no `img` and has the text `Blog`

#### Scenario: Accessible name of an icon link
- **WHEN** the home with the `Source` icon link is opened in a browser
- **THEN** it has exactly one link with the accessible name `Source`, and its `title` is `Source`

#### Scenario: Link with the stackledger icon
- **WHEN** `spec.site.home.links` also lists `Catalogue` (`https://catalogue.example.com/`, `icon: stackledger`)
- **THEN** the anchor of `Catalogue` is named and titled `Catalogue` and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/stackledger-light.svg` and `link-icons/stackledger-dark.svg`, and both files are in each built site

#### Scenario: Link with the brunosouzas icon
- **WHEN** `spec.site.home.links` also lists `Bruno Souza` (`https://www.example.com/`, `icon: brunosouzas`)
- **THEN** the anchor of `Bruno Souza` is named and titled `Bruno Souza` and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/brunosouzas-light.svg` and `link-icons/brunosouzas-dark.svg`, and both files are in each built site

#### Scenario: Hostile icon title
- **WHEN** a link with `icon: github` has the title `"><script>alert(1)</script>`
- **THEN** its anchor's `aria-label` and `title` hold that text literally, escaped, and the home holds no `script` element from it

#### Scenario: Link icon follows the theme
- **WHEN** the home with the `Source` link is shown in the light theme, then in the dark theme
- **THEN** only `github-light.svg` is visible in light and only `github-dark.svg` in dark

#### Scenario: Link icon files are the design system's
- **WHEN** each file in `site/public/link-icons/` is read
- **THEN** there are twelve, one per icon and surface, each a 46 × 46 SVG whose shapes equal those of `linkIcon({ icon, x: 0, y: 0, surface })`

## ADDED Requirements

### Requirement: Home link icon row
The icon links SHALL be shown side by side in one row that wraps when the page is narrow. Each icon SHALL be shown at 2rem (32 × 32 CSS pixels at the default text size), each anchor's target SHALL be at least 24 × 24 CSS pixels (WCAG 2.2, 2.5.8), the site's focus ring SHALL be visible around an anchor on keyboard focus, and the gap between two anchors SHALL be wider than two focus rings.

#### Scenario: Icons side by side
- **WHEN** the home lists three icon links in a 1280-pixel-wide window
- **THEN** their anchors share one top, the gap between two neighbouring anchors is more than 10 pixels (two rings of a 3-pixel outline 2 pixels out), each icon shows at 32 × 32 and each anchor is at least 24 × 24

#### Scenario: Focus ring on an icon link
- **WHEN** the reader moves the keyboard focus to the first icon link
- **THEN** that anchor is focused and its outline is 3 pixels, solid, in the accent colour, and not cut by its container

#### Scenario: Narrow row
- **WHEN** the same home is shown in a 320-pixel-wide window
- **THEN** no anchor of the row extends past the page's container, and each is still at least 24 × 24

### Requirement: Separate icon links
Each link icon SHALL stay a separate piece: an icon link's anchor SHALL hold only its own icon's light and dark files, and the row SHALL come from CSS over separate anchors, never from a combined image or sprite.

#### Scenario: Each icon link holds only its own icon
- **WHEN** the home lists the icon links `website`, `github` and `stackledger`
- **THEN** each anchor holds exactly two images, `link-icons/<its icon>-light.svg` and `link-icons/<its icon>-dark.svg`, no anchor holds another link's icon, and the row is laid out by CSS from separate anchors, never from a combined image or sprite
