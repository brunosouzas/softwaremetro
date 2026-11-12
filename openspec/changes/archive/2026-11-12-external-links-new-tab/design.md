# Design: external links open in a new tab

One small decision, the markup:

- **One component, `site/src/components/NewTabLink.astro`**, used by the three external anchors (icon links, text links, map credit). It writes `href`, `target="_blank"` and `rel="noopener noreferrer"` in one place, and the announcement: with a `label` (icon links) `aria-label="<label> (opens in a new tab)"` and no text, so "Home link icons" keeps "no text other than whitespace"; without one, the slot followed by `<span class="visually-hidden"> (opens in a new tab)</span>`, the site's existing hidden-text class (`base.css`), so the visible text is unchanged and the name is the text plus the suffix.
- **Not chosen: `aria-describedby`** pointing at one hidden "opens in a new tab" element: the owner chose the accessible name (q58 A, G201), and a description is read later or not at all by some screen readers.
- **Not chosen: `aria-label` on text links too**: it hides the visible text from the name computation, so a translated page or a changed title can drift from what is read, and WCAG 2.5.3 (label in name) is easier to break.
- **Not chosen: a build-scan rule** that requires `target` on exempt anchors: the three anchors come from one component and the integration test walks every anchor of the built sites ("Internal links in the same tab"), so a scan rule would only repeat it.

The suffix is English, like every other interface text of the site.
