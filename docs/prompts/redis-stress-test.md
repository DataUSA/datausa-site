# Stress test the Redis cache behind penn.datausa.io

## Goal
Find out how the shared Redis cache behaves under heavy traffic, before penn replaces datausa.io:
- **how many report pages a second** the site can serve from the cache;
- **what breaks first,** and how;
- **whether the site degrades gracefully** or falls into a spiral of cache misses.

Then recommend settings or changes so it holds up under production traffic with room to spare.

The work has two parts:
1. **Build the tools:** a "Stress" mode and a "Monitor" panel in the existing warm UI, so a test
   can be started, watched live and stopped from a browser.
2. **Run the tests** with them, and write the report.

Apart from the tools in part 1, **don't change the code or the deployment, and don't change the
cache's contents** (see "Rules").

## How the cache works (what to stress)
Read `docs/architecture.md` ("Caching and invalidation") and `src/lib/cache/redis.ts` first. In
short:
- **One read per page.** Each report page reads all its generator outputs from Redis in one `MGET`:
  13 to 173 keys, about 50–300 KB in total, sometimes more.
- **A read deadline.** That read has a deadline of `REDIS_READ_TIMEOUT_MS` (250 ms on penn) **per 50
  keys**.
- **What happens on a miss.** If the read misses the deadline, or Redis errors, the page treats
  every output as a miss: it **renders the whole report from Tesseract** (`api-penn.datausa.io`),
  2–20 s per report, and stores nothing.
- **The circuit breaker.** After 5 consecutive Redis failures in a worker, it **skips Redis for
  30 s** (`BREAKER_FAILURES`, `BREAKER_COOLDOWN_MS`).

So the failure that matters is a cascade: Redis slows down, reads miss the deadline, pages fall back
to Tesseract, the breaker opens, and Tesseract takes the whole load. **Find the load at which that
starts.**

- **Writes:** a store runs a Lua script that writes the value, its tags (`cube:<name>` sets) and a
  TTL.
- **Persistence:** Redis has AOF on (fsync every second) and RDB snapshots. A snapshot forks the
  process, and with about 9 GB in memory a fork can pause Redis.

### The deployment
| What | Where |
|---|---|
| VM | the penn VM on Google Cloud: 31 GB RAM, no swap. Ask the team for SSH access (the VM name, zone and user are not written here). |
| Site | container `datausa-site-prod`: Next.js under PM2, `PM2_INSTANCES=9` workers, on `127.0.0.1:3301` behind Nginx, public at https://penn.datausa.io |
| Redis | container `datausa-redis` (Redis 7.4), `maxmemory` 20 GB, `volatile-lru`, AOF on; about 6 M keys, 9.3 GB. Not published on the host: reach it with `docker exec datausa-redis redis-cli ...` |
| Data API | https://api-penn.datausa.io (Tesseract on ClickHouse). Pages only call it on a cache miss. |
| Code | https://github.com/DataUSA/datausa-site, branch `se/rewrite-cache-strategy` (penn runs `f0fc0fe1` or later) |

**What already exists:**
- **`scripts/loadtest/run.mjs`:** rising concurrency on *uncached* pages, timing Tesseract on the
  side. Read it for the approach: reading streamed pages to the end, the per-worker sampling. But
  this test needs *cached* pages.
- **Each report page reports its cache use** in its HTML: `data-gen-cache="<hits>/<total>"`.
- **The site's log** has one line per rendered report:
  `[report] geo/texas: 171/173 generators in 0.5 s; cache 171 hit, 2 miss, …, redis 8 ms`, with
  `(unavailable)` when the read failed. Redis failures are logged as `[redis] read took longer than …`.
  Read it with `docker logs datausa-site-prod`.

## Part 1: build the tools into the warm UI
The warm UI (`scripts/cache/warm-ui.ts`, run with `npm run warm:ui`; see `docs/deployment.md`,
"Warm UI") already does most of what a stress test needs:
- it starts a child process and stops it cleanly (the Stop button, SIGTERM, a lock);
- it shows a status page that refreshes on its own;
- it keeps each run's files in a runs folder;
- it shows Redis's size.

Add two things to it.

### The load and the monitoring run on different machines
- **The load generator must not run on penn.** It would compete with the site for CPU and distort
  the result. It runs from the warm UI on another machine, pointed at `https://penn.datausa.io`.
- **The Redis monitor must run on penn,** because penn's Redis isn't reachable from outside.
- You open each through its own SSH tunnel, and watch them side by side.

### A. "Stress" mode (on the load machine)
A new strategy in the UI, run as its own child process (a new script, for example
`scripts/cache/stress.ts`), like the warm.
- **Inputs:**
  - the target site (default `https://penn.datausa.io`);
  - the URL list (built as in "Before starting", step 4, and saved with the run);
  - the stages: rates in pages/s and seconds each, for example `2,5,10,20,40,80,120` × 300 s, with
    a pause between stages;
  - a spike option;
  - the cap on requests in flight;
  - the stop thresholds.
- **The load:** an open model, meaning requests start on schedule whether or not earlier ones have
  finished. It reads each page to the end, like `scripts/loadtest/run.mjs` does.
- **Live, refreshed every few seconds:**
  - pages/s sent and served;
  - page time (p50, p95, p99) and time to first byte;
  - errors, timeouts, and requests in flight;
  - the **cache-hit share**: parse `data-gen-cache="<hits>/<total>"` from each page. A read that
    missed its deadline shows as `0/173`, so this shows the cascade directly, without the
    server's logs;
  - a **Tesseract probe:** one small query to `api-penn.datausa.io` every 10 s, timed;
  - a chart of each over time, and the current stage.
- **Automatic stop** when a stop condition is met (see "The tests"). It records which condition
  stopped it, and when. The Stop button stops it at once, too.
- **Saved in the run's folder:** every request (the time, URL, status, times, bytes, hits/total),
  the stage boundaries, and a summary per stage.

### B. "Monitor" panel (on penn)
A read-only panel, useful during warms as well. It must **never write to Redis**. Every second or
few seconds it reads and shows, as numbers and small charts:
- `INFO`:
  - ops/s, CPU (user and system), `connected_clients`, `blocked_clients`;
  - `used_memory` and fragmentation;
  - keyspace hits and misses, `evicted_keys`, `rejected_connections`;
  - snapshot or AOF rewrite in progress, `latest_fork_usec`, `aof_delayed_fsync`;
- **Redis latency as a client sees it:** time a `PING`, and an `MGET` of a fixed sample of about
  100 real `gen:*` keys, every second. Show p50, p95 and max over the last minute.

Save the samples to a file in the runs folder, so they can be lined up with the stress run's data
afterwards. Use one clock: both machines in UTC, and timestamps in milliseconds.

### Rules for this part
- **Only touch** `scripts/cache/warm-ui.ts`, new files under `scripts/cache/`, `package.json`
  scripts, and `docs/deployment.md` (document both features under "Warm UI"). **Don't change**
  `src/` (the site, the engine and the cache layer) or anything under `src/content/`.
- **Check the cache isn't affected:** before and after your changes, run `npm run build:manifest`
  and compare the `engine` and `manifest` hashes it prints. They must be identical. A change to
  files the manifest covers would make cached entries stale.
- **Work on a new branch from `se/rewrite-cache-strategy`,** and open a pull request for the team to
  review. Don't push to `se/rewrite-cache-strategy` itself, and don't add co-author lines to commits.
- **Test both features first against a non-production setup:** a local or test site with its own
  Redis, never penn. Run a short stress run against it and watch the monitor.
- **On penn, run the monitor from a separate checkout of your branch** (for example
  `~/warm-tools`), in a `node:24` container, the way `docs/deployment.md` runs the warm UI.
  **Never change the site's own checkout** (`~/datausa-site-rewrite`): the site's image is built
  from it.
- **Don't deploy the site.** These tools don't need it.

## Part 2: run the tests and report

### Before starting
1. **Agree a time window with the team.** Penn is a staging site, but people use it. Announce the
   window, and say how to reach you to stop the test.
2. **Load generator:** run it from **another machine**, not from penn, so it doesn't compete with
   the site for CPU. Use a machine with good bandwidth to penn's Google Cloud region (ask the team which). Check that it can sustain
   the request rates (an `ab` or `oha` run against a static page such as `/robots.txt` shows its
   ceiling).
3. **Check the CDN.** Look at the response headers of a report page (`cf-cache-status`,
   `x-cache-status`). If Cloudflare or Nginx caches report HTML, most of the load would never reach
   the site and the test would measure the CDN. In that case stop and ask the team how to send the
   load to the site itself. Don't work around it on your own (with query strings or headers).
4. **The URL list.** Build it from the warmed levels only:
   - geo: Nation, State, County, MSA, PUMA, Congressional District, Place;
   - cip, soc, naics, napcs;
   - university, Carnegie.

   **School districts aren't cached;** leave them out. Weight the list like real traffic: mostly
   places and counties, with the popular reports (states, big cities, large universities) repeated
   more often. Penn's search page lists the members of each level:
   `https://penn.datausa.io/search?dimension=<dimension>&hierarchy=<level>`.
5. **Pre-check:** request 50 URLs from the list once, slowly, and check that
   `data-gen-cache` shows near-full hits. Some generators always fail, so a state shows `171/173`
   and an occupation `42/44`. A URL showing `0/…` isn't cached: drop it, and report it.
6. **Baseline:** record Redis `INFO` (all sections), `CONFIG GET maxmemory*`,
   `CONFIG GET appendfsync`, `CONFIG GET save`, `docker stats --no-stream`, and `free -m`, before
   any load.

### What to measure, continuously during every stage
Run every test from the **Stress** mode on the load machine, with the **Monitor** panel open on
penn (part 1), and watch both live. The two tools record most of what's below. Collect the rest on
penn, every 5 s, into timestamped files:
- **Redis:**
  - `INFO stats`: `instantaneous_ops_per_sec`, `keyspace_hits` and `keyspace_misses`,
    `evicted_keys`, `rejected_connections`, `total_net_output_bytes`;
  - `INFO cpu`;
  - `INFO clients`: `connected_clients`, `blocked_clients`;
  - `INFO memory`: `used_memory`, `mem_fragmentation_ratio`;
  - `INFO persistence`: `rdb_bgsave_in_progress`, `aof_rewrite_in_progress`,
    `latest_fork_usec`, `aof_delayed_fsync`.
- **Redis latency, as clients see it:**
  - `redis-cli --latency-history -i 5`, from inside the Redis container and from the site
    container's network;
  - `SLOWLOG GET 50` at the end of each stage.
- **Containers and host:** `docker stats --no-stream` (CPU and memory of each container), `vmstat 5`,
  and the network throughput of the interface.
- **The site:** count, per 10 s, the `[report]` lines with `(unavailable)`, the `[redis]` lines,
  and reports with misses. Take the distribution of the `redis N ms` values.

**On the load generator,** for every request: the time, URL, status, total time, time to first byte,
bytes, and the `data-gen-cache` value from the HTML. A page is a **cache hit** when its hits are
within 5 of its total.

### The tests
Run them in this order. Each one has **stop conditions**; stop at once if any is met, write down
why, and let the system recover (see "Recovery") before continuing.

**Stop conditions, for every test:**
- more than 2% of responses are errors (5xx, timeouts), or more than 5% of pages are cache misses;
- the `(unavailable)` count keeps rising for a minute;
- Tesseract (`api-penn.datausa.io`) answers slower than 5 s for a small query, which you check
  every 10 s with one request;
- free memory on penn drops below 2 GB;
- the team asks you to stop.

#### 1. Redis on its own
The ceiling of Redis without the site in the way.
- Inside the `datausa-cache` Docker network on penn, run a small client that does what pages do:
  - `MGET` groups of real keys: take 1,000 groups of 44, 100 and 173 random `gen:*` keys from a
    `SCAN`;
  - use 1, 9 (one per PM2 worker), 32 and 64 concurrent connections.
- Measure ops/s, MB/s, and latency (p50, p95, p99, max) for each.
- Also run `redis-benchmark -t get,mget -d 50000 -n 100000` on a **separate scratch database or a
  separate Redis instance**: never write into db 0.

This gives the most page reads per second Redis can serve, and how latency grows with
concurrency.

#### 2. Cached pages at rising rates
The main test. Use an **open model**: a fixed arrival rate, requests started on schedule whether
earlier ones finished or not, with a cap of a few hundred in flight. That shows real overload,
where a closed loop hides it.
- **Stages:** 2, 5, 10, 20, 40, 80, 120 pages/s, 5 minutes each, with 2 minutes of quiet in
  between.
- **Read each page to the end.** Reports stream, so the cache read happens while the page is being
  sent.
- **Per stage, report:**
  - pages/s served;
  - page time (p50, p95, p99);
  - cache-hit share;
  - errors;
  - Redis ops/s and CPU;
  - Redis read time (from the `[report]` lines and `--latency-history`);
  - the `(unavailable)` count;
  - CPU of the site container.
- **Find the knee:** the rate where page p95 or Redis read p99 starts climbing fast, or the first
  `(unavailable)` appears. Name what saturates first: Redis CPU (one core), the network, the site's
  workers (CPU, event loop), or Nginx.

#### 3. A spike
From 5 pages/s, jump to twice the knee for 2 minutes, then back to 5. Check:
- whether reads miss the deadline;
- whether the circuit breaker opens: `(unavailable)` without a `[redis]` line just before it, in
  bursts that last about 30 s;
- how long it takes to get back to all hits.

#### 4. Load during a snapshot
At about half the knee's rate, trigger the save Redis already does on its own (`BGSAVE`), and
watch:
- `latest_fork_usec`;
- `--latency-history`, and the `[report]` read times;
- `(unavailable)` counts, while the save runs and right after.

`BGSAVE` only writes Redis's usual snapshot file. Still, ask the team before triggering it, and do it
**once**. Check first that `rdb_bgsave_in_progress` is 0 and the disk has room for the file (about
3.5 GB).

#### 5. Cache misses mixed in (optional, careful)
Real traffic includes pages that aren't cached. Writes run the Lua store script, and misses send
queries to Tesseract.
- Add 2% and then 5% of **school district** pages: they aren't cached, they're cheap, and they
  write little.
- **Don't** use uncached big reports: that would turn this into a Tesseract load test, which is
  out of scope.
- Watch whether writes slow down reads.

#### 6. A long soak
At about 60% of the knee, for 1 hour. Look for:
- latency that creeps up;
- memory or fragmentation that grows;
- connection counts that grow;
- AOF fsync delays (`aof_delayed_fsync`);
- the periodic snapshots (the `save` setting) and their effect.

#### Recovery, between tests and at the end
After stopping the load, wait until:
- Redis ops/s are back to the baseline;
- no `(unavailable)` appears for 2 minutes;
- 20 sample pages show full cache hits.

Write down how long that took.

## Rules
- **Code changes are limited to the tools of part 1,** on their own branch and pull request, under
  that part's rules.
- **Don't change the deployment or the cache's contents:** no `FLUSHDB` or `FLUSHALL`, no
  `DEL` or `UNLINK`, no `CONFIG SET` or `CONFIG REWRITE`, no purges (`/api/revalidate`), no
  restarts of Redis or the site, no deploys.
- **The only exceptions,** each agreed with the team first:
  - one `BGSAVE` (test 4);
  - `CONFIG SET latency-monitor-threshold 50`, to use `LATENCY LATEST` and `LATENCY HISTORY`,
    set back to its baseline value at the end.
- **Read-only Redis commands only** otherwise: `INFO`, `SCAN`, `MGET`, `GET`, `STRLEN`, `SLOWLOG GET`,
  `LATENCY …`, `--latency-history`.
- **Never use db 0 for anything that writes.** Benchmarks that write go to another database number
  or another Redis instance.
- **Don't send load to production** (`datausa.io`, `api.datausa.io`). Don't load-test Tesseract
  (`api-penn.datausa.io`) either: the tests are designed for cache hits, and the stop conditions
  protect Tesseract.
- **Don't enable the debug routes** (`ENABLE_DEBUG_ROUTES`): that needs a redeploy.
- **If anything looks wrong, stop the load first and investigate afterwards.**

## Deliverables
1. **A report** (a document or a Markdown file) with:
   - **the numbers:** the most cached pages/s penn serves while keeping page p95 under 2 s and
     Redis reads under 50 ms at p99, and the knee;
   - **what saturates first,** with the evidence;
   - **how the site fails past the knee:** whether reads miss the deadline, whether the breaker
     opens, how much load falls on Tesseract, and how long recovery takes;
   - **the effect of a snapshot** (`BGSAVE`) under load;
   - **the soak's results;**
   - **recommendations, each with its evidence and expected effect.** Candidates to evaluate,
     without applying any of them:
     - `REDIS_READ_TIMEOUT_MS` and the breaker settings;
     - `PM2_INSTANCES`;
     - Redis `io-threads`;
     - moving Redis to its own VM;
     - compressing large values;
     - making the oversized outputs smaller (some generators store 80–240 KB per report);
     - `appendfsync` and `save`;
     - a read replica;
     - caching whole pages in Nginx or the CDN.
2. **Charts:**
   - pages/s against page p95 and Redis read p99, one point per stage;
   - Redis CPU and ops/s over time;
   - `(unavailable)` counts over time;
   - the latency trace around the `BGSAVE`.
3. **The raw data and the scripts:** the stress and monitor runs, the samplers, every timestamped
   file, and how to run it again.
4. **The pull request with the tools** (part 1), with how they were tested.
