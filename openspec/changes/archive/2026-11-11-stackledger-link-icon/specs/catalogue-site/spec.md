## MODIFIED Requirements

### Requirement: Home link icons
A home link with `icon` SHALL start its anchor with that icon: two decorative `img` elements (`alt=""`) from the site's own `link-icons/` folder, `<icon>-light.svg` shown in the light theme and `<icon>-dark.svg` in the dark one, each the design system's `linkIcon` for that surface.

#### Scenario: Link with an icon
- **WHEN** `spec.site.home.links` lists `Source` (`https://github.example.com/northwind/`, `icon: github`) then `Blog` (`https://blog.example.com/`, no icon)
- **THEN** the anchor of `Source` holds `img` elements with `alt=""` and relative `src` ending in `link-icons/github-light.svg` and `link-icons/github-dark.svg`, before the text `Source`, and the anchor of `Blog` holds no `img`

#### Scenario: Link with the stackledger icon
- **WHEN** `spec.site.home.links` also lists `Catalogue` (`https://catalogue.example.com/`, `icon: stackledger`)
- **THEN** the anchor of `Catalogue` holds `img` elements with `alt=""` and relative `src` ending in `link-icons/stackledger-light.svg` and `link-icons/stackledger-dark.svg`, before the text `Catalogue`, and both files are in each built site

#### Scenario: Link icon follows the theme
- **WHEN** the home with the `Source` link is shown in the light theme, then in the dark theme
- **THEN** only `github-light.svg` is visible in light and only `github-dark.svg` in dark, each inline before the title

#### Scenario: Link icon files are the design system's
- **WHEN** each file in `site/public/link-icons/` is read
- **THEN** there are ten, one per icon and surface, each a 46 × 46 SVG whose shapes equal those of `linkIcon({ icon, x: 0, y: 0, surface })`
