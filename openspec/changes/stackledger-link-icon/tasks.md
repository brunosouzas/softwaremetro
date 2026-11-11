# Tasks: the stackledger link icon

Levels: unit and integration are vitest (`npm test`, after `npm run build`), e2e is Playwright (`npm run test:browser`). A scenario is written as capability / requirement / scenario.

## 1. Package and art

- [ ] 1.1 Pin `@brunosouzas/design-system` to exactly `0.10.0` with `npm install @brunosouzas/design-system@0.10.0 --save-exact`; the diff of `package.json` and `npm-shrinkwrap.json` touches only that package. Verified by: the full `npm test` and `npm run test:browser` stay green with no recorded output re-recorded (metro-map recordings in `test/fixtures/map-0.8.1`, `docs/images/map-*.svg`).
- [ ] 1.2 Run `npm run build && node scripts/site-art.mjs`: it adds `site/public/link-icons/stackledger-light.svg` and `stackledger-dark.svg` and leaves every other art file unchanged (`git status`). Proves catalogue-site / Home link icons / "Link icon files are the design system's" (`test/unit/site-brand.test.ts`, unit); Home links / "Site art is inert" stays green (same file, unit).

## 2. Setting

- [ ] 2.1 Add `stackledger` to `HOME_LINK_ICONS` in `src/schema.ts` (design: the copy stays). Proves catalogue / Home link icon setting / "Link icon", "Unknown link icon" (`test/unit/settings.test.ts`, unit: add `icon: stackledger` and `Stackledger`), "Icon names match the design system" (`test/unit/site-brand.test.ts`, unit).

## 3. Site

- [ ] 3.1 Add `Catalogue` with `icon: stackledger` to the icon settings of `test/integration/site.test.ts`. Proves catalogue-site / Home link icons / "Link with the stackledger icon" and keeps "Link with an icon" (`test/integration/site.test.ts`, integration); "Link icon follows the theme" stays green (`test/browser/site.spec.ts`, e2e).
- [ ] 3.2 The packed files hold the two new icon files (`test/integration/package.test.ts`, "Packed files", integration); the skills site's image allow-list names `stackledger` (`test/integration/site-skills.test.ts`, integration).

## 4. Documentation

- [ ] 4.1 `docs/catalogue-format.md` (`spec.site.home.links`: five icon names) and `docs/roadmap.md` (a row for `stackledger-link-icon`). Verified by the review and the docs tests in `npm test`.
