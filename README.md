# Data USA — site rewrite (2026)

Next.js 16 rewrite of [datausa.io](https://datausa.io): the report pages, home, search and about
pages, served from a single Node process with no CMS database and no page pre-generation.
Editorial content, report definitions and chart logic live in this repository as TypeScript
(`src/content`); numbers come from the Tesseract and geoservice APIs at request time and are cached
in-process.

- `docs/architecture.md` — how a report URL is served, the content model, caching and the decisions log.
- `docs/discovery.md` — inventory of the legacy Canon CMS site this replaces.
- `docs/migration-gaps.md` — open gaps and accepted differences from the legacy site.
- `docs/deployment.md` — PM2 + Nginx deployment, environment variables, cache purging, cutover.

## Requirements

Node.js 24 (`.nvmrc`), npm. Nothing else: the dimensions database is SQLite through Node's built-in
`node:sqlite`.

## Development

```bash
npm ci
cp .env.example .env.local         # fill in the values described in the file
npm run build:dimensions           # data/*.jsonl -> data/dimensions.sqlite (seconds)
npm run dev                        # http://localhost:3301
```

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run typecheck` / `npm run lint` | TypeScript strict mode and ESLint. |
| `npm run build` | Production build (standalone output); runs `build:dimensions` first. |
| `npm run extract:legacy -- --profile geo` | One-time conversion of CMS content from the legacy database into `src/content/reports/*` (needs `.env.migration.local`, read-only). |
| `npm run export:dimensions` | Export search/dimension members from the legacy database to `data/*.jsonl`. |
| `npx tsx scripts/regression/compare.ts /profile/geo/massachusetts …` | Legacy (`:3300`) vs new (`:3301`) comparison: console errors, failed requests, chart counts, hero text, full-page and per-section screenshots in `scripts/regression/out/`. |
| `node scripts/regression/probe-page.mjs <url> <name>` | Headless check of one page at desktop and phone widths (errors, overflow, screenshots). |
| `node scripts/regression/probe-d3plus-warnings.mjs <url>` | Audit of CMS chart configs against the installed d3plus version. |
| `scripts/school-districts/build.sh` | Rebuilds the school district shapes (`public/topojson/SchoolDistrict_<state>.json`) and member list (`data/school-districts.jsonl`) from the Census Bureau's cartographic boundary files (2024 vintage). Run `npm run build:dimensions` afterwards. |
| `scripts/topojson/build.sh puma\|districts` | Rebuilds `public/topojson/PUMA.json` (2020 PUMAs) or `Districts.json` (119th Congress) from the Census Bureau's cartographic boundary files (downloads the file, checks its SHA-256, simplifies with a pinned `mapshaper` through `npx`). |
| `scripts/regression/probe-{section,dom,geomap}.mjs`, `scripts/regression/harness/` | Section, element and chart-island probes, and a stand-alone d3plus page (built with esbuild into `public/_harness/`) for bisecting theme/config interactions; see `docs/regression.md`. |

## Layout

```
src/app            routes (reports, embeds, home, search, about, API routes, sitemaps, robots)
src/components     server components for report sections; client islands for charts, selectors, search
src/content        formatters, converted CMS content per report family (sections, generators, visualizations)
src/lib            report engine, API clients, dimensions database, template swapping, chart theme
scripts            legacy export/conversion, dimensions build, regression tooling, packaging
data               versioned dimension export (JSONL); the SQLite file is built from it
docs               discovery, architecture, gaps, deployment
```
