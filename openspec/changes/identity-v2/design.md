# Design: identity v2

## 1. Font delivery (decided by the owner, Q2b)

| Option | Network at build | Inline code | Verdict |
|---|---|---|---|
| A. Astro Fonts API, Google provider (as brunosouzas.com) | yes | inline `<style>` | no: the build makes no network calls (`build-command`, Writes) |
| B. Astro Fonts API, **local provider** reading the `@fontsource` files in the package | no | inline `<style>` with `@font-face` | **chosen**: the same mechanism as the site (fallback metrics, preload), one maintenance path |
| C. `@fontsource` files in a hand-written `fonts.css` (today's mechanism) | no | none | rejected by the owner: two ways of loading the same fonts |

Families, from `site.font.*` and `font.sans` of the package: Source Sans 3 400, 600, 700, 900 normal (text, labels, map, diagrams; 900 for map labels that use `font.weightHeavy`); Source Serif 4 700 normal and italic (headings, wordmark); Source Code Pro 400 normal (code). `preload` for Sans 400 normal and Serif 700 normal only. The fonts config lives in the build's Astro config (`astroConfig` in `src/site/build.ts`), and the `<Font>` components in `Base.astro`. The `--font-*` variables the Fonts API defines replace `--ds-site-font-*` in `tokens.css`; the variables keep the family names of `site.font.*` first.

## 2. The policy with hashes (decided by the owner, Q2b)

The probe (AB#303 scratch `probe-fonts`) showed what the Fonts API writes: two `<style>` elements per page (one per family with `@font-face` rules and the generated fallback face), identical on every page, whose `url()` values are root-absolute (`/_astro/fonts/<hash>.woff2`). Two consequences:

- **Relative URLs.** A root-absolute `url()` breaks a site served under a path prefix (`/full/`) and is refused by "Relative URLs". The build already rewrites attributes to relative per page depth (`src/site/relative.ts`); it rewrites these `url()` values the same way. The style text then differs per page depth, so there is one hash per depth and per style.
- **One policy for all pages.** The build computes, after the rewrite, the `sha256` (base64) of every inline `<style>` of both sites, and writes one policy: today's directives with `style-src 'self'` followed by the sorted unique hashes. Every page's CSP `meta` and `_headers` carry exactly that policy. Astro's own `security.csp` stays off: stackledger owns the policy (`src/site/policy.ts`), as today.

The scan that today refuses any `<style>` keeps refusing a style that is not a block of `@font-face` rules (only `@font-face { … }` blocks, with `font-family`, `src` with relative `url()` and `format()`, `font-style`, `font-weight`, `font-display`, `unicode-range`, and the fallback's `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` and `local()`); inline scripts, `style` attributes and event handlers stay refused.

The proxy recipes (`examples/hosting/Caddyfile` and the hosting docs) set only `Content-Security-Policy: frame-ancestors 'none'` with the other headers: two CSPs apply together, so a fixed copy of the policy in the proxy would block the hashed styles. The `meta` policy on each page and the generated `_headers` (Cloudflare Pages, Netlify) carry the full policy.

## 3. Colours

`tokens.css` reads `--ds-brand-<theme>-stackledger-accent` for `--color-accent` (light, dark and the prefers-color-scheme block); `spec.site.colors.accent` still overrides light. Frame: `--frame-outline` is `--ds-outline-small` solid `--ds-color-ink` in light and `--ds-surface-dark-muted` in dark; `--frame-shadow` and `--frame-pressed` go (their tokens are 0 and the rim width is 0). `--color-on-primary` reads the brand roles through `--ds-site-<theme>-body` (the button text over `primary`, which is the text colour since 0.8.0). In `src/map/themes.ts`: `color.state.*` for licence, renewal and accent; `header` is `color.ink` on light and `surface.dark.panel` on dark (ink vanishes on `#121110`, ADR 0009 of the design system); `font` is `tokens.font.sans` as is. CSS needs the quotes: an unquoted `Source Sans 3` is an invalid family name (it ends in a digit) and Chrome drops it (checked in headless Chrome 145). The map's writer already escapes `'` as `&apos;`, so the attribute stays safe XML; the allow-list of attribute values admits the apostrophe in `font-family`, and keeps admitting it, escaped, in attributes that already carry catalogue text (`data-zone`), as "Safe SVG text" allows.

## 4. Banner

`scripts/home-banner.json` becomes concept C as approved (the generator in `openspec/changes/identity-v2/approved/`), with the pipe fills `illustration.accent`, `brand.light.stackledgerAccent` and `color.ink`, the `ledgerMark` Folha at size 180, and Sinal at the end of the blue line. `site-art.mjs` builds it with the 0.8.1 package. Matching the approved preview is checked once, by the parent, through `<img>` in Chrome (§6.5).

## 5. Footer endorsement

`site-art.mjs` writes `site/public/symbol-light.svg` and `symbol-dark.svg` from the package's `symbol` piece on each surface. The footer shows them as decorative `img` elements (16 × 16), one per theme like the header mark, before "by Bruno Souza", with no link (site-security: no external URL outside the home links).

## 6. Resolutions taken while writing the spec deltas

The owner can veto any of these at G1.

1. **Font files.** The design system ships only the TTF files it embeds in SVGs (no Source Serif 4, no Sans 600). stackledger depends on `@fontsource/source-sans-3`, `@fontsource/source-serif-4` and `@fontsource/source-code-pro` (exact 5.3.1, OFL 1.1) instead of `@fontsource/heebo`, `lato` and `signika`; the local provider reads their latin `woff2` files from `node_modules` at build.
2. **The scanned style.** Astro 7.3.8's `<Font>` writes, in the same inline `<style>`, a `:root { --font-…: … }` rule beside the `@font-face` blocks. The scan accepts a style made only of `@font-face` blocks (the descriptors listed in §2) and at most one `:root` block whose declarations are all custom properties named `--font-*` (a style with no `:root` block passes).
3. **stackledger's own sticker code** (`src/map/ink.ts`, the legend panel): a shadow copy is drawn only when `map.shadow` > 0 (0 in the package, so none); on the dark surface the legend panel and stackledger's own outlines on the background take `surface.dark.muted` (ADR 0009 of the design system: ink vanishes on near-black). A line's casing stays ink: the design system's `pipe` draws it and takes no `surface`; the coloured line carries the reading on dark, as the AB#303 renders showed.
4. **Labels may move.** Without the shadow the ink around markers is smaller, so a label can take an earlier candidate position. The engine's logic does not change; recorded outputs (the 0.2.0 map fixtures, `docs/images/map-*.svg`) are re-recorded only after the owner has seen the before/after renders of the maps.
5. **Banner evidence.** Pixel equality with the approved preview is a one-time render task (evidence in the PR), not a test: the approved files stay in this change folder, which moves when archived. The permanent test stays "the banner file is `coverTree` of the spec".
6. **Endorsement mark.** The footer shows the symbol as two themed images, `symbol-light.svg` and `symbol-dark.svg` (the design system's `symbol` piece on each surface, written by `site-art.mjs`), with the header mark's light/dark pattern; no SVG of the site carries a `<style>`, so `_headers` never meets an image with inline style.
7. **Personal mode.** The policy holds the hashes of the inline styles of the sites the build writes (`full` only in the personal mode).
8. **site-security's Purpose** still says "a fixed Content Security Policy"; a delta cannot change a Purpose, so the archive task edits that line by hand.
