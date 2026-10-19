# Architecture — Data USA 2026 (Next.js rewrite)

Status: proposed 2026-10-09 after Phase 1 discovery (`docs/discovery.md`); updated as milestones land.

## Goals recap

- Content and configuration live in Git as TypeScript; data comes from Tesseract and the geoservice at request time.
- Any valid report URL renders on first request after a deploy: no build-time enumeration, no warm-up crawl.
- SEO-critical content (title, hero stats, about narrative, metadata, links) is in the server HTML.
- Charts are client islands mounting `@d3plus/core` 4.7 charts through our own small renderer (`src/components/viz/ChartRenderer.tsx`), loaded lazily per section.
- Deploy = `next build` + PM2 cluster behind the existing Nginx/Cloudflare; no CMS database at runtime.

## Stack (pinned, see `package.json`)

Next.js 16.4.0 (App Router, Cache Components, standalone output), React 19.3, TypeScript 5.9 strict, `@d3plus/core` / `@d3plus/dom` / `@d3plus/text` / `@d3plus/color` / `@d3plus/export` 4.7.0, d3-array / d3-collection / d3-format / d3-time-format / d3-geo (the helper surface the legacy content code already uses), CSS Modules + global CSS, Node 24 LTS built-in `node:sqlite` (FTS5) for dimensions. Dev-only: `pg` + `tsx` for the one-time extraction scripts.

## Source layout

```
src/
  app/
    layout.tsx, page.tsx, not-found.tsx, robots.ts, sitemap/…
    profile/[slug]/[id]/page.tsx                 report (dynamic)
    profile/[slug]/[id]/[sslug]/[tslug]/page.tsx embed
    search/page.tsx, about/…
    api/search, api/geo/names, api/prism/*, api/revalidate     route handlers (only where needed)
  content/
    formatters/            35 formatters as TS functions (hand-converted)
    shared/                colors.json, icons.json, crosswalks, civic rosters
    reports/<type>/        one folder per report family
      profile.ts           ProfileMeta (slug, dimension, levels, cube, title/label)
      sections.ts          ordered SectionDefinitions (text templates, stats, allowed, selector + viz ids)
      selectors.ts         SelectorDefinitions
      attributes.ts        hand-written "custom attributes" (replaces api/customAttributes.js)
      generators/*.ts      one typed generator per file + index (ordered)
      materializers/*.ts   one typed materializer per file + index (ordered)
      visualizations/*.ts  one typed d3plus config function per file; manifest.ts (allowed, usedVariables); index.ts (lazy registry)
    pages/                 home, about, glossary… (TS/Markdown)
    registry.ts            typed map profile slug → template (static imports)
  lib/
    api/tesseract.ts       typed client: URL normalisation, fetch, parse, `use cache` + cacheTag
    api/geoservice.ts
    dimensions/            SQLite access: resolveMember, search, images, parents, similar
    reports/               engine: attrs → generators → materializers → prepare sections (allowed, selectors, template swap)
    template.ts            `[[selector]]` + `Formatter{{var}}` renderer (regex, no eval)
    viz/                   client runtime: registry loader, d3plus theme, data loading, options
    seo/, formatting/, routing/
  components/
    layout/ (Nav, Footer, GA), report/ (Hero, Subnav, Section, Topic, Stat, SourceGroup, …), viz/ (VizIsland, Options)
scripts/legacy-export/     extract.ts (CMS → candidate TS files + manifest), build-dimensions.ts (JSONL → SQLite)
scripts/topojson/          build.sh (Census boundary files → public/topojson/PUMA.json, Districts.json)
scripts/school-districts/  build.sh (Census boundary files → public/topojson/SchoolDistrict_<state>.json + data/school-districts.jsonl)
data/                      members.jsonl, images.jsonl (versioned export), members-additions.jsonl (hand-added members), school-districts.jsonl (built from Census files) → dimensions.sqlite (built, gitignored)
public/                    icons, images, topojson (only files referenced by content), fonts
```

## Content model

The legacy CMS stores four kinds of things; each gets the simplest faithful representation:

| Legacy | New representation | Why |
|---|---|---|
| Section rows + `*_content` text with `{{var}}` / `Formatter{{var}}` / `[[selector]]` | `SectionDefinition` objects in `sections.ts`; text kept as template strings | Declarative; editors change prose without touching React; rendered by a 40-line typed template function (regex substitution, never `eval`) |
| `allowed` (variable name or `always`) | kept as string key; engine checks `variables[key]` truthiness exactly like Canon | Faithful, declarative |
| generator `api` + `logic` | `GeneratorDefinition {id, name, allowed, api(attrs), logic(resp, ctx)}` — `api` becomes a template-literal function, `logic` a real function body | Typed at the boundary (`ReportContext`, `TesseractResponse`), compiled by `tsc`, no runtime evaluation |
| materializer `logic` | `MaterializerDefinition {id, name, ordering, logic(variables, ctx)}` | same |
| visualization `logic` | `VizDefinition = (variables, ctx) => D3plusConfig`; `"[[sel]]"`/`"{{var}}"` string literals wrapped as `ctx.swap("…")` | Same semantics as Canon's selSwap/varSwap, but the code is a module |
| formatters | `content/formatters/index.ts` | hand-converted, unit-tested |
| selectors | `SelectorDefinition {name, title, type, default, options | dynamic}` | declarative |
| `api/customAttributes.js` (per dimension) | `content/reports/<type>/attributes.ts` | hand-converted, typed |

Generated files carry a header comment with the legacy table + id so the manifest can prove coverage. `scripts/legacy-export/manifest.json` lists every record, its output file, and any pattern the converter could not handle (reviewed by hand and tracked in `docs/migration-gaps.md`).

The `variables` namespace is dynamic by nature (1,794 keys for Massachusetts), so it is typed as `Variables = Record<string, unknown>` with helper accessors; generator/materializer/viz bodies keep their original loosely-typed inner code but are compiled as TypeScript.

## Request flow for `/profile/geo/massachusetts`

1. **Route** `app/profile/[slug]/[id]/page.tsx` (dynamic, no `generateStaticParams`). Unknown profile slug → 404. Member lookup via SQLite (`resolveMember`): slug or raw id; raw id → 301 to the slug URL (as today). Hidden members → 404.
2. **Attributes** (`content/reports/geo/attributes.ts`): breadcrumbs (geoservice intersects + SQLite names + population threshold via a cached Tesseract lookup), `stateDataID`, `pumsID`, election ids, colour maps, hosts. Cached per member (`use cache`, tag `dimensions`).
3. **Generators**: the engine evaluates each `api(attrs)`, dedupes URLs, fetches them in parallel through `lib/api/tesseract.ts` (`use cache`, `cacheLife` "data", `cacheTag("tesseract")`), then runs the `logic` functions in generator order. Failures yield `{}` like Canon (status recorded for diagnostics).
4. **Materializers** run in order on the accumulated variables.
5. **Prepare**: selectors resolved from `searchParams` (validated against options, else default), `allowed` evaluated, Grouping visibility cascaded, text templates swapped. Output: a `PreparedReport` (plain data) used by server components.
6. **Render**: server components render Nav, Hero (title, subtitle, stats), Subnav (static markup; a small client enhancer tracks scroll), About (breadcrumbs, photo credit, narrative), Groupings → Topics (title, subtitles, stats, descriptions, sources). Each visualization becomes `<VizIsland id sectionSlug/>` — a client component that lazy-loads only that viz module, reads the report's variables from a once-serialised context (only keys the page's vizzes actually use, per the manifest), builds the d3plus config, and renders with `@d3plus/react` when it nears the viewport (`IntersectionObserver`, reserved height). Selector changes update URL search params and re-render the affected topic client-side (templates for selector-bearing topics are passed to the client; the rest stays server-only).
7. **Comparison** (`?compare=`) runs the engine for both members in parallel and renders paired columns server-side.
8. **Metadata**: `generateMetadata` reuses the prepared hero/about text for `<title>`, description, canonical, Open Graph image (legacy image host).

All of this happens per request with no page-level cache: the expensive parts (Tesseract responses, dimension lookups, attribute resolution) are cached with tags and lifetimes, so a cold request is correct and a warm one is fast. Nginx `proxy_cache` and Cloudflare in front remain optional accelerators.

## Caching and invalidation

| Layer | Mechanism | Lifetime | Invalidation |
|---|---|---|---|
| Tesseract/geoservice responses | `use cache` in `lib/api/*` with `cacheTag("tesseract")` / `("geoservice")` | `cacheLife` profile `data` (stale 1 d, revalidate 7 d, expire 30 d) | `POST /api/revalidate` (secret) → `revalidateTag` after a dataset release; or restart |
| Dimension lookups (SQLite) | in-process, synchronous | n/a | rebuild `data/dimensions.sqlite` + restart |
| Content | module code | deploy | git push → build → `pm2 reload` |
| Full page | none in Next; Nginx/Cloudflare optional | 30 min at edge | existing purge procedures |

PM2 cluster workers each hold their own `use cache` store (Next's default in-memory/file handler). This is correct without coordination; a shared handler (Redis) is documented as an optional upgrade if duplicate upstream requests become a measurable cost.

## Dimensions (replaces `canon_cms_search` + lunr)

`scripts/legacy-export/build-dimensions.ts` exports the search and image tables to `data/members.jsonl` / `data/images.jsonl` (versioned, diffable) and `npm run build` compiles them into `data/dimensions.sqlite` (`members`, `members_fts` FTS5, `images`, `profiles`). `lib/dimensions` resolves slugs, powers `/search` and the hero search box, builds breadcrumbs and "Keep Exploring", and maps members to image ids. New members can be added by re-running the builder; no application build or restart is needed (a running server notices within seconds that the file was replaced and reopens it), and a member missing from SQLite but present in Tesseract still resolves by raw id through `tesseract/members`.

## School districts

School districts are 13,310 unified, elementary and secondary districts (Census summary levels 970, 950 and 960; ids like `97000US2502790`), treated as one level, "School District". Tesseract calls the level the same, with the ids and names of the Census 2024 boundary files: `State School District` > `School District` in the shared Geography dimension, with a `Type` property.

- **Members and shapes** come from the Census Bureau's cartographic boundary files, not from the legacy export: `scripts/school-districts/build.sh` writes `data/school-districts.jsonl` (name, slug, grade span, land area, an interior point) and `public/topojson/SchoolDistrict_<state FIPS>.json`. `build-dimensions.ts` loads the file into `members`, adds the level to the geo profile and fills a `school_districts` table with the extra columns. Members have no z-value (it is a popularity measure derived from data), so they rank on text relevance alone and a level listing is alphabetical. Tesseract has 13,305 of them; the five it lacks are the four island-area departments of education and Wyandanch, NY.
- **Data**: seven ACS 5-year cubes have the level, for 2024 only: `acs_yg_total_population_5`, `acs_ygs_median_age_total_5`, `acs_ygr_race_with_hispanic_5`, `acs_ygr_median_household_income_race_5`, `acs_yg_housing_median_value_5`, `acs_ygpsar_poverty_by_gender_age_race_5` and `acs_ygso_gender_by_occupation_c_5`. Every other cube lists the level (the dimension is shared) and answers a district cut with no rows; a district drilldown without a cut returns rows of other geographies with an empty name, so always cut by district.
- **Report**: `src/content/reports/geo/school-district.ts`, which `getTemplate` (`src/content/registry.ts`) returns for the level instead of the full location report (whose other sections would show "N/A" and empty charts). It is the location report's hero figures, its Race and Ethnicity, Occupations (workforce only, by sex) and Poverty sections, unchanged, with grouping texts rewritten for what a district has, and an About section with the boundary-file facts (kind, grades, land area), a data summary and the locator map. It runs 13 of the location report's generators and all its materializers. With no population for the district (a Tesseract server without the cubes, or a district without data) the data sections hide themselves and the page is the hero and About text from the boundary file. Chart 386 (occupations) was changed to keep its workforce figures when there is no earnings data (`scripts/legacy-export/patches.ts`).
- **Search**: members are found by the site search and the search page like any other. The search page draws every district as a point (as it does places), clustered until the map is zoomed in, and as shapes from 6x (secondary districts stay points, as they overlap elementary ones); there is no population column, ranking or sizing while the level is pending.
- **SEO**: the level is in `PENDING_LEVELS` (`src/lib/geo/levels.ts`) until the production Tesseract server has the cubes: its reports and search listing are `noindex, follow` and absent from the sitemap.
- **Photos**: a district shows its state's photo (and credit); the image host has none for districts.

When production has the data:

1. Remove the level from `PENDING_LEVELS`. Its reports are then indexed and enter the sitemap, and the search page stops saying the data is not available.
2. Add the level to `POPULATION_LEVELS` (`src/lib/dimensions/population.ts`) for the population column and ranking on the search page, and check the search map's point sizing; z-values can then be exported for search ranking.
3. As more cubes get the level, add their sections to the template (the location report's section, its generators by id, its charts) and check each against a district, as was done for the first seven.
4. `similarGeographies` is skipped for pending levels in `ReportPage.tsx`; check what the geoservice returns for district ids before enabling "Keep Exploring" similar places.

## Rendering responsibilities

Server components: everything textual. Client components: `VizIsland` (d3plus), `Options` (view data / CSV / PNG-SVG / share-embed), selector controls, Subnav scroll tracking, hero search + compare button, Prism gate form, GA consent hooks.

## Images

Profile splash/thumb images are served by this app: `GET /api/profile/<slug>/<member>/<splash|thumb|json>` reads the JPEGs from `profile-images/{splash,thumb}/<image id>.jpg` (outside Git, about 720 MB; `PROFILE_IMAGES_DIR` to put them elsewhere) and falls back to the nearest parent's photo, then a stock one (`src/lib/reports/images.ts`). `NEXT_PUBLIC_IMAGE_BASE_URL` can point pages at another host with the same paths.

## Deployment

`next build` → `.next/standalone` run by PM2 in cluster mode (`ecosystem.config.cjs`), `next start -p 3301` equivalent, Nginx proxies `/` to the cluster and serves `/_next/static` and `/public` with long cache headers. No Docker, no cache warming, no database besides the Prism submissions table. Details in `docs/deployment.md` once Phase 8 lands.

## Decisions log

- 2026-10-09 Node 24 LTS (newest LTS; Node 26 becomes LTS late October 2026 and is a drop-in upgrade).
- 2026-10-09 SQLite via `node:sqlite` instead of Postgres for dimensions (legacy CMS DB will be decommissioned; FTS5 confirmed available).
- 2026-10-09 Template syntax `{{var}}`/`[[sel]]` kept for prose; JS bodies become modules; no interpreter.
- 2026-10-09 Images linked to the live host for now (user decision).
- 2026-10-09 `tesseract/data` URLs normalised to `data.jsonrecords` in the client to skip the 307.
- **Static pages are server components with global CSS ported from the legacy stylesheets** (`src/app/(site)/home.css`, `search/search.css`, `about/about.css`): the legacy class names are kept so the visual design carries over unchanged; only Blueprint widgets were replaced by native elements.
- **Home page data** (`src/lib/home/*`): report columns and the state map are `use cache` functions (hourly / `data` profile). Google Analytics popularity uses the GA4 Data API over REST with a service-account JWT signed by `node:crypto`, avoiding the `@google-analytics/data` dependency; without `GA_KEYFILE` the curated defaults are used.
- **Latest-data home page draft** (`/home-next`, `src/lib/latest/*`): headline figures fetched from the BLS public API (`bls.ts`, optional `BLS_API_KEY`) and EIA's weekly fuel price tables (`eia.ts`, no key needed), cached for hours under `external-data`. `indicators.ts` builds every headline and sentence from the numbers (pure functions), so the copy updates itself with each release; when a source fails the last good figures are kept. Not indexed; `/` is unchanged.
- **Search page** renders the first 100 results on the server (useful without JavaScript and for crawlers); filters and typing then query `/api/search` from the client and keep the URL in sync, as the legacy page did.
- **Section redirects** (`/about`, `/about/classifications`) live in `next.config.ts` rather than in pages, so they answer 308 before any rendering.
- **Status codes come from `src/proxy.ts`, not from the pages.** With Cache Components a report page streams its static shell before the member lookup runs, so `permanentRedirect()`/`notFound()` inside the page cannot change the HTTP status in production (the dev server masks this). The proxy resolves `/profile/:slug/:id` (and embeds, and classification levels) against the SQLite dimensions database before rendering: crosswalk and raw-id URLs answer 308, unknown members are rewritten to `/report-not-found`, a static route that renders the site's not-found page with a real 404. The pages keep their own checks as a fallback.
- **Boot-time caches became cached functions.** The legacy server built lookup tables at startup (BLS monthly industries, OPEIDs, university URLs, SCTG names, hierarchy parents). They are now `use cache` functions in `src/lib/content/lookups.ts`, fetched on first use and refreshed with the `tesseract` tag, so a release needs no restart and startup stays instant.
