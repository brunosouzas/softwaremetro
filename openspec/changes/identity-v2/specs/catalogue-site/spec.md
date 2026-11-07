## MODIFIED Requirements

### Requirement: Look and theme
The default look SHALL follow brunosouzas.com: its colour tokens for light and dark, its type scale, and its fonts, shipped with the package and delivered by Astro's Fonts API with its local provider: Source Sans 3 for text and labels, Source Serif 4 for headings and the wordmark, Source Code Pro for code. `spec.site.colors` SHALL override the matching light-theme tokens only. When the `Settings` in use has an error, the site uses the default title and colours.

#### Scenario: Accent override
- **WHEN** `spec.site.colors.accent` is `#E4002B`
- **THEN** the light theme's accent variable is `#E4002B` and the dark theme's is the default

#### Scenario: Broken settings
- **WHEN** the `Settings` in use has an error in `spec.site.colors`
- **THEN** the site uses the default title and colours

#### Scenario: Source fonts shipped locally
- **WHEN** a site is built
- **THEN** its pages declare `@font-face` rules for `Source Sans 3` (400, 600, 700 and 900 normal), `Source Serif 4` (700 normal and italic) and `Source Code Pro` (400 normal) whose files are in the site's own folder, only Source Sans 3 400 normal and Source Serif 4 700 normal are preloaded, and no page requests a font from another origin

#### Scenario: Lato shipped locally
- **WHEN** a site is built and `package.json` is read
- **THEN** Lato is no longer shipped: no file of the site names `Heebo`, `Signika` or `Lato`, and `package.json` has no `@fontsource/heebo`, `@fontsource/signika` or `@fontsource/lato` dependency

#### Scenario: Source font packages
- **WHEN** a site is built and `package.json` is read
- **THEN** `package.json` depends on `@fontsource/source-sans-3`, `@fontsource/source-serif-4` and `@fontsource/source-code-pro` at exactly `5.3.1`, and every font file of the site has the bytes of one of their latin `woff2` files

#### Scenario: Missing font file
- **GIVEN** one of the font files the fonts configuration names is missing from the installed packages
- **WHEN** `stackledger build` runs
- **THEN** the build fails with an error naming that file, and nothing is published

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

### Requirement: Strip interchange
On a journey strip, a stop that is also on another drawn line SHALL be a vertical capsule drawn by `stationMarker` with the interchange radius (`map.stopRadius` plus `map.interchangeExtra`), from 4 units above to 4 units below the line, so the terminal badge above it and the label below it stay clear of its outline.

#### Scenario: Strip interchange is a capsule
- **WHEN** line `ship` stops at `slack`, which is also a stop of `design`
- **THEN** `slack`'s marker on the `ship` strip is a closed `path` taller than it is wide, centred on the line, and its label starts below the capsule's outline

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

## ADDED Requirements

### Requirement: Wordmark
The header's site title SHALL be set in Source Serif 4, italic, weight 700, on every page of both sites and whatever `spec.site.title` holds, in the face the site ships ("Look and theme").

#### Scenario: Wordmark face
- **WHEN** any page is opened in the light theme, then in the dark theme
- **THEN** the site title's computed `font-family` starts with `Source Serif 4`, its `font-style` is `italic`, its `font-weight` is 700, and `document.fonts.check('italic 700 1em "Source Serif 4"')` is true

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
