# Design: the stackledger link icon

One decision: where the list of allowed names lives.

- **Kept: the schema's own copy** in `src/schema.ts` (`HOME_LINK_ICONS`), gaining `stackledger`, with the existing unit test that it equals the design system's `LINK_ICON_NAMES`. The `home-banner` design chose a copy so that `stackledger validate` (and the MCP server) do not load the design system: its entry point is the whole pieces library and its tokens, for a list of five words.
- **Not chosen: deriving it** (`z.enum(LINK_ICON_NAMES)`). The types allow it (`LINK_ICON_NAMES` is a readonly tuple), but it would load the design system in every `validate`, against that decision, for a list that changes once in several releases; a future name still fails the test until it is added here.

Everything else follows the existing structure: `scripts/site-art.mjs` already loops over `LINK_ICON_NAMES`, so it writes the two new files without change.
