## ADDED Requirements

### Requirement: External links in a new tab
On every page of both sites, an anchor to another site (an `href` that is an absolute URL: the home links and the map credit, the only ones site-security allows) SHALL have `target="_blank"` and `rel="noopener noreferrer"`, and its accessible name SHALL end with ` (opens in a new tab)`: in `aria-label` for an icon link, in visually hidden text inside the anchor otherwise, so the text on screen does not change. It SHALL NOT get a `title` attribute.

#### Scenario: Text link in a new tab
- **WHEN** `spec.site.home.links` lists `Blog` (`https://blog.example.com/`, no icon)
- **THEN** its anchor has `target="_blank"` and `rel="noopener noreferrer"`, no `title`, the text `Blog` followed by a `span` with the class `visually-hidden` holding ` (opens in a new tab)`, and in a browser its accessible name is `Blog (opens in a new tab)` and the span's box is at most 1 × 1 pixel

#### Scenario: Icon link in a new tab
- **WHEN** `spec.site.home.links` lists `Source` (`https://github.example.com/northwind/`, `icon: github`)
- **THEN** its anchor has `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="Source (opens in a new tab)"`, no `title` and no text other than whitespace

#### Scenario: Map credit in a new tab
- **WHEN** the map page of a site built with `spec.map.backdrop: london` is opened in a browser
- **THEN** the credit line reads `Map data © OpenStreetMap contributors` on screen, and its link has `target="_blank"`, `rel="noopener noreferrer"` and the accessible name `OpenStreetMap contributors (opens in a new tab)`

#### Scenario: The reader keeps their place
- **WHEN** the reader clicks the `Blog` link on the home in a browser
- **THEN** a new tab opens on `https://blog.example.com/`, it has no `window.opener`, and the home stays open at its own address in the first tab

#### Scenario: Hostile title in a new-tab link
- **WHEN** an icon link's title is `"><script>alert(1)</script>`
- **THEN** its `aria-label` is that title escaped followed by ` (opens in a new tab)`, and the home holds no `script` element from it

### Requirement: Internal links in the same tab
Every anchor of both sites whose `href` is relative (a page or file of the same site: header, sub-navigation, cards, tables, item, journey, report and skills pages, the calendar download) SHALL have no `target` attribute and no ` (opens in a new tab)` in its name or text.

#### Scenario: Only external anchors open a new tab
- **WHEN** the `full` and `staff` sites are built from a catalogue with home icon and text links and `spec.map.backdrop: london`, and from a catalogue with a skill set
- **THEN** across every HTML page, each anchor with `target` has an absolute `href` and `target="_blank"`, each anchor with an absolute `href` has `target="_blank"`, and no anchor with a relative `href` has `target` or the text `opens in a new tab`

#### Scenario: No external link, no new tab
- **WHEN** the sites are built from the example catalogue, which has no home links and no city backdrop
- **THEN** no page has an anchor with `target` or the text `opens in a new tab`

#### Scenario: Internal link in the same tab
- **WHEN** the reader clicks the home card's `Map` link in a browser
- **THEN** the map page opens in the same tab and no new tab opens

## MODIFIED Requirements

### Requirement: Home links
With `spec.site.home.links` set, the home SHALL show a `Links` heading after the cards, then the `icon` links as a row ("Home link icons"), then the others as a list of `title` with `description`, if set, after it; each group in the order given. Every item, icon or text, SHALL be an anchor to its `url` that opens in a new tab ("External links in a new tab"). Without links, or with an error in the `Settings` in use, there is no `Links` heading; with the error the banner shows the default text.

#### Scenario: Two links
- **WHEN** `spec.site.home.links` lists `Articles` (`https://example.org/articles/`, description `What I write`) then `Team wiki` (`http://wiki.example.org/`)
- **THEN** the home shows `Links` with `Articles` then `Team wiki`, each an anchor to its URL with `target="_blank"` and `rel="noopener noreferrer"` showing only its title, and `What I write` after `Articles`

#### Scenario: Icon row before text links
- **WHEN** `spec.site.home.links` lists `Source` (`icon: github`), then `Blog` (no icon, description `Posts`), then `Catalogue` (`icon: stackledger`)
- **THEN** after the `Links` heading the home shows the row with `Source` then `Catalogue`, then the list with `Blog` and `Posts`; every anchor, in the row and in the list, has its link's `url` as `href`, `target="_blank"` and `rel="noopener noreferrer"`

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
A link with `icon` SHALL be an anchor with no text but whitespace, `aria-label` equal to its `title` and the new-tab suffix, no `title` attribute, and only its own icon's two decorative `img` (`alt=""`) from `link-icons/`: `<icon>-light.svg` shown in the light theme, `<icon>-dark.svg` in the dark, each the design system's `linkIcon` for that surface. Its `description` SHALL NOT appear. The row SHALL come from CSS over separate anchors, never from a combined image, sprite or `background-image`.

#### Scenario: Link with an icon
- **WHEN** `spec.site.home.links` lists `Source` (`https://github.example.com/northwind/`, `icon: github`, description `Our code`) then `Blog` (`https://blog.example.com/`, no icon)
- **THEN** the anchor of `Source` has `aria-label="Source (opens in a new tab)"` and no `title` attribute, no text other than whitespace, and `img` elements with `alt=""` and relative `src` ending in `link-icons/github-light.svg` and `link-icons/github-dark.svg`; `Our code` is not in the page; the anchor of `Blog` holds no `img` and shows the text `Blog`

#### Scenario: Accessible name of an icon link
- **WHEN** the home with the `Source` icon link is opened in a browser
- **THEN** it has exactly one link with the accessible name `Source (opens in a new tab)`, its accessible description is empty and it has no `title` attribute, so no tooltip repeats the name to a screen reader

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
- **THEN** the anchor of `Catalogue` is named `Catalogue (opens in a new tab)`, has no `title` attribute, and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/stackledger-light.svg` and `link-icons/stackledger-dark.svg`, and both files are in each built site

#### Scenario: Link with the brunosouzas icon
- **WHEN** `spec.site.home.links` also lists `Bruno Souza` (`https://www.example.com/`, `icon: brunosouzas`)
- **THEN** the anchor of `Bruno Souza` is named `Bruno Souza (opens in a new tab)`, has no `title` attribute, and holds `img` elements with `alt=""` and relative `src` ending in `link-icons/brunosouzas-light.svg` and `link-icons/brunosouzas-dark.svg`, and both files are in each built site

#### Scenario: Hostile icon title
- **WHEN** a link with `icon: github` has the title `"><script>alert(1)</script>`
- **THEN** its anchor's `aria-label` holds that text literally, escaped, followed by ` (opens in a new tab)`, and the home holds no `script` element from it

#### Scenario: Link icon follows the theme
- **WHEN** the home with the `Source` link is shown in the light theme, then in the dark theme
- **THEN** only `github-light.svg` is visible in light and only `github-dark.svg` in dark, the shown one with the computed `display` `block`

#### Scenario: Link icon files are the design system's
- **WHEN** each file in `site/public/link-icons/` is read
- **THEN** there are twelve, one per icon and surface, each a 46 × 46 SVG whose shapes equal those of `linkIcon({ icon, x: 0, y: 0, surface })`

### Requirement: Map backdrop
`stackledger build` SHALL draw the software map of each view with the catalogue's backdrop ("Map settings"). When it is a city, the map page SHALL show, right under the map frame, the line `Map data © OpenStreetMap contributors`, with `OpenStreetMap contributors` an anchor to `https://www.openstreetmap.org/copyright` that opens in a new tab ("External links in a new tab"). With `neutral` there is no such line.

#### Scenario: London map on the page
- **WHEN** the site is built from a catalogue with `spec.map.backdrop: london`
- **THEN** the map page of each view embeds the light and the dark map, each with the `london` backdrop group and the SVG credit

#### Scenario: London credit on the page
- **WHEN** the site is built from a catalogue with `spec.map.backdrop: london`
- **THEN** the map page of each view shows the credit line under the map frame, with its anchor to the OpenStreetMap copyright page, `target="_blank"`, `rel="noopener noreferrer"` and the accessible name `OpenStreetMap contributors (opens in a new tab)`

#### Scenario: Credit readable on a phone
- **GIVEN** a 390-pixel-wide window and a site built with `spec.map.backdrop: london`
- **WHEN** the reader opens the map page
- **THEN** the credit line is visible with a computed font size of at least 12 pixels

#### Scenario: No credit without a city
- **WHEN** the site is built from the example catalogue, which has no `spec.map`
- **THEN** no page contains `OpenStreetMap`
