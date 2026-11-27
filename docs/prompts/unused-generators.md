# Find generators whose output no page shows

## Goal
Find every generator, and every generator output, that no published page uses today. For each one,
recommend whether to remove the generator, trim its output, or keep it.

Every unused generator still costs us three things on each report:
- a Tesseract request: on the cache warm, and on every cache miss;
- render time;
- space in the Redis cache, which the site reads on every page view.

This is an **analysis only**. Do not edit generators, materializers, sections or visualizations, and
do not commit anything. The deliverable is the report described at the end; the team decides on the
changes afterwards.

## Context
- **Repository:** the Data USA site rewrite. Work in the worktree
  `.claude/worktrees/agent-a9a511887625c35ab` (branch `se/rewrite-cache-strategy`). Read `AGENTS.md`
  first: this Next.js version differs from what you may know.
- **Report content:** per profile in `src/content/reports/<profile>/`, where profile is one of geo,
  cip, soc, naics, napcs, university. Each profile has:
  - `generators/<id>-<name>.ts`: an `api` URL and a `logic(resp, {libs, formatters, variables})`
    function that returns an object of **outputs** (variables);
  - `materializers/`: functions that derive more variables from `variables`;
  - `sections.ts`: the text, with variables written as `{{name}}`, plus `allowed` visibility rules;
  - `visualizations/` and `visualizations/manifest.ts`: the charts. Each manifest entry declares
    `usedVariables`, `usedVariablePrefixes`, `usedVariableTemplates` and its own `allowed`;
  - `selectors.ts`: the dropdowns whose current value is substituted into names written as
    `[[selector-id]]`;
  - `attributes.ts` and `profile.ts`: the member's attributes, the hero and the title.
- **The engine** (how variables flow from generators to pages): `src/lib/reports/` (start with
  `engine.ts`, `generator-run.ts`, `load.ts`).

### A worked example: generator 682 (found on 2026-11-06)
`src/content/reports/soc/generators/682-occupations.ts` returns `listOccupations`, the national list
of every detailed occupation. That's 243 KB per occupation report and 154 MB of Redis across the
648 occupations, and it costs one `pums_5` request per report.

Why it's unused, established three ways:
1. **References.** `listOccupations` is read only by `soc/materializers/02-37-neighbors.ts:34`, to
   build `categoriesSameLevel`. Nothing references `categoriesSameLevel`: no section text, no
   visualization, nothing else in the repo.
2. **A column-name mismatch.** The materializer filters on `ID Broad Occupation`, but Tesseract
   returns `Broad Occupation ID`. So the list would be empty even if it were displayed.
3. **The rendered pages.** None of software developers' 15 sibling occupations from 682's data
   appears on the page, as a name or as a link, on datausa.io or on the new site.

The analysis should catch both kinds of problem this example shows: an output nothing reads, and an
output read in a way that can never produce anything (wrong column names, filters that never match).

## Method

### 1. Static analysis: who reads what
For every generator, list the keys it can return.
- **Literal keys:** read them from the returned object.
- **Built keys,** for example `` `incomeRace${id}Child${i}Name` ``: record them as a pattern
  (`incomeRace*Child*Name`).
- **Keys from a loop or a spread:** mark them as "dynamic", and settle them in step 2.

Then find every consumer of each key:
- **Section text and attributes** (`title`, `subtitle`, `text`, `value`, `allowed`…): `{{key}}`, and
  names built from selectors, such as `freight[[trade-flow-trade_growth]]2Growth`. Expand each
  `[[selector]]` to all of its option values from `selectors.ts` to get the concrete names.
- **Visualizations:** `usedVariables`, `usedVariablePrefixes` and `usedVariableTemplates` in each
  `manifest.ts`. Check a sample of manifest entries against the chart code to make sure the
  manifest is complete.
- **Materializers:** what they read from `variables`, and then, transitively, whether their own
  outputs are used. An output read only by a materializer whose results are unused is itself unused.
- **Other generators:** a generator's `logic` and `api` can read `variables` (for example
  `incomeDrilldown`) or `attrs`.
- **The engine and the page shell:** hero, title, metadata and search may read variables directly.
  Search `src/lib` and `src/app` for those reads.

**Content that is never shown counts as unused.** That means `allowed: "neverShow"` on a section or a
visualization, or an `allowed` rule that can't be true for any member of the profile. A variable
read only by such content is effectively unused. Report it separately ("used only by hidden
content"), because the team may want to keep it for content that is about to be re-enabled.

Classify each generator:
- **Unused:** no output is read by any visible consumer.
- **Partly used:** some outputs are unused. List them, with their share of the output's size if it's
  large.
- **Read but empty:** read, but in a way that can never produce anything, like 682.
- **Used.**

### 2. Runtime check: which variables a real render reads
Static analysis misses names computed at runtime, so confirm with real renders.
1. **Write a harness in the session's scratchpad, not in the repo.** It renders reports with the real
   engine, and wraps the `variables` object passed to sections, materializers and visualization
   configs in a `Proxy` that records every key read. Ask the team for the script they used on 2026-11-06 (`fresh-render.ts`), which shows how to call
   `loadEngine` and `prepareReport`
   outside Next.js (with `withWarm` as a pass-through scope).
2. **Render a sample:** at least 3 members of every level of every profile (Nation, State, County,
   MSA, PUMA, Congressional District, Place; CIP2/4/6; the four SOC levels; the three NAICS levels;
   the three NAPCS levels; University, Carnegie, Carnegie Parent). Use
   `NEXT_PUBLIC_TESSERACT_URL=https://api-penn.datausa.io/`, never the production API.
3. **Exercise the selectors:** render each selector option at least once, so that names built from
   `[[selector]]` are read.
4. **Compare:** a key the static analysis calls used, but that no render ever reads, needs a look,
   and so does the reverse.

### 3. Spot-check the pages
For every generator you classify as unused or "read but empty", confirm on one or two real pages:
look for the values its output would put on the page, on datausa.io and on the new site, as in the
682 example. That's the only way to catch a reference you missed. Keep it to about 30 datausa.io
page fetches in total, one at a time.

### 4. What each one costs
For each unused or partly used generator, report:
- **Tesseract:** the cube it queries, and the median and total request time during the 3 November
  quarter warm. Ask the team for the logs of that run (its `batched-warm/quarter/` folder): `logical-w*.jsonl` maps URLs to generator ids (`gens`), and
  `upstream.jsonl` has each request's time (`ms`).
- **Cache size:** average bytes per report and total in Redis. If you can't reach a fully warmed Redis, write the commands for the user to run, like those used for the
  occupation generators on 2026-11-06 (`redis-cli --scan --pattern 'gen:*'`, filter by generator
  id, `STRLEN`).

## Rules
- **Read-only** in the repository. Harness scripts and outputs go in the session's scratchpad.
- **Never load production Tesseract** (`api.datausa.io`). Renders go to api-penn.datausa.io;
  datausa.io page fetches are limited to the spot checks.
- **No commits, no Co-Authored-By trailers.**
- **Be careful with "unused."** Say how each classification was established (static, runtime, page
  check), and mark anything only one method supports as "likely". A wrong "unused" deletes content
  from the site.

## Deliverables
1. **A spreadsheet,** one row per generator that isn't fully used. Columns:
   - generator id, profile, name, file;
   - classification;
   - unused outputs;
   - who reads the rest;
   - evidence (static, runtime, page);
   - Tesseract cube and request time;
   - cache size;
   - recommendation: remove, trim to the listed outputs, fix the read, or keep (hidden content).

   Add a summary tab with the totals per profile: generators that could go, Tesseract request time
   saved per full warm, and Redis space saved.
2. **A short summary in Markdown:**
   - the method;
   - the totals;
   - the 10 changes with the most effect (time and space);
   - anything uncertain.
3. **The harness script,** kept in the scratchpad so the runtime check can be repeated after content
   changes.

## Why it matters for the cache
A changed generator invalidates only its own keys. A removed generator's keys are just never read
again, and expire after 30 days. So each recommendation here can ship on its own without a full
re-warm. Note in the report which changes need a one-generator re-warm (trims) and which need none
(removals).
