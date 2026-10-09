# Migration gaps and decisions

Running list of behaviour that differs from the legacy site, was deliberately simplified, or still
needs work. Updated as milestones land. "Legacy" = the Canon app at `../datausa-site` / localhost:3300.

## Open

| # | Area | Gap | Plan |
|---|---|---|---|
| G1 | Images | Profile splash/thumb images (722 MB on the legacy VM) are hot-linked from `https://datausa.io/api/profile/<slug>/<member>/<size>` via `NEXT_PUBLIC_IMAGE_BASE_URL`. They stop working when the legacy app is switched off. | Before cutover: copy `static/images/profile/{splash,thumb}` to object storage or a static host and point the env var at it (the URL shape stays `/api/profile/...` or a new base). User decision 2026-10-09: do not move them yet. |
| G2 | Prism DB | PeoplePrism registrations are written to the legacy Postgres server (`PRISM_DATABASE_URL`, same host as the CMS DB). | Keep that database online or migrate the `prism_submissions` table; the app needs no other database. |
| G3 | Other report families | Only `geo` is implemented (first milestone). `cip`, `naics`, `soc`, `university`, `napcs` templates are extracted by the same tool but their attribute resolvers and legacy-endpoint helpers (`/api/university/*`, `/api/napcs/*`, measure-based `/api/neighbors`) are not ported yet. | Phase 4. |
| G4 | Search ranking | Legacy ranked with a lunr index built at boot; the rewrite uses SQLite FTS5 prefix matching with the same post-ranking heuristics (exact/prefix boosts, zvalue weight). Results are very close but not byte-identical. | Compare top-10 results for common queries in Phase 7. |
| G5 | Popular reports | The home page's "Recent popular reports" come from Google Analytics 4 when `GA_KEYFILE` points at a service-account key (REST + JWT, no SDK); the key file is not present on the development machine, so that path has only been exercised against the fallback (curated defaults). | Verify on the VM with the production key file before cutover. |
| G6 | Deployment | PM2 ecosystem, Nginx snippet, cutover/rollback docs. | Phase 8. |

## Resolved or accepted differences

| # | Area | Difference | Rationale |
|---|---|---|---|
| A1 | `/api/data` logic layer | Legacy generator 127 ("Election - Electoral Votes") and 15 charts still call `/api/data`, which has been a 404 in production since the logic layer was removed. The rewrite returns the same 404 in-process, so the dependent variables and charts stay hidden exactly as they are today. | Faithful to production; the charts could be rewritten against Tesseract later. |
| A2 | Generator 728 | "Household Income by Race" requests two hierarchies of the same dimension and Tesseract answers 400, on the legacy site too. | Faithful. |
| A3 | Neighbour ordering | The legacy site listed neighbouring states in Postgres primary-key (geoid) order; the geoservice returns them by proximity. The rewrite sorts by geoid to keep the generated sentence identical. | Parity. |
| A4 | Sloppy-mode globals | Several CMS chart bodies assigned undeclared variables (`dataMales = …`). The converter declares them explicitly; behaviour unchanged. Genuine legacy defects are recorded in `scripts/legacy-export/patches.ts` with notes. | Documented. |
| A5 | Redirect status | Raw-id and crosswalk redirects answer 308 (issued by `src/proxy.ts` before rendering) instead of the legacy 301; both are permanent and SEO-equivalent. Unknown reports answer a real 404 the same way. | Framework default; see architecture decisions. |
| A6 | View Data table | The legacy Blueprint table with per-measure unit formatting became a plain HTML table (first 500 rows) plus full CSV download; CSV is downloaded directly rather than zipped. | Allowed simplification. |
| A7 | Save Image | PNG uses `@d3plus/export`; SVG serialises the chart's SVG element directly. | Same outcome. |
| A8 | Data cart | Already disabled in the legacy UI (`cartEnabled = false`); not ported. | Dead feature. |
| A9 | Shared d3plus theme | d3plus 4 warns once per chart class about theme keys it does not use (axis styling on a map, tiles on a bar chart); warnings are silenced with `configWarnings(false)`. | Theme is intentionally shared, as in legacy. |
| A11 | Citizenship chart (viz 430) | The CMS code spread a URL string into characters (`...dataNation`), so production requests ~190 one-letter URLs per county page and the chart shows "No Data Available". Patched to a single URL (`scripts/legacy-export/patches.ts`); the chart island also drops such fragments defensively. | Bug fix; recorded as a content patch. |
| A10 | Subnav dropdown | Hover/focus dropdowns are rebuilt without Blueprint; visuals follow the legacy CSS. | Allowed simplification. |
| A12 | d3plus console noise | d3plus 4 maps and zoomable charts log `<svg> attribute height: A negative value is not valid` during their first draw pass (the library measures its container before the `height: 100%` chain has resolved, then corrects itself through its ResizeObserver). The rendered charts are correct; the messages are visible only in the browser console. | Library behaviour (`ensureZoomDom` in `@d3plus/core`); worth reporting upstream. |
| A13 | Glossary formulas | KaTeX was replaced by native MathML for the three glossary formulas (no dependency, same content). | Allowed simplification. |
| A14 | Data sources page | Blueprint collapsible buttons became native `<details>` elements styled the same way; the grouping of Tesseract cube annotations is unchanged. | Allowed simplification. |
| A15 | Classifications table | The Blueprint data table became a plain HTML table with a sticky header in a scrolling container, with every member linked to its report. | Allowed simplification. |
| A16 | Icons | Icons that CSS recolours (dimension and feature icons) are inlined server-side from `public/` (`src/lib/inline-svg.ts`), replacing react-inlinesvg; pages that repeat an icon hundreds of times (search) use one SVG sprite with `currentColor`. Files over 20 KB (raster-wrapping SVGs) stay `<img>`s. | Same visuals, smaller HTML. |
| A17 | d3plus 4 defaults | d3plus 4.5–4.7 enable features the legacy d3plus 2 charts never had: in-chart table view, search box and minimap, zoom on every chart type, inset legends, size legends, shared Plot tooltips, motion trails, and unloading charts that scroll out of view. The shared theme (`src/lib/viz/theme.ts`) turns them off (`tableView`, `search`, `minimap`, `legendInset`, `sizeLegend`, `tooltipShared`, `detectVisibleUnload`, `shapeConfig.Circle/Rect.trail`) and the chart island sets `zoom: false` for everything but maps, so the CMS configs render as designed. Individual CMS configs can still opt in. | Keyed to the d3plus CHANGELOG (4.0, 4.5, 4.6, 4.7); audited with `scripts/regression/probe-d3plus-warnings.mjs`. |
| A18 | Section icons | The CMS names section icons from the Blueprint icon set ("pulse", "briefcase"…), which the legacy site rendered through `@blueprintjs/core`. The eight icons the content uses are exported as SVG files in `public/icons/blueprint` (Apache-2.0, see the LICENSE there) and inlined so CSS colours them, with no Blueprint dependency. | Same glyphs, no UI framework. |
