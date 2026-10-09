# Phase 1 Discovery — Legacy Data USA Application

Date: 2026-10-09. Sources: `../datausa-site` (branch `develop`, `26ce1b7a`), the app running at
http://localhost:3300, the CMS PostgreSQL database that app reads (read-only transactions only),
and https://datausa.io.

## 1. Runtime and deployment of the legacy app

| Item | Finding |
|---|---|
| Framework | Canon Core 0.26.2 + Canon CMS 0.22.14 + Canon Vizbuilder 0.5.3, React 16, Redux, react-router 3, Blueprint 3 |
| Node | `.nvmrc` v16.19.0, Docker image `node:16` |
| Production | Docker Compose, 4 identical containers on a GCE VM (ports 9994–9997) behind Nginx `proxy_cache` (1 year inactive, 300 GB) and Cloudflare (`cache-control: max-age=1800`, hits aged weeks) |
| CI/CD | GitHub Actions → Cloud Build → Artifact Registry → ssh to VM → `docker compose up` (`.github/workflows/google-gce-prod.yaml`) |
| Obsolete | `helm/` (GKE chart + per-city values files), `cloudbuild.yml`, `Dockerfile`, `compose.*.yaml` |
| Pre-caching | `npx canon-cms-warmup` visits every profile URL (ordered by zvalue) so Nginx caches the HTML; uncached `/api/profile?slug=geo&id=massachusetts` takes ~14 s because ~170 generator requests run serially-throttled (20 req/s) |
| Boot caches (`cache/*.js`) | Built at every server start from Tesseract + Postgres: `pops` (population per geo id, 7 levels), `parents` (cip/naics/soc/university/napcs parent maps), `measures` (units per measure), `datasets` (cube annotations), `homeGeomap`, `blsMonthlyIndustries`, `opeid`, `sctg`, `urls` (university URLs), `searchIndex` (lunr over `canon_cms_search`) |

## 2. Route inventory (`app/routes.jsx`, `api/*.js`, Canon internals)

### Page routes (public)

| Route | Status | Notes |
|---|---|---|
| `/` | active | Home: search, tile grid of most-viewed profiles (GA4 Data API via `api/homeRoute.js`), geomap of states |
| `/search` | active | Full search page (`/api/searchLegacy` lunr index) |
| `/profile/:slug/:id` | active | Report page; `onEnter` crosswalk redirects `sctg → napcs` and old geo ids (`static/data/oldgeos.json`) |
| `/profile/:slug/:id/:sslug/:tslug` | active | Embed: single section/topic, `?viz=true` hides text |
| `/about` → `/about/background` | active | Background, Press, Glossary, Usage |
| `/about/datasets`, `/about/api`, `/about/classifications/:dimension/:hierarchy` | active | Data pages; classifications list members from Tesseract |
| `/cms` | out of scope | Canon CMS builder |
| `/visualize`, `/map`, `/coronavirus`, `/cart` | disabled (commented out) | out of scope |
| `*` | active | 404 |

Query parameters on reports: `?compare=<memberSlug>` (side-by-side comparison), `?<selectorName>=<option>` for every selector, `?print=true`, `?viz=true` (embeds only).

### Legacy Express API routes (consumed only by the site itself)

| Route | Purpose | Replacement |
|---|---|---|
| `GET /api/profile?slug&id` (Canon mortarRoute) | Full report payload | Server-side report engine |
| `POST /api/cms/customAttributes/:pid` | Per-dimension "magic" variables (geo: `stateDataID`, `pumsID`, `electionCut`, `specialTessCut`, breadcrumbs, color maps, hosts) | `content/reports/<type>/attributes.ts` |
| `GET /api/parents/:slug/:id` | Breadcrumbs (geoservice intersects + search table, filtered by population > 250k) | `lib/dimensions/parents.ts` |
| `GET /api/:slug/similar/:id` | "Keep Exploring" tiles | `lib/dimensions/similar.ts` |
| `GET /api/neighbors` (Canon) | Nearest members by measure | `lib/api/neighbors.ts` |
| `GET /api/search`, `/api/searchLegacy`, `/api/search/totals` | Search (lunr) | SQLite FTS5 |
| `GET /api/civic/:type/:geo` | Senators/representatives from `static/data/{senators,representatives}.json` + geoservice | `content/reports/geo/civic.ts` |
| `GET /api/profile/:slug/:id/:size`, `/api/candidate/:type/:id` | Images from disk (722 MB) | linked to live host for now |
| `GET /api/geo/children/:id`, `/api/geo/childrenCounty/:id`, `/api/cip/parent`, `/api/naics`, `/api/soc`, `/api/napcs`, `/api/university/*` | Crosswalk helpers used by old logiclayer and some generators | ported per profile as needed |
| `/api/prism/*` | PeoplePrism gate (JWT cookie, Postgres `prism_submissions`) | Next route handlers |
| `/api/datasets`, `/api/press` | About pages | static content + cached Tesseract cubes |
| `/tesseract-proxy/*` | Proxy for Vizbuilder | dropped (Vizbuilder out of scope) |
| `/api/data` | Dead logiclayer (404 in production) | not needed; 2 of 218 charts still reference it (election electoral votes) — flagged |

## 3. Report (profile) types

`canon_cms_profile_meta`:

| id | slug | dimension | levels | cube | sections | vizzes |
|---|---|---|---|---|---|---|
| 1 | geo | Geography | Nation, State, County, Place, MSA, PUMA, Congressional District | acs_yg_total_population_5 | 86 | 79 |
| 2 | cip | CIP | CIP2, CIP4, CIP6 | ipeds_completions | 29 | 44 |
| 3 | naics | PUMS Industry | Industry Sector, Sub-Sector, Group | pums_5 | 23 | 19 |
| 4 | soc | PUMS Occupation | Broad, Detailed, Major Group, Minor Group | pums_5 | 22 | 30 |
| 5 | university | University | Carnegie, Carnegie Parent, University | ipeds_completions | 34 | 40 |
| 6 | napcs | NAPCS | Group, Section, Class | usa_spending | 12 | 8 |

Stories (`canon_cms_story*`) are empty. `users` holds 4 CMS logins (irrelevant).

## 4. CMS content schema (PostgreSQL)

No foreign keys are declared; relations are by convention. Every `*_content` table is keyed by `(id, locale)`; only `en` exists.

| Table | Rows | Purpose / key columns |
|---|---|---|
| `canon_cms_profile` | 6 | ordering, visible |
| `canon_cms_profile_meta` | 6 | profile_id, slug, dimension, levels[], measure, cubeName |
| `canon_cms_profile_content` | 6 | title, subtitle, label |
| `canon_cms_section` | 206 | profile_id, slug, type (TextViz 111, Grouping 28, SubGrouping 20, Default 18, Column 14, Hero 6, About 6, PrismSection 2, PrismSectionForm 1), ordering, allowed, position, icon |
| `canon_cms_section_content` | 206 | title (HTML `<p>`), short |
| `canon_cms_section_subtitle(_content)` | 59 | section_id, ordering, allowed; subtitle |
| `canon_cms_section_description(_content)` | 454 | section_id, ordering, allowed; description (HTML with `{{var}}`) |
| `canon_cms_section_stat(_content)` | 299 | section_id, ordering, allowed; title, value, subtitle, tooltip |
| `canon_cms_section_visualization` | 218 | section_id, ordering, allowed, **logic (JS)**, logic_simple (unused), simple=false |
| `canon_cms_selector` | 95 | profile_id, name, title, type (single/multi), default, options[] json, dynamic (variable name) |
| `canon_cms_section_selector` | 94 | section_id, selector_id, ordering |
| `canon_cms_generator` | 352 | profile_id, name, **api (URL template)**, **logic (JS)**, allowed |
| `canon_cms_materializer` | 89 | profile_id, name, ordering, **logic (JS)**, allowed |
| `canon_cms_formatter` | 35 | name, **logic (JS)** |
| `canon_cms_search` | 47,690 | id, dimension, hierarchy, slug, zvalue, imageId, cubeName, contentId |
| `canon_cms_search_content` | 47,690 | name, keywords[], attr jsonb (`{show:false}` on 522 rows) |
| `canon_cms_image(_content)` | 2,109 | url (Flickr), author, license; meta. `splash`/`thumb` bytea are all NULL — files live on disk |

Search members by dimension: Geography 37,016 (Place 29,856, County 3,244, PUMA 2,470, MSA 945, State 56, CD 444, Nation 1), University 7,624, CIP 1,837, PUMS Occupation 650, PUMS Industry 309, NAPCS 254.

## 5. How Canon renders a profile (`canon-cms/src/api/mortarRoute.js`)

1. **Member resolution**: `dims` from query; look up `canon_cms_search` by `slug` or `id` + `cubeName`. Raw ids (`04000US25`) answer `{errorCode: 301, canonRedirect}` so the client redirects to the slug URL. Hidden members (`attr.show === false`) are excluded from search/neighbors.
2. **smallAttr**: `{id, dimension, hierarchy, slug, name, cubeName, user:false, showWhenPrinting}` + `parents` from Tesseract `relations.jsonrecords` (returns 404 today, so never set) + the custom attributes POST.
3. **Generators**: filtered by `allowed`; `api` templates swapped with `urlSwap` (`<id>`, `<hierarchy>`, `<tesseract>`, `<geoservice>`, cache keys, custom attrs); distinct URLs fetched once (throttled 20/s, 5 s timeout); `logic` evaluated as `(resp, libs, formatters, locale, variables) => {…}`; results merged in generator order. URLs containing `slugs=` get `"<Level> Slug"` columns injected from the search table.
4. **Materializers**: sorted by `ordering`, evaluated as `(variables, libs, formatters, locale) => {…}`, merged cumulatively.
5. **Formatters**: `Function("n","libs","locale","formatters", logic)`; names lower-camel-cased (`Abbreviate` → `abbreviate`).
6. **varSwapRecursive** over the raw profile: `[[selector]]` replaced by the chosen option (query param, else `default`, which may itself be `{{var}}`); then `Formatter{{var}}` replaced via formatter (missing variable → `"N/A"`); `allowed` filters arrays (`always` or truthy `variables[allowed]`); a hidden Grouping hides its following sections; dynamic selectors get options from `variables[selector.dynamic]`.
7. **Client**: `prepareProfile` re-runs the swap locally on selector change and updates the URL; the client Viz evaluates `logic` with `Function(...)` + `with(globals)` to get a d3plus config, strips `type`, picks the `d3plus-react` component, fetches `data` URLs and runs `dataFormat`.

`libs` = `{d3: d3-array + d3-collection + d3-format + d3-time-format, d3plus: {assign, closest, date, formatAbbreviate, merge, strip, titleCase}, stats}`.

## 6. JavaScript configuration patterns (all profiles)

| Where | Count | Observed usage |
|---|---|---|
| generator.logic | 352 | `resp.data`; `libs.d3.{max, sum, nest, merge, min, extent, mean, format, timeFormat}`; `libs.d3plus.{merge, titleCase}`; formatters `commas, abbreviate, growth, list, growthPct, salary, gini, growthWord, lower, plural, dollar, moreWord, declinedGrewWord, growing, increasedWord, grewWord, abbreviateBig`; 81 read `variables`; no `{{`/`[[` |
| materializer.logic | 89 | reads `variables`; 7 contain `[[selector]]`; 4 reference `document` (must be guarded) |
| visualization.logic | 218 | returns d3plus config; 161 use `"[[selector]]"` string literals; 12 `{{var}}`; 25 use `window` (`window.albersUsaPr()`, `innerWidth`); `data` URLs are `` `${tesseract}tesseract/data?…` `` (307 → `data.jsonrecords`) except 2× `/api/data`, 1× `/api/covid19`, 1× `/api/civic` |
| formatter.logic | 35 | pure functions of `n`, some call other formatters/libs |
| selector.default | 95 | literal option or `{{var}}`; 7 reference other selectors with `[[…]]` |

Visualization types in use: BarChart 112, LinePlot 36, Geomap 34, Treemap 24, StackedArea 5, Radar 5, Priestley 2, Sankey 2, Donut 2, Plot 1, PrismMap 1 (custom Leaflet map). Config keys seen: title, shapeConfig, tooltipConfig(tbody/title), groupBy, data, label, dataFormat, time, x/y(+Config), tickFormat, discrete, legend(Config), height, legendTooltip, ySort/xSort, groupPadding, ticks, barPadding, colorScale(Config), topojson(Filter/Id), projection, labelRotation, sum, stacked, timeline(Config), total(Format), aggs, confidence(Config), lineLabels, depth, timeFilter, cache.

Global d3plus theme: `app/d3plus.js` (fonts Pathway Gothic One / Source Sans Pro / Palanquin, tooltip styles, `findColor` by `static/data/colors.json`, icons from `static/data/icons.json`, bad/good measure colours, CartoCDN tiles).

## 7. Dimension lookup requirements

- Resolve `/profile/<slug>/<idOrSlug>` → member (id, name, hierarchy, cubeName, imageId); redirect raw ids to slugs.
- Breadcrumbs: geoservice `relations/intersects` (geo) or boot-time parent maps (others), names from the search table, population filter from `cache.pops`.
- Similar / Keep Exploring: geoservice intersects + neighbors + zvalue ranking.
- Search: lunr index over 47,690 members with keyword/abbreviation boosts, zvalue weighting, `dimension`/`hierarchy` filters, totals per dimension.
- Images: `imageId` with parent fallback.
- Tesseract `members?cube&level&search=` exists and could resolve by id/name but has no slugs, zvalues, keywords, images or `show:false` flags → a local copy is required. Decision: SQLite built from the search + image tables (see architecture).

## 8. External API conventions

- Tesseract (`CANON_CONST_TESSERACT`, local `https://ohio-api.datausa.io/`, production HTML references `api-ohio.datausa.io`): `tesseract/data.jsonrecords?cube&drilldowns&measures&include=Level:id;Level:id&time=Year.latest&sort=M.desc&limit&locale=en&parents=true&filters=M.gte.5` → `{annotations, page, columns, data[]}`; `tesseract/members?cube&level[&search]`; `tesseract/cubes[/name]`; `calcs/pums.jsonrecords`; `complexity/rca_historical.jsonrecords`. `tesseract/data` (no extension) 307-redirects to `.jsonrecords`. `relations.jsonrecords` is gone (404).
- Geoservice (`https://geoservice.datausa.io/api/`): `neighbors/<geoid>`, `relations/intersects/<geoid>?targetLevels=state,county&overlapSize=true`.
- CartoCDN raster tiles for Geomap backgrounds.

## 9. Reusable visual assets (legacy `static/`)

`static/data/colors.json`, `icons.json`, crosswalk JSONs (`oldgeos`, `nacps2sctg`, `pums_*`), `senators.json`, `representatives.json` (civic stats), `static/icons/` (1 MB; dimension/section SVGs), `static/images/` (logos, footer, viz share icons; `profile/` 722 MB and `candidates/` stay on the legacy host), `static/topojson/` (73 MB: State, County, PUMA, Place_XX, Msa, Districts, birthplace), `static/fonts.css` (Google Fonts + base64 Pathway Gothic One), `app/style.yml` (theme tokens), `app/d3plus.css`, `app/App.css`, component CSS.

## 10. External dependencies

| Integration | Classification | Notes |
|---|---|---|
| Google Analytics 4 (`G-9X03EHGTVS`) with consent mode + EU cookie banner | required | inline gtag in `App.jsx`; consent cookie `hasConsent` |
| Google Fonts (Lato, Palanquin, Source Sans Pro, Pathway Gothic One) | required | base64 Pathway Gothic for SVG export |
| Deloitte PeoplePrism (sponsor notice, Prism gated sections, `cookienotice.deloitte.com`, referral params) | required (revenue) | Prism gate writes to Postgres |
| GA4 Data API (service account) for "most viewed" home tiles | optional | needs `GA_KEYFILE`; fallback to zvalue ordering acceptable |
| Flickr SDK, Google Cloud Storage, sharp | obsolete | CMS image editing only |
| CartoCDN tiles | required | Geomap backgrounds |
| Wikimedia/NYT/Census links in text | content | links only |
| No ad networks, Sentry, Hotjar, etc. | — | none found in source or rendered HTML |

## 11. Current build and cache process

`canon-build` (webpack, ~minutes) → Docker image → 4 containers; each boot rebuilds all `cache/*.js` from Tesseract and Postgres (including a 47k-row lunr index); Nginx caches full HTML and API responses for up to a year; `canon-cms-warmup` crawls every profile after each deploy (≈3 days); `scripts/clearStateCache.js` bypasses cache for election URLs. Content edits require the CMS UI + cache invalidation.

## 12. Baseline measurements (legacy, local, macOS)

| Metric | Value |
|---|---|
| Uncached `/api/profile` Massachusetts | 14.0 s |
| Profile payload | 1.15 MB JSON (variables 253 KB / 1,794 keys without `_rawProfile`) |
| Client bundle | single `/assets/client.js` (measured in Phase 7 against 3301) |

Further Lighthouse/TTFB/CLS baselines are captured in Phase 7 (`docs/regression.md`).
