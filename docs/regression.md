# Milestone validation — geography reports

Measurements taken 2026-10-09 on the development machine (macOS, Node 24.21), legacy site at
`localhost:3300` (Docker, Canon CMS, warm Postgres) and the rewrite at `localhost:3301` (dev) /
`127.0.0.1:3302` (production build, `node .next/standalone/server.js`). Tesseract is the shared
remote API, so cold numbers include the same upstream latency on both sides.

## Content parity (`scripts/regression/compare.ts`)

Massachusetts, Suffolk County MA, Boston MA, Harvard University and Restaurants & Food Services at 1440×900 and 390×844 (last full run 2026-10-09 night, both sites in development mode):

| Check | Result |
|---|---|
| Hero text (title, KPIs, senators, growth lines) | Identical on all five reports and both viewports (same SHA-1 of the rendered text). |
| Sections | All legacy section ids present; the rewrite adds a `keep-exploring` id for the footer block the legacy site rendered without an id. |
| Charts rendered | Rewrite ≥ legacy on every page (legacy 16–67 SVGs, rewrite 19–88; the extra SVGs are inline icons). |
| Console errors | Legacy: React key warnings and NaN path/transform values on Massachusetts and Suffolk County. Rewrite: the same NaN paths on the same two reports (d3plus 4 logs one message per path), and transient sub-pixel negative bar heights while Harvard's graduation-rate mini chart animates (none once it settles). The earlier map "negative height" errors were a real sizing defect, now fixed (A12 in `migration-gaps.md`). |
| Failed requests | Only `/api/prism/status` 401 (expected when not registered) on the legacy site; the rewrite answers 200 `{gated: true}` instead (a 401 drops HTTP Basic credentials behind the sandbox password); Chromium `ERR_CACHE_WRITE_FAILURE` appeared on two captures because the development machine's disk was nearly full, not because of the site. |
| Phone width | No horizontal overflow on the five reports, home, search or about pages (`probe-overflow.mjs`). |

Variables: 310 of 311 text variables identical to the legacy payload for Massachusetts (the last one
is a neighbour ordering, now sorted the same way); 170/172 generators succeed, the two failures fail
on the legacy site too (A1, A2).

Per-section screenshots for both sites are written to `scripts/regression/out/<site>-<viewport>-<path>/<section>.png`
(each section scrolled 100px below the fixed header, charts in view awaited, viewport-sized). Reviewing them on
2026-10-09 caught what the counts had not: the choropleth maps were not drawing at all (A12), the chart column
was 140px narrower than legacy, the phone subnav was white on white, and the nav lacked the report title; all
fixed and re-captured.

## Other report families (`scripts/regression/compare-variables.mjs`)

| Report | Text variables identical | Sections |
|---|---|---|
| Industry: Restaurants & Food Services | 195 / 195 | 22 / 22 |
| Occupation: Registered Nurses | 345 / 345 | 19 / 19 |
| Degree: Computer Science (110701) | 469 / 469 | 29 / 29 |
| University: Harvard University | 431 / 431 | 32 / 32 |
| Product: Research and development services | 30 / 33, plus 694 freight variables the legacy payload lacks (A20 in `migration-gaps.md`) | 5 / 5 |

Each of these pages renders at desktop and phone widths with no console errors and no horizontal
overflow (`probe-page.mjs`).

## Performance

Production build, single process, empty data cache (never-requested geographies):

| Page | Legacy (uncached) | Rewrite first request | Rewrite repeat |
|---|---|---|---|
| New Hampshire (state) | 13.9 s | 10.1 s (TTFB 3 ms, shell streams first) | 0.2 s |
| Montana (state) | — | 10.3 s | 0.2 s |
| Juneau, AK (county) | — | 7.3 s | 0.4 s |
| Cambridge, MA (place) | — | 3.3 s | 0.3 s |
| Worcester, MA (place) | 14.1 s | 4.5 s (dev) | 0.2 s |
| Home | — | 16 ms (static, revalidated hourly) | — |
| Search (`?q=worcester`) | — | 43 ms | — |

State reports fan out to ~170 Tesseract queries; the first request's time is the slowest upstream
query, not rendering. HTML size for Massachusetts: 362 KB (legacy 1.36 MB), with only the variables
each chart uses shipped to the client.

Cold start of the production server: ready to serve in 0.5 s after `node server.js`; the first report
request needs no warm-up (there is no pre-generation step). The data cache is per process (a restart
refetches; Montana took 2.3 s after a restart because the upstream API had the queries warm).

Build: `next build` compiles in ~6 s plus TypeScript; total `npm run build` (including the SQLite
dimensions build) under two minutes, independent of the number of reports.

## HTTP behaviour (production build)

| URL | Status |
|---|---|
| `/profile/geo/massachusetts` | 200, full HTML with title, hero and narrative server-rendered |
| `/profile/geo/04000US25` (raw id) | 308 → `/profile/geo/massachusetts` |
| `/profile/sctg/01` (crosswalk) | 308 → `/profile/napcs/67101` |
| `/profile/geo/nope`, unknown embed topic, unknown classification | 404 with the site's not-found page |
| `/about`, `/about/classifications` | 308 to their first tab |
| `/sitemap/0.xml`…`/sitemap/8.xml` | 200, 8 static URLs + 47,690 report URLs in 5,000-URL parts |

## How to re-run

```bash
npx tsx scripts/regression/compare.ts /profile/geo/massachusetts /profile/geo/suffolk-county-ma /profile/geo/boston-ma
node scripts/regression/probe-page.mjs http://localhost:3301/ home            # errors, overflow, screenshots
node scripts/regression/probe-overflow.mjs http://localhost:3301/profile/geo/boston-ma 390
node scripts/regression/probe-d3plus-warnings.mjs http://localhost:3301/profile/geo/massachusetts
node scripts/regression/probe-section.mjs http://localhost:3301 /profile/geo/massachusetts demographics desktop out.png   # one section: chart boxes + viewport screenshot
SCROLL_TO="#demographics" node scripts/regression/probe-dom.mjs http://localhost:3301 /profile/geo/massachusetts "#population_by_location svg > g"   # element boxes
node scripts/regression/probe-geomap.mjs http://localhost:3301 /profile/geo/massachusetts "#population_by_location"   # one chart island's d3plus state (groups, fills, negative heights)
npx esbuild scripts/regression/harness/geomap.ts --bundle --format=iife --alias:@=./src --define:TESSERACT='"https://api-ohio.datausa.io/"' --outfile=public/_harness/geomap.js
node scripts/regression/harness/probe.mjs "" "omit=shapeConfig" "cfgomit=time"   # d3plus outside React (served at /_harness/): bisect theme and config keys
```
