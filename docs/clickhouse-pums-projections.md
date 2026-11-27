# ClickHouse indexes and projections for `pums_5`

Tesseract's `pums_5` cube reads `datausa_db.pums_inline_condensed_5` in ClickHouse. The table holds 146.8 M rows (8.9 GiB) and is sorted by `(year, puma, pums_soc_id)`, with no partition key.

The sort order doesn't match the columns Tesseract filters on, so until 2026-11-04 almost every `pums_5` query read the whole table: about 160 M rows, 1.7–2.7 GB.

Measured effects of that:
- **A request ceiling.** Tesseract runs a second `COUNT(*)` query for each request, and "latest year" scans the data again. At the server's ~10 GB/s, that capped `pums_5` at about 2 requests per second.
- **Time.** `pums_5` took 45% of Tesseract time during cache warms while making up 7% of requests.

The fix is a few skip indexes and projections. They live in the table, so Tesseract's cube, its SQL, the generators and the site don't change. ClickHouse picks them automatically for each query (`optimize_use_projections = 1`, the default on 26.2).

## Summary

| Name | Kind | Serves | Status |
|---|---|---|---|
| `ix_puma_id` | `minmax` skip index on `puma_puma_id` | Geo profiles filtered by PUMA | **Applied 2026-11-04** |
| `ix_state_id` | `minmax` skip index on `puma_state_id` | Geo profiles filtered by state (also a county's or place's parent state) | **Applied 2026-11-04** |
| `p_fod1p` | Projection, full copy sorted by field of study | University and CIP profiles (CIP2 lookups, majors) | **Applied 2026-11-04** |
| `p_soc` | Projection, full copy sorted by the occupation hierarchy | SOC profiles at all four levels | Proposed, not tested |
| `p_naics` | Projection, full copy sorted by the industry hierarchy | NAICS profiles at all three levels | Proposed, not tested |

Share of `pums_5` time each one addresses, from the 3 November quarter warm (36.4 request-hours of `pums_5` in total):

| Group | Profiles | Share |
|---|---|---|
| Indexes | Geo | 34% |
| `p_fod1p` | University and CIP | 34% |
| `p_soc` and `p_naics` | SOC and NAICS | 32% |

## Applied (2026-11-04)

```sql
USE datausa_db;

-- Geography. `puma_puma_id` holds the same values as `puma` (`79500US0100100`), and `puma_state_id`
-- (`04000US01`) is its state part. The table is already sorted by `puma` within each year, so
-- minmax ranges per granule are tight and a PUMA or state filter skips almost the whole table.
ALTER TABLE pums_inline_condensed_5 ADD INDEX ix_puma_id puma_puma_id TYPE minmax GRANULARITY 1;
ALTER TABLE pums_inline_condensed_5 ADD INDEX ix_state_id puma_state_id TYPE minmax GRANULARITY 1;
ALTER TABLE pums_inline_condensed_5 MATERIALIZE INDEX ix_puma_id;
ALTER TABLE pums_inline_condensed_5 MATERIALIZE INDEX ix_state_id;

-- Field of study. Tesseract filters with `fod1p IN (SELECT fod1p FROM pums_dims_fod1p WHERE cip2 IN (...))`
-- and joins to `pums_dims_fod1p` for CIP2. A full copy sorted by fod1p lets ClickHouse read only those
-- fields' rows; SELECT * keeps every column, so any query shape can use it.
ALTER TABLE pums_inline_condensed_5 ADD PROJECTION p_fod1p (SELECT * ORDER BY fod1p, year);
ALTER TABLE pums_inline_condensed_5 MATERIALIZE PROJECTION p_fod1p;
```

### Measured
**Indexes.** Tesseract's own SQL for birthplace in one PUMA, latest year, on an idle server:

| | Elapsed | Rows read | Data read |
|---|---|---|---|
| Without the index | 0.261 s | 160.7 M | 2.73 GB |
| With `ix_puma_id` | 0.069 s | 0.24 M | 4.5 MB |

**`p_fod1p`.** Tesseract's own SQL for CIP2 × Detailed Occupation for five CIP2 codes (a university lookup), latest year, on an idle server:

| | Elapsed | Rows read | Data read |
|---|---|---|---|
| Without the projection | 395 ms | 160.7 M | 1.73 GiB |
| With `p_fod1p` | 157 ms | 7.6 M | 98 MiB |

`system.query_log.projections` showed `p_fod1p`.

**Warm of 60 universities against a fresh Tesseract, same plan, before and after:**

| | Before | After |
|---|---|---|
| Wall time | 184 s | 88 s |
| `pums_5` median | 11.1 s | 1.1 s |
| `pums_5` p95 | 14.4 s | 3.7 s |
| `pums_5` request time | 1,194 s | 162 s |
| Cached generator outputs | | 3,500 of 3,500 identical |

## Proposed: SOC and NAICS

The occupation and industry levels are stored as columns of the fact table, from the generic ID down:

| Level | Column |
|---|---|
| Major Occupation Group | `pums_soc_great_grandparent` |
| Minor Occupation Group | `pums_soc_grandparent` |
| Broad Occupation | `pums_soc_parent` |
| Detailed Occupation | `pums_soc_id` |
| Industry Sector | `pums_naics_grandparent` |
| Industry Sub-Sector | `pums_naics_parent` |
| Industry Group | `pums_naics_id` |

**Why one projection per hierarchy is enough:**
- Sorting by the hierarchy from the top puts each member's rows together at every level.
- The top levels have few distinct values (6 major groups, 13 sectors). So a filter on any one level column can still skip most granules, through ClickHouse's generic exclusion search over the sort key, as the `fod1p` filter did.

```sql
USE datausa_db;

ALTER TABLE pums_inline_condensed_5 ADD PROJECTION p_soc (
  SELECT * ORDER BY pums_soc_great_grandparent, pums_soc_grandparent, pums_soc_parent, pums_soc_id, year
);
ALTER TABLE pums_inline_condensed_5 MATERIALIZE PROJECTION p_soc;

ALTER TABLE pums_inline_condensed_5 ADD PROJECTION p_naics (
  SELECT * ORDER BY pums_naics_grandparent, pums_naics_parent, pums_naics_id, year
);
ALTER TABLE pums_inline_condensed_5 MATERIALIZE PROJECTION p_naics;
```

**Check before applying.** The column names above come from the table definition. Confirm Tesseract filters on these columns, and not on the raw `socp` and `naicsp`, using a SOC and a NAICS query from the log:
```sql
SELECT substring(query, 1, 1500) FROM system.query_log
WHERE type = 'QueryFinish' AND event_date >= today() - 7
  AND query ILIKE '%pums_inline_condensed_5%' AND (query ILIKE '%pums_soc_parent%' OR query ILIKE '%pums_naics_parent%')
  AND query NOT ILIKE '%COUNT(*)%'
LIMIT 2 FORMAT Vertical;
```
If the filters use `socp` or `naicsp`, sort the projection by those columns instead.

## Test procedure (any new projection)
1. **Copy the table without rewriting data.** Hard links make this instant, with no extra disk until the tables diverge:
   ```sql
   CREATE TABLE datausa_db.pums5_test AS datausa_db.pums_inline_condensed_5;
   ALTER TABLE datausa_db.pums5_test ATTACH PARTITION tuple() FROM datausa_db.pums_inline_condensed_5;
   ```
2. **Add and build the projection on the copy.** Wait until this returns no rows:
   ```sql
   SELECT command, parts_to_do, latest_fail_reason FROM system.mutations WHERE table = 'pums5_test' AND NOT is_done;
   ```
3. **Check the plan:** `EXPLAIN indexes = 1 SELECT sum(pwgtp) FROM pums5_test WHERE <level column> IN (<a few ids>);`
   - The read step must be `ReadFromMergeTree (<projection>)`, with a small share of granules.
   - If part of the read is still on the base table, the build isn't finished.
4. **Run Tesseract's SQL from `system.query_log`** against both tables, with these edits:
   - change ` FORMAT Native` to ` FORMAT Null`;
   - remove the `IN (SELECT … FROM nativity)` and `IN (SELECT … FROM dim_inline_time)` clauses. Those are Tesseract inline tables sent with each query, so they don't exist in the client.

   Run `USE datausa_db;` first, and `SYSTEM DROP QUERY CACHE;` before each run, since Tesseract's SQL sets `use_query_cache=true`.
5. **Compare.**
   ```sql
   SYSTEM FLUSH LOGS;
   SELECT query_duration_ms, read_rows, formatReadableSize(read_bytes), projections FROM system.query_log
   WHERE type = 'QueryFinish' AND query LIKE '%qb_from%' AND event_time > now() - INTERVAL 10 MINUTE
   ORDER BY event_time DESC LIMIT 2;
   ```
6. **Drop the copy:** `DROP TABLE datausa_db.pums5_test;`

## Cost
- **Disk.** Each `SELECT *` projection is a full sorted copy: about 8.8 GiB compressed, measured for `p_fod1p`.
  - Three projections plus the table come to about 35 GiB.
  - On 2026-11-04 there was 178 GiB free.
  - Skip indexes are a few MB.
- **Build time.** About 7 minutes per projection on penn: 395 s for the two large parts of `p_fod1p`. Indexes take about a minute. Reads keep working during a build, using the base table for parts not built yet.
- **Data releases.** Each insert also writes every projection, so loading `pums_5` takes longer, roughly once more per projection.

## Data releases: keep them in the table definition
`ALTER TABLE … ADD INDEX / ADD PROJECTION` stays in effect for later inserts into the same table. But if the release process drops and recreates `pums_inline_condensed_5`, or swaps in a table built from `pums_inline_condensed_5_staging`, the indexes and projections disappear silently. Queries still work, just slowly again.

To avoid that, either:
- add them to the `CREATE TABLE` the release uses:
  ```sql
  INDEX ix_puma_id puma_puma_id TYPE minmax GRANULARITY 1,
  INDEX ix_state_id puma_state_id TYPE minmax GRANULARITY 1,
  PROJECTION p_fod1p (SELECT * ORDER BY fod1p, year),
  PROJECTION p_soc (SELECT * ORDER BY pums_soc_great_grandparent, pums_soc_grandparent, pums_soc_parent, pums_soc_id, year),
  PROJECTION p_naics (SELECT * ORDER BY pums_naics_grandparent, pums_naics_parent, pums_naics_id, year)
  ```
- or run the `ALTER … ADD … / MATERIALIZE …` statements as a release step.

**Check after each release:**
```sql
SELECT name, type FROM system.data_skipping_indices WHERE table = 'pums_inline_condensed_5';
SELECT name FROM system.projections WHERE table = 'pums_inline_condensed_5';
```

## Rollback
Each one can be removed on its own. Queries go back to reading the base table.
```sql
ALTER TABLE datausa_db.pums_inline_condensed_5 DROP PROJECTION p_fod1p;   -- also p_soc, p_naics
ALTER TABLE datausa_db.pums_inline_condensed_5 DROP INDEX ix_puma_id;      -- also ix_state_id
```

## Not covered here
These are Tesseract changes:
- **The extra `COUNT(*)` per request.** Tesseract computes `page.total` with a second query that repeats the whole aggregation.
- **"Latest year" scans twice.** `time=Year.latest` is a `year IN (SELECT DISTINCT year FROM qb_from …)` over the same inlined CTE, so the data is read twice.

The indexes and projections make each of these scans cheap, but they still happen. Removing them would roughly halve ClickHouse work for every cube, not just `pums_5`.
