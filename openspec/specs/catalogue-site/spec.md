# catalogue-site Specification

## Purpose
Defines the pages of the static catalogue site, what each shows from its view, how readers move between them, the little interactivity they have, and the site's look.

## Requirements

### Requirement: Pages
Each site SHALL have a home page at `/`, a map page at `/map/`, a software list at `/software/`, one page per served component at `/software/<name>/`, one page per served licence at `/licences/<name>/`, a journeys list at `/journeys/` and one page per drawn line at `/journeys/<name>/`, with `<name>` the item's `metadata.name` in lower case. The `full` site SHALL also have `/reports/` and `/renewals.ics`, as `licence-reports` defines.

#### Scenario: Item pages
- **WHEN** the catalogue has components `editor` and `forge` and licence `licence-editor`
- **THEN** the site has `/software/editor/`, `/software/forge/` and `/licences/licence-editor/`

#### Scenario: No journeys
- **WHEN** the catalogue has no drawn line
- **THEN** the map page shows `No journeys yet` and the journeys list says there are none

#### Scenario: Reports in full only
- **WHEN** both sites are built
- **THEN** the `full` site has `/reports/` and `/renewals.ics` and the `staff` site has neither

#### Scenario: Map at /map/
- **WHEN** a site is built
- **THEN** `/map/` holds the map of its view, `/` holds the home page with no map on it, and every link labelled `Map` to the software map, in the sub-navigation and the footer, targets `/map/`

### Requirement: Layout
Every page SHALL share one layout: a header with the site title (from `spec.site.title`, default `stackledger`) linking the home page `/`, and the divisions Software (`/map/`) and, with a skill set, Skills (`/skills/`); under it the division's sub-navigation, for Software: Map (`/map/`), List (`/software/`), Journeys, and Reports in `full`; a footer with the view name and stackledger version; and a theme switch following `prefers-color-scheme` until the reader picks one, then remembering it.

#### Scenario: Theme remembered
- **WHEN** the reader chooses dark on one page and opens another page
- **THEN** the other page opens in dark

#### Scenario: Site title
- **WHEN** `spec.site.title` is `Northwind software`
- **THEN** every page's header and `title` element show `Northwind software`

#### Scenario: Default title
- **WHEN** the catalogue has no `spec.site.title`, or its `Settings` has an error
- **THEN** every page's header and `title` element show `stackledger`, also on the Skills pages

#### Scenario: Title opens the home
- **WHEN** the reader clicks the site title on `/skills/` or on `/software/editor/`
- **THEN** the home page `/` of the same site opens

#### Scenario: View in the footer
- **WHEN** a page of the `staff` site is opened
- **THEN** its footer says `staff view`

#### Scenario: Reports link
- **WHEN** any Software page is opened
- **THEN** its sub-navigation links Reports in the `full` site and not in the `staff` site

#### Scenario: Software sub-navigation
- **WHEN** the reader opens `/journeys/`, then the page of the journey `ship`
- **THEN** the header marks Software, the sub-navigation links Map (`/map/`), List and Journeys, and only on `/journeys/` is Journeys marked with `aria-current="page"`

#### Scenario: Skills link
- **WHEN** both sites are built with a skill set, and again without one
- **THEN** every page's header links Skills (`/skills/`) in both sites of the first build and in neither site of the second

### Requirement: Look and theme
The default look SHALL follow brunosouzas.com: its colour tokens for light and dark, its type scale, and its fonts, delivered as "Font delivery" says: Source Sans 3 for text, labels, the map and the diagrams, Source Serif 4 for headings and the wordmark, Source Code Pro for code. `spec.site.colors` SHALL override the matching light-theme tokens only. When the `Settings` in use has an error, the site uses the default title and colours.

#### Scenario: Accent override
- **WHEN** `spec.site.colors.accent` is `#E4002B`
- **THEN** the light theme's accent variable is `#E4002B` and the dark theme's is the default

#### Scenario: Broken settings
- **WHEN** the `Settings` in use has an error in `spec.site.colors`
- **THEN** the site uses the default title and colours

#### Scenario: Lato shipped locally
- **WHEN** a site is built and `package.json` is read
- **THEN** Lato is no longer shipped: no file of the site names `Heebo`, `Signika` or `Lato`, and `package.json` has no `@fontsource/heebo`, `@fontsource/signika` or `@fontsource/lato` dependency

#### Scenario: Source font packages
- **WHEN** a site is built and `package.json` is read
- **THEN** `package.json` depends on `@fontsource/source-sans-3`, `@fontsource/source-serif-4` and `@fontsource/source-code-pro` at exactly `5.3.1`, and every font file of the site has the bytes of one of their latin `woff2` files

### Requirement: Map page
The map page SHALL show the map of its view, in the light or dark theme following the page theme, with zoom in, zoom out and reset buttons, each with its icon ("Interface icons"), and drag to pan. Without JavaScript the whole map is still shown, at the size "Map shown size" gives.

#### Scenario: Zoom
- **WHEN** the reader presses zoom in twice and then reset
- **THEN** the map scales up twice and returns to its initial size

### Requirement: Map interaction
Choosing a line in the legend SHALL dim every other line's strokes and badges and every station that line does not stop at; choosing it again restores them. Choosing a zone in the zone filter SHALL dim every station not in that zone and every line with no stop in it. The page script makes each station focusable as a link: click or Enter opens its item page.

#### Scenario: Station link
- **WHEN** the reader clicks station `component:editor`, or focuses it and presses Enter
- **THEN** the browser opens the `editor` component page

#### Scenario: Highlight a line
- **WHEN** the reader chooses line `ship` in the legend
- **THEN** every other line is dimmed, and choosing `ship` again restores them

#### Scenario: Zone with a space in its name
- **WHEN** a component is in the zone `Team tools` and the reader chooses `Team tools` in the zone filter
- **THEN** that component's station stays lit and stations in other zones are dimmed

### Requirement: Software list
The software list SHALL be a table of every served component and licence with its title or name, kind, type, lifecycle or status, owner and zone, sorted by reference, each row linking to its page. A search box SHALL hide rows that do not contain the typed text, ignoring case, in their shown cells; filters SHALL restrict by kind, zone, lifecycle and owner. Filtering works on the table rows themselves.

#### Scenario: Search
- **WHEN** the reader types `north` in the search box
- **THEN** only rows with `north` in a shown cell, in any case, remain

#### Scenario: Nothing matches
- **WHEN** the search matches no row
- **THEN** the page says no item matches

#### Scenario: Without JavaScript
- **WHEN** JavaScript is disabled
- **THEN** the full table is shown, unfiltered

### Requirement: Component page
A component page SHALL show its title, name, description, type, lifecycle, owner, zone and tags; its licences with the licence fields of the view, each linking to its page; the journeys that stop at it; a neighbourhood diagram; the impact of removing it; and its unresolved references. A drawn line links to its journey page; a line that is not drawn is named as text.

#### Scenario: Journeys
- **WHEN** `editor` is a stop of `ship` and `design`
- **THEN** its page links to the `design` and `ship` journey pages

#### Scenario: Line with one served stop
- **WHEN** `editor` is a stop of `old`, a line left with one served stop
- **THEN** its page names `old` without a link

### Requirement: Licence page
A licence page SHALL show its title, name, owner and the `spec.licence` fields of the view, the components that use it (each linking to its page), and the impact of removing it.

#### Scenario: Staff licence page
- **WHEN** the `staff` site shows licence `licence-editor` with default hidden fields
- **THEN** the page shows vendor and status and no cost, currency, cycle, renewal date, payer, seats, vault item or note

### Requirement: Neighbourhood diagram
The neighbourhood diagram SHALL be a safe SVG drawn by stackledger: the item in the centre, its resolved direct dependencies on the left and direct dependants on the right. Next to it, a text list SHALL hold the same items: components and licences link to their pages, other resources are plain text. The page script opens a linked item's page when its box is clicked, or focused and Enter is pressed.

#### Scenario: Dependencies and dependants
- **WHEN** `forge` depends on `vault` and `editor` depends on `forge`
- **THEN** the diagram on `forge`'s page shows `vault` on the left and `editor` on the right, and the text list links both

#### Scenario: Resource without a page
- **WHEN** `forge` depends on resource `orders-db`, which is not a licence
- **THEN** `orders-db` is in the diagram and in the text list as plain text, without a link

### Requirement: Impact of removal
Item pages SHALL list every item that depends on the item directly or indirectly, with its depth, and the journeys affected, as the MCP `impact` tool computes them, and SHALL say when the list stops at 500.

#### Scenario: Indirect dependant
- **WHEN** `forge` depends on `vault` and `editor` depends on `forge`
- **THEN** `vault`'s page lists `forge` at depth 1 and `editor` at depth 2

### Requirement: Journey pages
The journeys list SHALL show every drawn line in line order with its badge, colour, title and number of stops. A journey page SHALL show a strip diagram (the line's served stops from the map model, in order, on a straight line in its colour, with badges of the other drawn lines at each stop) and a text list with the same stops and lines as links.

#### Scenario: Interchange on a strip
- **WHEN** line `ship` stops at `slack` and `slack` is also a stop of `design`
- **THEN** the `ship` page shows `slack` with a `design` badge, and its list links `slack` and the `design` journey page

### Requirement: Accessibility
Pages SHALL have one `h1`, landmarks for header, main and footer, visible focus and a text alternative for every diagram. The default colour tokens SHALL give text a contrast of at least 4.5:1 in both themes.

#### Scenario: Diagram alternative
- **WHEN** a component page shows its neighbourhood diagram
- **THEN** the page also lists the same dependencies and dependants as text links

### Requirement: Diagram style
The neighbourhood and strip diagrams SHALL use the map's theme and the design system's pieces: boxes are `nodeBlock`, the centre item in its `focus` state; edges are `messageArrow` curves with a head at their right-hand end; the strip's line is a `pipe`, its stops `stationMarker` and its badges `lineBadge`. A box without a page, and an empty column's "Nothing", SHALL be a `placeholder`: dashed, muted, without a shadow.

#### Scenario: Neighbourhood boxes
- **WHEN** `forge`'s neighbourhood diagram is drawn in the `light` theme
- **THEN** each linked box has an outline stroked `#121212` and no shadow shape before it

#### Scenario: Edges point right
- **WHEN** `forge` depends on `vault` and `editor` depends on `forge`, and `forge`'s diagram is drawn
- **THEN** it has two edges, each ending in a filled head whose tip touches the left side of the box to its right: `forge`'s box for the edge from `vault`, `editor`'s box for the edge from `forge`

#### Scenario: Strip line and stops
- **WHEN** the strip of line `ship` in `#FF0000` is drawn in the `dark` theme
- **THEN** the line is a `#FF0000` path over a wider `#121212` casing path, and each stop marker is outlined `#ADA79D` with no shadow shape before it

#### Scenario: Terminal badge over an end interchange
- **WHEN** line `ship` ends at `slack`, which is also a stop of `design`
- **THEN** in both themes the terminal badge above `slack`, with its outline, ends above the top of `slack`'s capsule with its outline

#### Scenario: Resource without a shadow
- **WHEN** `forge` depends on resource `orders-db`, which is not a licence
- **THEN** the `orders-db` box has a dashed outline and no shadow shape, and shows `orders-db` at the box's left inset with `resource` under it, both in the muted colour ("Neighbourhood placeholder box")

### Requirement: Home page
The home page SHALL show a banner with the site title as its `h1`, `spec.site.home.text` or `Your software and skills, mapped.` when unset, and the banner art ("Home banner art"); then a Software card with the view's counts of components, licences and drawn journeys, linking Map, List, Journeys and, in `full`, Reports; and, with a skill set, a Skills card with the counts of skills, playbooks, agents and rules, linking List, Map and Rules.

#### Scenario: Home in full and staff
- **WHEN** both sites are built from a catalogue with 3 components, 2 licences and 1 drawn journey, and a skill set of 2 skills, 1 playbook, 1 agent and 4 rules
- **THEN** each home shows those counts, both link `/map/`, `/skills/`, `/skill-map/` and `/rules/`, only the `full` home links `/reports/`, and both show the default text

#### Scenario: Home text
- **WHEN** `spec.site.home.text` is `Northwind tools`
- **THEN** the home banner shows `Northwind tools` and not the default sentence

#### Scenario: Home without skills
- **WHEN** a site is built without a skill set
- **THEN** its home has no Skills card and no link to `/skills/`

#### Scenario: Empty catalogue
- **WHEN** the catalogue has no component, licence or journey
- **THEN** the home shows the Software card with three zero counts

### Requirement: Home page chrome
The home page SHALL have no sub-navigation (overriding "Layout" for this page), its header SHALL mark no division, and its `title` element SHALL be the site title alone.

#### Scenario: Home chrome
- **WHEN** the home page of either site is opened
- **THEN** it has no sub-navigation, no header link has `aria-current`, and its `title` element is the site title, without a page name before it

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

### Requirement: Site tokens from the design system
The colour, font-size and heading variables of "Look and theme" SHALL read the `site` variables of `@brunosouzas/design-system` (`--ds-site-*`), which the build ships in the site's own stylesheet. The accent, which is also the focus colour, SHALL read `--ds-brand-<theme>-stackledger-accent`, and the colour on primary `--ds-site-<theme>-body`; neither stays a literal.

#### Scenario: Palette from the design system
- **WHEN** a site is built
- **THEN** its stylesheet defines `--ds-site-light-body` and `--ds-site-dark-body` with the package's values, `--color-body` is `var(--ds-site-light-body)` in light and `var(--ds-site-dark-body)` in dark, and a page's body background is `#F6F3EC` in light and `#121110` in dark

#### Scenario: Accent stays stackledger's
- **WHEN** a site is built without `spec.site.colors`
- **THEN** `--color-accent` is `var(--ds-brand-light-stackledger-accent)` in light and `var(--ds-brand-dark-stackledger-accent)` in dark, also under `prefers-color-scheme: dark` with no choice made, and its computed value is `#3B5BDB` in light and `#7D8CFF` in dark

#### Scenario: Override keeps the dark accent
- **WHEN** a site is built with `spec.site.colors.accent: "#E4002B"`
- **THEN** the computed accent is `#E4002B` in light and `#7D8CFF` in dark

#### Scenario: Colour on primary
- **WHEN** a button is hovered in the light theme, then in the dark theme
- **THEN** its computed text colour is `#F6F3EC` in light and `#121110` in dark, the body colour of its theme

#### Scenario: Accent readable on the page
- **WHEN** a site is built without `spec.site.colors` and shown in each theme
- **THEN** the contrast of the computed accent against the computed body background is at least 4.5:1 in both themes

### Requirement: Ink frame
Cards, buttons, line chips and tag chips SHALL have the identity's ink frame: an outline of `--ds-outline-small` in `--ds-color-ink` in the light theme and in `--ds-surface-dark-muted` in the dark theme, with no shadow and no rim, as the design system's shadow and rim width tokens are 0.

#### Scenario: Card frame in light
- **WHEN** a home page card is shown in the light theme
- **THEN** its border is 3px solid `#121212` and its computed box shadow is `none`

#### Scenario: Card frame in dark
- **WHEN** the same card is shown in the dark theme
- **THEN** its border is 3px solid `#ADA79D` and its computed box shadow is `none`

#### Scenario: Pressed button keeps its frame
- **WHEN** a line chip button is hovered, then pressed (`aria-pressed="true"`), in either theme
- **THEN** its border stays the frame of its theme and its computed box shadow stays `none`

#### Scenario: Focus still visible
- **WHEN** a line chip button is focused with the keyboard in either theme
- **THEN** it shows the same focus outline as before this change, besides its frame

### Requirement: Brand mark
The favicon SHALL be the design system's `ledgerMark` at size 32 in a 32 × 32 SVG. The header SHALL show the mark before the site title as decorative images (`alt=""`) loaded from the site's own folder: `favicon.svg` in the light theme, and `brand-mark-dark.svg`, the `ledgerMark` drawn for the dark surface, in the dark theme. The site's templates SHALL write `img` elements only for the header marks, the footer symbols, the home banner and the home link icons.

#### Scenario: Favicon is the mark
- **WHEN** `site/public/favicon.svg` is read
- **THEN** it is a 32 × 32 SVG whose shapes equal those of `ledgerMark({ x: 0, y: 0, size: 32 })`

#### Scenario: Favicon is the page mark
- **WHEN** `site/public/favicon.svg` is read
- **THEN** its first shape is a `rect` at (0.625, 0.625), 30.75 × 30.75, `rx` 6.6, filled `#FFFFFF` and stroked `#121212` with width 1.25, and it has no other `rect`

#### Scenario: Dark mark is the dark ledgerMark
- **WHEN** `site/public/brand-mark-dark.svg` is read
- **THEN** it is a 32 × 32 SVG whose shapes equal those of `ledgerMark({ x: 0, y: 0, size: 32, surface: "dark" })`, whose page `rect` is stroked `#ADA79D`, with no other `rect`

#### Scenario: Header mark with a custom title
- **WHEN** `spec.site.title` is `Northwind software` and any page is opened
- **THEN** the header link to the home holds an `img` with `alt=""` and a relative `src` ending in `favicon.svg`, then one ending in `brand-mark-dark.svg`, followed by `Northwind software`

#### Scenario: Mark follows the theme
- **WHEN** any page is shown in the light theme, then in the dark theme
- **THEN** only `favicon.svg` is visible in the header in light and only `brand-mark-dark.svg` in dark, inline before the title

#### Scenario: No other images
- **WHEN** both sites are built from the example with `spec.site.home.links` holding a link with an icon
- **THEN** every `img` element of every page is a header mark, a footer symbol (`symbol-light.svg` or `symbol-dark.svg`), the home banner or a home link icon

### Requirement: Strip interchange
On a journey strip, a stop that is also on another drawn line SHALL be a vertical capsule drawn by `stationMarker` with the interchange radius (`map.stopRadius` plus `map.interchangeExtra`), from 4 units above to 4 units below the line, so the terminal badge above it and the label below it stay clear of its outline.

#### Scenario: Strip interchange is a capsule
- **WHEN** line `ship` stops at `slack`, which is also a stop of `design`
- **THEN** `slack`'s marker on the `ship` strip is a closed `path` taller than it is wide, centred on the line, and its label starts below the capsule's outline

### Requirement: Diagram box titles
A diagram box whose title is empty after trimming SHALL show the item's reference instead (for example `component:forge`), so a title the catalogue allows never stops the build.

#### Scenario: Blank title
- **WHEN** component `forge` has `metadata.title` `" "` and the site is built
- **THEN** the build succeeds and `forge`'s box in every neighbourhood diagram shows `component:forge`

### Requirement: Home banner art
The home page's banner SHALL show, after its `h1` and text, the image `home-banner.svg` from the site's own folder as a decorative `img` (`alt=""`, `width` 1200, `height` 420), as wide as the container and at its own ratio. The file SHALL be the design system's banner (`coverTree`) of `scripts/home-banner.json`: on `neutral`, three lines leave the `ledgerMark`, cross at an interchange and end at `sinal`. It has no words, does not move, and is the same in both themes and on every site.

#### Scenario: Banner on the home
- **WHEN** the home page of either site is opened
- **THEN** the banner section holds the `h1`, then the text, then an `img` with `alt=""` and a relative `src` ending in `home-banner.svg`

#### Scenario: Banner file is the design system's banner
- **WHEN** `site/public/home-banner.svg` is read
- **THEN** its shapes equal those of `coverTree` for `scripts/home-banner.json`, which `validateCoverSpec` accepts with no problem; the spec's `background` is `neutral` and its pieces are one `ledgerMark` of size 180, three `pipe` filled `illustration.accent`, `brand.light.stackledgerAccent` and `color.ink`, `stationMarker` pieces and one `sinal`

#### Scenario: Banner has no words and no motion
- **WHEN** `site/public/home-banner.svg` is parsed
- **THEN** it has no `text`, `tspan`, `animate`, `animateTransform`, `animateMotion` or `set` element

#### Scenario: Banner keeps its ratio
- **WHEN** the home is shown 375 and 1440 CSS pixels wide
- **THEN** the banner image is as wide as the container's content box and its height is 420/1200 of its width

### Requirement: Interface icons
The zoom in, zoom out and reset buttons of `/map/` and `/skill-map/`, and the link to `renewals.ics` on `/reports/`, SHALL start with the design system's `uiIcon` `zoomIn`, `zoomOut`, `reset` and `download` in `currentColor`, so each follows its button's text colour, also on hover. The theme switch SHALL show `uiIcon` `sun` in `color.white` in the light theme and `moon` in `color.ink` in the dark theme.

#### Scenario: Zoom buttons with icons
- **WHEN** `/map/` and `/skill-map/` of the example are built
- **THEN** each page's zoom in, zoom out and reset buttons hold, in that order, an inline `svg` equal to the `zoomIn`, `zoomOut` and `reset` icon, the first two with `aria-label` `Zoom in` and `Zoom out`, the third followed by the text `Reset`

#### Scenario: Calendar button with an icon
- **WHEN** the `full` site of the example is built
- **THEN** the link to `renewals.ics` on `/reports/` starts with an inline `svg` equal to the `download` icon, followed by its text

#### Scenario: Icon follows the button colour
- **WHEN** the reader hovers the zoom in button, in the light theme and in the dark theme
- **THEN** before and during the hover, the computed `stroke` of the icon's magnifier `path` equals the button's computed text colour and its computed `fill` stays `none`

#### Scenario: Theme switch icons
- **WHEN** any page is shown in the light theme, then in the dark theme, with JavaScript
- **THEN** the switch shows only the `sun` icon in light and only the `moon` icon in dark, each equal to its site icon

### Requirement: Inline icon markup
Each interface icon SHALL be an `svg` element inline in the page's HTML, written at build time as `toSvg` of an `svg` root (`viewBox` `0 0 24 24`, `width` and `height` 16, `aria-hidden="true"`, `focusable="false"`) holding the piece's body at `(0, 0)`; never an `img` nor a CSS background. Each button keeps its accessible name: `Zoom in`, `Zoom out`, `Reset` and the calendar link's text.

#### Scenario: Icon is the design system's
- **WHEN** each of the six site icons is read
- **THEN** it equals `toSvg` of the `svg` root above holding `uiIcon({ name, x: 0, y: 0, colour }).body`, with `colour` `currentColor` for the four button icons, `color.white` for `sun` and `color.ink` for `moon`

#### Scenario: Interface icons are inert
- **WHEN** every inline `svg` of every built page that is not a map, a diagram or a line badge is read
- **THEN** none holds a `script`, `foreignObject` or `style` element, a `style` attribute, an attribute starting with `on`, or an `href` or `url(…)`

### Requirement: Neighbourhood placeholder box
A box without a page in the neighbourhood diagram SHALL be the design system's `nodeBlock` with `state` `placeholder` and the item's kind as `subtitle`: dashed, muted, without shadow, the title above the muted kind.

#### Scenario: Empty column keeps no subtitle
- **WHEN** `forge` has no dependants
- **THEN** the right column shows the dashed `Nothing` placeholder, centred, with no subtitle

### Requirement: Map shown size
The map page SHALL show the map at its initial viewBox width in CSS pixels (one unit per pixel), or narrower when the frame's room is smaller, keeping its proportions. The room is the page's content column minus the frame's borders. The frame's content box SHALL be as wide as the shown map, and the frame centred in the column. Zoom and pan SHALL NOT change the map's size on the page. No inline style or script SHALL be needed for this.

#### Scenario: Map narrower than the page
- **GIVEN** a 1360-pixel-wide window and a software map whose viewBox is narrower than the room (the small test catalogue under `/extra/`)
- **WHEN** the reader opens its map page
- **THEN** the map is as wide as its viewBox, the frame's content box is as wide as the map, and the frame's left and right distances to the content column's edges are equal (each within 1 pixel)

#### Scenario: Map wider than the page
- **GIVEN** a 390-pixel-wide window and the example software map
- **WHEN** the reader opens the map page
- **THEN** the map is as wide as the frame's content box, its height keeps the viewBox proportions (within 1 pixel), and the page has no horizontal scroll

#### Scenario: Zoom keeps the shown size
- **WHEN** the reader presses zoom in twice, then drags the map
- **THEN** the map's width and height on the page are the same as before (within 1 pixel)

#### Scenario: Shown size without JavaScript
- **GIVEN** JavaScript is disabled, a 1360-pixel-wide window and the small test catalogue's software map
- **WHEN** the reader opens its map page
- **THEN** the whole map is shown, as wide as its viewBox (within 1 pixel)

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

### Requirement: Wordmark
The header's site title SHALL be set in Source Serif 4, italic, weight 700, on every page of both sites and whatever `spec.site.title` holds, in the face the site ships ("Font delivery").

#### Scenario: Wordmark face
- **WHEN** any page is opened in the light theme, then in the dark theme
- **THEN** the first family of the site title's computed `font-family`, unquoted, starts with `Source Serif 4-`, the family the Fonts API generates, its `font-style` is `italic`, its `font-weight` is 700, and `document.fonts` holds a loaded italic 700 face of that family

#### Scenario: Wordmark with the longest title
- **WHEN** `spec.site.title` holds 60 characters and a page is opened
- **THEN** the whole title is set in the same face, style and weight as the default title

### Requirement: Parent brand endorsement
The footer SHALL show, after the view name and stackledger version, the design system's `symbol` as decorative images (`alt=""`, `width` and `height` 16) from the site's own folder, `symbol-light.svg` in the light theme and `symbol-dark.svg` in the dark one, as the header marks do, then `by Bruno Souza`, none inside a link. `scripts/site-art.mjs` SHALL write both from the `symbol` piece on each surface. No SVG file of the sites SHALL hold a `style` element.

#### Scenario: Footer endorsement
- **WHEN** any page of the `full` or the `staff` site is opened
- **THEN** its footer shows the view name and the stackledger version, then an `img` with `alt=""`, `width` 16, `height` 16 and a relative `src` ending in `symbol-light.svg`, then the same with `symbol-dark.svg`, then `by Bruno Souza`, and no `a` element holds the images or the text

#### Scenario: Symbol follows the theme
- **WHEN** any page is shown in the light theme, then in the dark theme
- **THEN** only `symbol-light.svg` is visible in the footer in light and only `symbol-dark.svg` in dark, inline before `by Bruno Souza`

#### Scenario: Symbol files are the design system's
- **WHEN** `site/public/symbol-light.svg` and `site/public/symbol-dark.svg` are read
- **THEN** each equals the drawing of the package's `symbol` piece on its surface, `light` and `dark`, as `scripts/site-art.mjs` writes it

#### Scenario: Symbol files are inert
- **WHEN** `site/public/symbol-light.svg` and `site/public/symbol-dark.svg` are parsed
- **THEN** neither has a `script`, `foreignObject` or `style` element, a `style` attribute, an attribute starting with `on`, or an `href` or `url(…)` other than an internal `url(#id)`

#### Scenario: No SVG of the sites holds a style
- **WHEN** both sites are built from the example with a home link icon
- **THEN** no `.svg` file of either site holds a `style` element

### Requirement: Font delivery
The build SHALL deliver the fonts with Astro's Fonts API and its local provider, naming its files by root-relative paths (`./src/fonts/<file>`). It SHALL move the Fonts API's `<style>` elements ("Accepted font CSS") into one file `_astro/fonts.css`, each `url()` relative to it, linked once where the first was. Every HTML page, in sorted path order, SHALL yield the first one's font CSS; a page that differs or has none, or any other `<style>`, SHALL fail the build before publication.

#### Scenario: Source fonts shipped locally
- **WHEN** a site is built
- **THEN** `_astro/fonts.css` declares `@font-face` rules for Source Sans 3 (400, 600, 700 and 900 normal), Source Serif 4 (700 normal and italic) and Source Code Pro (400 normal) whose files are in the site's own folder, only Source Sans 3 400 normal and Source Serif 4 700 normal are preloaded, and no page requests a font from another origin

#### Scenario: Font CSS moved to a file
- **WHEN** a site is built
- **THEN** no page holds a `<style>` element, each page links `_astro/fonts.css` once with a relative URL (`../../_astro/fonts.css` from `software/editor/index.html`), the page's CSP meta precedes that link and every font preload link, and every `url()` of that file is `fonts/<file>.woff2` and resolves to a font file of the site

#### Scenario: Accepted font CSS
- **GIVEN** pages from Astro whose `<style>` elements hold only `:root` blocks of `--font-*` custom properties and `@font-face` blocks whose descriptors are among `font-family`, `src` (`url(/_astro/fonts/<file>.woff2)`, `local("…")`, `format()`), `font-display`, `font-weight`, `font-style`, `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` and `unicode-range`, including a fallback face with `src:local("Arial")` whose quoted family name holds `:`, `;` and `}`
- **WHEN** the build moves the font CSS
- **THEN** it succeeds, the quoted text is kept whole, and `_astro/fonts.css` holds that CSS with only its `url()` values changed

#### Scenario: Other style still fails
- **GIVEN** a page from Astro holding `<style>p{color:red}</style>`, a style with an `@import` or `@media` rule, an `@font-face` with a descriptor outside "Accepted font CSS" (`font-feature-settings`), a font style whose `:root` block also declares `color: red`, or a font `url()` outside `/_astro/fonts/`
- **WHEN** the build moves the font CSS
- **THEN** the build fails naming that page, and nothing is published

#### Scenario: Font CSS differs between pages
- **GIVEN** pages from Astro where, in sorted path order, a later page's font CSS differs from the first page's by one character, or a page has no font CSS
- **WHEN** the build moves the font CSS
- **THEN** the build fails naming that page, and nothing is published

#### Scenario: Fonts load under the policy
- **WHEN** the home, a component page and the map page are each opened in a headless browser and `document.fonts.ready` has resolved
- **THEN** no page reports a CSP violation, and the faces loaded, counted across the three pages, include Source Sans 3 400, 600, 700 and 900 (900 on the map), Source Serif 4 700 normal and italic, and Source Code Pro 400

#### Scenario: Missing font file
- **GIVEN** one of the font files the fonts configuration names is missing from the installed packages
- **WHEN** `stackledger build` runs
- **THEN** the build fails with an error naming that file, and nothing is published

### Requirement: Font variables
Site CSS SHALL take the families from the Fonts API's variables `--font-primary` (Source Sans 3), `--font-secondary` (Source Serif 4) and `--font-mono` (Source Code Pro, for `code`), defined only in `_astro/fonts.css`, not `--ds-site-font-*`. As the Fonts API renames the families (`Source Sans 3-<hash>`), a site CSS rule SHALL set `font-family: var(--font-primary)` on every inline `svg` with a `font-family` attribute (map, diagrams). Standalone SVG files keep the plain names.

#### Scenario: Map drawn in the shipped face
- **WHEN** the map page and a component page with a neighbourhood diagram are opened, in either theme
- **THEN** the first family of the computed `font-family` of the map's `svg` and of the neighbourhood diagram's `svg`, unquoted, starts with `Source Sans 3-`, and a station label's computed family is the same

#### Scenario: Body and code faces
- **WHEN** any page is opened, then a component page
- **THEN** the first family of the computed `font-family`, unquoted, starts with `Source Sans 3-` for the body and `Source Serif 4-` for an `h1`, and on the component page with `Source Code Pro-` for a `code` element, and `document.fonts` holds a loaded Source Code Pro 400 face of that family

#### Scenario: Standalone map keeps the plain name
- **WHEN** `stackledger map` writes an SVG to stdout
- **THEN** its root `font-family` names `'Source Sans 3'` with no generated suffix, as metro-map "Themes" says

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
- **THEN** a new tab opens on `https://blog.example.com/`, it has no `window.opener` and an empty `document.referrer`, and the home stays open at its own address in the first tab

#### Scenario: Hostile title in a new-tab link
- **WHEN** an icon link's title is `"><script>alert(1)</script>`
- **THEN** its `aria-label` is that title escaped followed by ` (opens in a new tab)`, and the home holds no `script` element from it

### Requirement: Internal links in the same tab
Every anchor of both sites whose `href` is relative (a page or file of the same site: header, sub-navigation, cards, tables, item, journey, report and skills pages, the calendar download) SHALL have no `target` attribute and no ` (opens in a new tab)` in its name or text.

#### Scenario: Only external anchors open a new tab
- **WHEN** the `full` and `staff` sites are built from catalogues with home icon links, home text links and `spec.map.backdrop: london`, and from a catalogue with a skill set
- **THEN** across every HTML page, each anchor with `target` has an absolute `href` and `target="_blank"`, each anchor with an absolute `href` has `target="_blank"`, `rel="noopener noreferrer"` and no `title`, and no anchor with a relative `href` has `target` or the text `opens in a new tab`

#### Scenario: No external link, no new tab
- **WHEN** the sites are built from the example catalogue, which has no home links and no city backdrop
- **THEN** no page has an anchor with `target` or the text `opens in a new tab`

#### Scenario: Internal link in the same tab
- **WHEN** the reader clicks the home card's `Map` link in a browser
- **THEN** the map page opens in the same tab and no new tab opens
