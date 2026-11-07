## MODIFIED Requirements

### Requirement: No inline code
Pages SHALL contain no inline `script` element, no `style` attribute and no event-handler attribute. An inline `style` element SHALL hold only `@font-face` blocks with the descriptors of Astro's Fonts API and at most one `:root` block whose declarations are all custom properties named `--font-*`; any other inline style SHALL fail the build. Scripts and all other styles are files of the site. Every page of both sites SHALL carry the same Content Security Policy.

#### Scenario: Same policy everywhere
- **WHEN** both sites are built from the example
- **THEN** every HTML page has the same CSP, none has an inline script or `style` attribute, and every inline `style` element holds only `@font-face` blocks and at most one `:root` block of `--font-*` properties

#### Scenario: Font styles pass the scan
- **GIVEN** a built page whose inline `style` holds `@font-face` blocks with `font-family`, `src` (relative `url()` with `format()`, or `local()`), `font-style`, `font-weight`, `font-display`, `unicode-range`, `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override`, then `:root { --font-sans: …; --font-serif: … }`
- **WHEN** the build's scan reads it
- **THEN** the scan reports no problem for that style

#### Scenario: Other inline style fails the build
- **GIVEN** a built page holding `<style>p{color:red}</style>`, a style with an `@import` or `@media` rule, or a style whose `@font-face` block has a descriptor other than those of "Font styles pass the scan"
- **WHEN** the build's scan reads it
- **THEN** the scan reports that style and the build fails before publication

#### Scenario: Font variables with anything else fail the build
- **GIVEN** a font style whose `:root` block also declares `color: red` or `--color-accent: red`, a font style with two `:root` blocks, or one whose selector is `:root, body`
- **WHEN** the build's scan reads it
- **THEN** the scan reports that style and the build fails before publication

#### Scenario: Inline script still fails the build
- **GIVEN** a built page holding an inline `script` element, a `style` attribute or an `onclick` attribute
- **WHEN** the build's scan reads it
- **THEN** the scan reports it and the build fails before publication

### Requirement: Content Security Policy
Every HTML page SHALL carry, in a `meta` element, exactly `default-src 'none'; script-src 'self'; style-src 'self' <hashes>; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`, where `<hashes>` are the sorted, unique `'sha256-<base64>'` sources of every inline `style` of the sites the build writes (`full` alone in the personal mode), after their URLs are made relative. A page whose policy differs SHALL fail the build.

#### Scenario: Hashes are the page styles
- **WHEN** both sites are built from the example
- **THEN** each page's policy holds, after `style-src 'self'`, the sha256 of each of its inline `style` elements, the list is sorted with no duplicate, and no hash is of a style no page holds

#### Scenario: No unsafe sources
- **WHEN** both sites are built from the example
- **THEN** the policy holds neither `'unsafe-inline'` nor `'unsafe-eval'`, and its directives other than `style-src` are the ones above

#### Scenario: Pages work under the policy
- **WHEN** the map, list, component, licence and journey pages are opened in a headless browser
- **THEN** no CSP violation is reported, the Source faces are loaded, and zoom, filters, highlight and search work

#### Scenario: Policy differs on one page
- **GIVEN** a built site in which one page's CSP `meta` lacks one of the hashes
- **WHEN** the build's scan reads it
- **THEN** the scan reports that page and the build fails before publication

#### Scenario: Personal build hashes its one site
- **WHEN** a catalogue whose Settings have `spec.sites: [full]` is built
- **THEN** every page of `full`, `<out>/_headers` and `full/_headers` carry one policy whose hashes are exactly those of the inline styles of the `full` site, and no `staff` file is written

#### Scenario: Same policy on a second build
- **WHEN** the same catalogue is built twice with the same `--date` and stackledger version
- **THEN** the policy of every page and of `_headers` is byte-identical in both builds

### Requirement: Relative URLs
Every URL SHALL be relative to the file that holds it and resolve inside its site's folder: HTML URL attributes, CSS `url()` and `@import`, in files and in inline `style` elements, JavaScript static and dynamic imports, and asset references through `import.meta.url`. The anchors exempt by "No external requests" are exempt here too. A generated URL form the build does not handle SHALL fail the build before publication.

#### Scenario: Two sites on one host
- **WHEN** the `full` and `staff` sites are served at `/full/` and `/staff/` of one host and every page is opened
- **THEN** no request leaves the site's prefix and none fails

#### Scenario: Font URLs relative to the page
- **WHEN** a site is built
- **THEN** every `url()` of the inline font styles of `software/editor/index.html` starts with `../../`, every one of `index.html` holds no leading `/`, and each resolves to a font file of the site

#### Scenario: Font URL the build cannot rewrite
- **GIVEN** an inline font style whose `url()` is absolute or protocol-relative
- **WHEN** the build's scan reads it
- **THEN** the scan reports it and the build fails before publication

### Requirement: Headers file
The build SHALL write `_headers` at the root of the output folder and in each site, applying to `/*` the Content Security Policy above plus `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

#### Scenario: Root headers
- **WHEN** a build succeeds
- **THEN** `<out>/_headers` holds those headers for `/*`

#### Scenario: Headers carry the page policy
- **WHEN** both sites are built from the example
- **THEN** the `Content-Security-Policy` of `<out>/_headers` and of each site's `_headers` is the policy of the pages' `meta`, hashes included, followed by `; frame-ancestors 'none'`
