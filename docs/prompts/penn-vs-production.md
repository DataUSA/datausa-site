# Compare penn.datausa.io with datausa.io

## Goal
`penn.datausa.io` is the rewrite of Data USA that will replace `datausa.io`. Before the switch, find
every place where a report on penn differs from the same report on production, and say what to do
about each one.

Three kinds of difference matter:

1. **Data.** The figures and facts on a page must be the same on both sites. When they differ,
   decide which site is right and, if it's penn that's wrong, find the cause in the code. When penn
   is the one that's right (production has a bug penn fixed), still report it, marked "penn
   correct".
2. **Cosmetic.** Anything a visitor would see as different: a missing or broken image, sections or
   paragraphs in a different order, missing or extra sections, different headings or wording,
   broken links, layout problems.
3. **Visualizations.** A chart that doesn't load on penn, shows an error or an empty frame, uses
   different colors, or renders differently (axes, labels, legends, tooltips, sizing) from
   production.

The result is a spreadsheet: one row per issue, with a snapshot of the difference, a link to the
section on each site, and a suggested action.

## This is a read-only review
**Report what you find. Don't fix anything.** In particular:
- **Don't edit any file in the repository**, not even to try a fix. Write the fix you'd suggest in
  the "Suggested action" column instead.
- **Don't make a checkout:** no `git clone`, no `git checkout`, no branches, no commits, no pull
  requests. Read the code on GitHub (in the browser, or with read-only `gh api` calls), or in a copy
  the team gives you, without changing it.
- **Don't install, build or run the project:** no `npm ci`, no `npm run dev` or any other script,
  no local copy of the site.
- **Don't touch the servers:** no SSH, no cache purges, no deploys, no calls to `/api/revalidate`
  or any other endpoint that changes something.
- **Only read from the sites and APIs:** load pages in a browser, and send `GET` requests to the
  data APIs.

Tools you may use: a browser (Playwright or similar) for the pages and screenshots, `curl` for API
`GET` requests, and whatever you need to build the spreadsheet in your own working folder, outside
the repository.

## Setup

### The two sites
| | Production | Penn (the rewrite) |
|---|---|---|
| Site | https://datausa.io | https://penn.datausa.io |
| Data API (Tesseract) | https://api.datausa.io | https://api-penn.datausa.io |
| Report URL | `/profile/<profile>/<slug>` | the same |
| Section link | `/profile/<profile>/<slug>#<section-slug>` | the same slugs; penn also anchors each chart by its numeric id |

Profiles: `geo`, `university`, `cip` (majors), `soc` (occupations), `naics` (industries), `napcs`
(products).

### The code
- **Repository:** https://github.com/DataUSA/datausa-site, branch `se/rewrite-cache-strategy`. Penn
  runs commit `f0fc0fe1` or later; ask the team which commit is deployed if it matters. Read it on
  GitHub, without checking it out (see above). Quote code as a GitHub link to the file and line, or
  as `path:line`.
- **Read `AGENTS.md` first.** This Next.js version differs from what you may know.
- **Where report content lives**, per profile in `src/content/reports/<profile>/`:
  - `generators/<id>-<name>.ts`: each fetches data (an `api` URL) and returns variables;
  - `materializers/`: derive more variables from those;
  - `sections.ts`: the text, with variables as `{{name}}`, and the `allowed` rules that decide
    whether a section shows;
  - `visualizations/<id>-<name>.ts` and `visualizations/manifest.ts`: the charts;
  - `selectors.ts`: the dropdowns.
- **The engine:** `src/lib/reports/`. **Chart rendering:** `src/lib/viz/`, which includes a
  compatibility layer for the d3plus charts (`d3plus-compat.ts`) and the theme and colors
  (`theme.ts`).
- **How a page is built:** penn renders each report on the server from generator outputs, most of
  them read from a Redis cache that was filled on 2026-11-06. Charts are drawn in the browser, and
  they query Tesseract directly. The cache is explained in `docs/architecture.md`, "Caching and
  invalidation".

### Telling a code bug from stale cached data
You can't render the site yourself, so use the APIs instead. A cached value on penn was computed on
2026-11-06 from `api-penn.datausa.io`. If the generator's query on `api-penn` now returns data that
would give a different figure than the page shows, the page may be showing stale cached data:
report it as "possibly stale cache", with the API response as evidence, and let the team confirm.

## What to compare

### Sample
The review is meant to run unattended over a weekend (about 48–60 hours). The site has about
47,000 reports; compare about **700**, chosen so every level is well covered:

- **Every report of the small levels (about 220):**
  - geo: the Nation, all 56 states and territories;
  - cip: all 38 CIP2 fields;
  - soc: all 6 Major, 16 Minor and 11 Broad Occupation Groups;
  - naics: all 13 Sectors and 13 Sub-Sectors;
  - napcs: all 23 Sections;
  - university: all 34 Carnegie classes and 8 Carnegie Parents.
- **35 reports from each large level (about 420):** the 10 largest (the first 10 on penn's search
  page for that level, which ranks by size), plus 25 at random. The large levels are:
  - geo: County, MSA, PUMA, Congressional District, Place;
  - cip: CIP4, CIP6;
  - soc: Detailed Occupation;
  - naics: Industry Group;
  - napcs: Group, Class;
  - university: University.
- **Popular reports:** the United States, California, Texas, New York, Florida, Los Angeles County,
  Cook County, Harris County, New York City, Chicago, Harvard University, the University of
  Michigan, software developers, registered nurses, cashiers, hospitals, restaurants, computer
  science, nursing, business administration.
- **Edge cases:**
  - every territory (Puerto Rico, the Virgin Islands, Guam, the Northern Mariana Islands, American
    Samoa) at every geo level that has them;
  - the 10 smallest places and counties;
  - MSAs and PUMAs that span several states, or sit on a state border;
  - universities with little data (small certificate schools), and online universities;
  - occupations and industries with very few workers.

Penn's search page lists the members of each level:
`https://penn.datausa.io/search?dimension=<dimension>&hierarchy=<level>` (for example
`?dimension=Geography&hierarchy=County`). When an issue looks specific to a level, add reports from
that level until you know how far it reaches, and say so in the row.

### Running for a whole weekend
- **Two passes.**
  1. **The quick pass,** over all ~700 reports: text, figures, sections and their order, images,
     and whether each chart draws. That's about 1–2 minutes per report on both sites.
  2. **The deep pass,** over the reports and sections where the first pass found something, plus
     the popular reports: chart screenshots and colors, every selector option, phone width, and
     the data checks against both APIs ("Deciding which site is right").

  This way an interruption still leaves complete coverage of the basics.
- **Save as you go.** Write each report's result to disk as soon as it's done (for example one JSON
  file per report), and keep a progress log with the count done, the issues found and the time.
  Rebuild the spreadsheet from those files every few hours, so a usable spreadsheet always exists.
- **Resume, don't restart.** If the run stops, start again from the reports not yet done.
- **Slow down when production does.** If datausa.io starts answering slowly or with errors (429 or
  5xx), wait several minutes and halve your pace. Never retry in a tight loop.
- **If time runs short,** finish the quick pass first, then the deep pass for the high-severity
  issues and the popular reports. Say in the write-up what was left out.

**School districts are left out on purpose.** Penn marks them as a pending level (not indexed, no
sitemap); production doesn't have them.

### Method, per report
Use a real browser (Playwright, or similar) on both sites. Charts are drawn by JavaScript, so
fetching the HTML is not enough.
1. Load the report on both sites at the same window size (1440 × 900; in the deep pass, also a phone width such as
   390 × 844). Wait until the charts have finished drawing: no loading spinner,
   and the chart's SVG or canvas is present. Allow up to about 20 s.
2. **Match sections and topics** by their slug and heading, not by their position on the page.
   Report a difference in order as a cosmetic issue.
3. **Text and figures:** compare each topic's title, paragraphs, stat titles, values and
   subtitles. Normalize whitespace first. Treat a different number, year, name or ranking as a
   data difference.
4. **Images:** check that every image loads (report photos, icons, logos), and look for broken
   images and alt text shown in their place.
5. **Charts:** screenshot each chart on both sites, and compare:
   - whether it draws;
   - its type, colors, axes, labels, legend and tooltip;
   - the console errors on penn.

   Note "no data" or "error" states. The browser console of each page shows failed requests and
   errors.
6. **Selectors:** for sections with a dropdown, try at least two options on both sites.
7. **Links:** spot-check that links in text (to related profiles) go to the same place.

Be polite to production: one page at a time, a few seconds apart, and an identifying user agent.
Don't run load against `api.datausa.io`.

### Deciding which site is right (data differences)
For each data difference:
1. **Find the generator** that produces the value: search `sections.ts` for the topic's text to
   find the `{{variable}}`, then the generator (or materializer) that returns it.
2. **Run its query on both APIs.** Take the generator's `api` URL, fill in the report's member, and
   request it once from `api-penn.datausa.io` and once from `api.datausa.io`.
   - The same data from both means the difference is in the logic (penn's code, or a production
     bug).
   - Different data means the two Tesseract servers carry different data. Report which data
     release each one has, if you can tell (the latest year, the totals).
3. **Check the logic** in the generator, the materializer and `src/lib/content/libs.ts` (penn's
   versions of the d3 and d3plus helpers the content uses).
4. **Check against the source** when it's unclear: the official figure (Census, BLS, IPEDS…),
   or simple arithmetic (shares that don't add up to 100, a growth rate that doesn't match the
   two values shown).
5. **Mark the verdict:** penn wrong, penn correct, or unclear. Add a one-line reason.

### Already known: report them, but mark them as known
These were found on 2026-11-06. Include them when you see them, with the reference, so the
spreadsheet is complete. Don't spend time re-diagnosing them.
- **Presidential vote shares** for areas spanning several states (for example the New York MSA:
  "Robert Kennedy (NaNN%)", "Kamala Harris (157%)") and for Puerto Rico. Cause: penn's `merge` in
  `src/lib/content/libs.ts:28` collapses equal numbers instead of summing them, and keeps nulls.
  Penn wrong.
- **The parent state of areas that span several states** differs (Toledo PUMA: Ohio on penn,
  Michigan on production). This changes the patient-to-clinician, unemployment-claims and
  employment-by-industry topics. Penn looks correct; it's pending a decision.
- **"Residents by Gender and Age"**: production says "The resident population of United States…" on
  state and PUMA pages, where penn names the place. Penn correct.
- **Generators that always fail at some levels:**
  - county health rankings outside counties;
  - PUMS figures at county, place and MSA level;
  - IPEDS figures at congressional districts;
  - the electoral-votes generator (127) everywhere.

  Sections built on them are hidden. Compare whether production hides the same sections; if
  production shows something penn hides, that's a real finding.
- **NaN or Infinity** in some text (divisions by zero in generators). Report the ones you see.
- **Report photos** may 404 on penn if the photo folder isn't mounted on the server; check that
  first if all photos are missing.

## Deliverables

### 1. The spreadsheet
One row per issue. **Merge repeats:** if the same issue appears in many reports, write one row with
the count and two or three example links, not one row per report.

| Column | Content |
|---|---|
| ID | `DIFF-001`… |
| Category | Data / Cosmetic / Visualization |
| Severity | High (wrong data, or a broken section or chart a visitor would notice) / Medium / Low (minor cosmetic) |
| Profile, level | e.g. geo, County |
| Report(s) | name, and the count of reports affected in the sample |
| Section | section slug and heading |
| Production link | `https://datausa.io/profile/...#section` |
| Penn link | `https://penn.datausa.io/profile/...#section` |
| Production snapshot | the text, or a screenshot embedded in the cell |
| Penn snapshot | the same, for penn |
| Verdict (data only) | penn wrong / penn correct / unclear, with a one-line reason |
| Cause | what causes it, with `file:line` in the repository when found |
| Suggested action | what to change, and where |
| Known? | the reference, if it's on the known list above |

- **Screenshots:** crop each one to the section or chart. Embed them in the cells, and also save
  them as PNG files in an `images/` folder next to the spreadsheet, named by issue id
  (`DIFF-001-prod.png`, `DIFF-001-penn.png`). Image size in a spreadsheet adds up quickly, so keep
  the embedded ones small (about 400 px wide).
- **Tabs:** a **Summary** tab with the counts by category, severity and verdict; a **Reports** tab
  listing every report compared, with links to both sites and the number of issues in each.
- **Format:** an Excel file that imports cleanly into Google Sheets.

### 2. A short write-up
- The 10 issues that matter most for the switch.
- Patterns: an issue that affects a whole level or profile, or that one fix would solve in many
  places.
- What you couldn't check, and why.

## Rules
- **Read-only, everywhere** (see "This is a read-only review" above): no repository edits, no
  checkout, no running the project, no server access. Causes are found by reading the code and the
  API responses. Fixes are only described, in the "Suggested action" column, never applied or
  tried.
- **Production:** one page at a time, a few seconds apart. Direct queries to `api.datausa.io` only
  for the data checks: one at a time, at least 2 seconds apart, at most about 500 over the whole
  run, and never the same query twice. Save every API response you fetch and reuse it.
- **Every verdict and cause needs evidence:** the API responses, the code reference, or the source
  figure. Write "unclear" rather than guess.
