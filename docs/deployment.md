# Deployment — self-hosted VM, PM2, Nginx

The site is a standard Next.js 16 production build run by PM2 in cluster mode behind the existing
Nginx reverse proxy (on the Docker hosts, PM2 runs inside the container built by `build.sh`). There is
no CMS database and no page generation: a fresh deploy serves any valid report URL on its first
request. Nothing caches report HTML (pages are sent `private, no-store`, Nginx proxies without a
cache and there is no CDN in front); the one cache is the shared generator cache in Redis (below),
which lives outside the app's deploy cycle.

## Requirements

- Node.js 24 LTS (`.nvmrc`), npm 11. Node 26 becomes LTS in late October 2026 and is a drop-in upgrade.
- PM2 (`npm i -g pm2`), Nginx.
- Outbound HTTPS to the Tesseract API, the geoservice, the DOL claims sheet and (for now) the legacy image host.
- Outbound Postgres to the Prism database only if the PeoplePrism registration form is enabled.

## Environment variables

Runtime variables are read from the process environment (PM2 `env_production` or a `.env.production`
file in the project root at build time). See `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TESSERACT_URL` | yes | Tesseract base URL (trailing slash). Baked into client code at build time. |
| `GEOSERVICE_URL` | yes | Geoservice base URL. |
| `PROFILE_IMAGES_DIR` | no | Folder with the report photos (`splash/`, `thumb/`); default `profile-images` in the working directory. See below. |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | no | Another host to take report photos from (its `/api/profile/<slug>/<member>/<size>`). Unset: this site's own route. Baked in at build time. |
| `SITE_URL` | yes | Canonical origin for metadata, canonical URLs, sitemaps. |
| `DIMENSIONS_DB_PATH` | no | Override of `data/dimensions.sqlite` (relative to the server's working directory). |
| `REVALIDATE_SECRET` | yes | Shared secret for `POST /api/revalidate`. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | no | GA4 id (`G-9X03EHGTVS` in production). |
| `NEXT_PUBLIC_GDPR` | no | `true` shows the cookie banner and starts GA4 in denied consent mode. |
| `PRISM_DATABASE_URL`, `PRISM_JWT_SECRET`, `PRISM_COOKIE_DAYS` | no | PeoplePrism registrations (gated health sections). Without them the form answers 503 and the sections stay locked. |
| `API_MAX_CONCURRENCY`, `API_TIMEOUT_MS` | no | Generator fan-out tuning (defaults 12 and 20000). |
| `UPSTREAM_MAX_CONCURRENCY` | no | Requests in flight to each data API host (Tesseract, geoservice) per worker, across every report it renders (default 8). The most a deployment sends to Tesseract at once is this times the number of workers. See "Protecting Tesseract" below. |
| `UPSTREAM_QUEUE_TIMEOUT_MS` | no | How long a request waits for one of those slots before it is dropped and its generator yields nothing (default 30000; 0 waits without limit). |
| `REDIS_URL` | production | The shared cache (`redis://datausa-redis:6379` in Docker, see "Shared cache (Redis)"). Unset: no shared cache, every worker computes reports from Tesseract (development, tests). |
| `REDIS_READ_TIMEOUT_MS`, `REDIS_WRITE_TIMEOUT_MS` | no | Deadlines of cache reads and writes (defaults 50 and 1000). A slow or failing Redis is skipped, never fails a page. |
| `CACHE_TTL_DAYS` | no | Safety-net lifetime of cache entries (default 30). Purges are what invalidate. |
| `GEN_CACHE_LOCK_MS` | no | How long a render waits for another worker computing the same generator before computing it itself (default 60000). |
| `WARMER_ENABLED`, `WARMER_MAX_QPS`, `WARMER_DEPLOY_COUNTIES` | no | The background warmer (default on in production with `REDIS_URL`; at most 5 Tesseract queries a second; 100 counties after a deploy). |
| `GENERATOR_CACHE_SKIP` | no | Comma-separated generator ids to recompute on every render instead of caching (added to the built-in list of clock-dependent generators). |
| `ENABLE_DEBUG_ROUTES` | no | `true` serves `/api/debug/report` and `/api/debug/upstream` in production; for load tests only. |
| `GA_KEYFILE`, `GA_PROPERTY_ID` | no | Google Analytics 4 service-account key (path) and property for the home page's most-viewed reports; without them the curated default tiles are shown. |
| `PM2_INSTANCES` | no | Cluster size (default `max`). |
| `BLS_API_KEY` | production | Free key from https://data.bls.gov/registrationEngine/ for the figures on `/home-next`. Without it the BLS API allows 25 requests a day per IP address, which several PM2 workers (each with its own cache) use up; with it, 500. Never commit it. |

## Report photos

Report photos (splash and thumbnail, 2,243 JPEGs each, about 720 MB) are not in Git. They are the
legacy app's `static/images/profile/{splash,thumb}` folders, named by image id, and
`GET /api/profile/<slug>/<member>/<splash|thumb|json>` serves them (a member without a photo gets its
nearest parent's, as on the legacy site). Put them in `profile-images/` at the project root, or
anywhere and set `PROFILE_IMAGES_DIR`:

```bash
rsync -a <legacy host>:<legacy app>/static/images/profile/splash <legacy host>:<legacy app>/static/images/profile/thumb profile-images/
```

`scripts/package-standalone.sh` links `profile-images/` into `.next/standalone` instead of copying it,
so a deploy does not duplicate the photos. A photo added later (a new member's) is a new file in both
folders, named by its id in `data/images.jsonl`; no rebuild is needed.

## Build and start

```bash
nvm use                      # Node 24
npm ci
npm run build                # prebuild builds data/dimensions.sqlite and data/generator-manifest.json, then next build (standalone)
scripts/package-standalone.sh
pm2 start ecosystem.config.cjs --env production   # first time
pm2 reload datausa-site                            # subsequent deploys (zero downtime)
pm2 save
```

Health check: `GET /robots.txt` (static) and `GET /profile/geo/massachusetts` (full report, must return 200
with the title in the HTML). `GET /api/search?q=mass` exercises the SQLite database and
`GET /api/profile/geo/massachusetts/thumb` the photo folder.

Build time does not depend on the number of reports: the build compiles code and the content
modules only. The dimensions database is built from the versioned JSONL export in a few seconds.

## Nginx

Keep the existing `server` block; replace the four Docker upstream ports with the PM2 cluster port.
Nginx only proxies: report pages are not cached in front of the app.

```nginx
upstream datausa_site { server 127.0.0.1:3301; keepalive 32; }

location /_next/static/ {
  proxy_pass http://datausa_site;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
  proxy_pass http://datausa_site;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_buffering off;          # streamed report HTML
  proxy_read_timeout 120s;
}
```

**HTML and crawlers.** Next.js sends report pages in two shapes. Ordinary browsers (and Googlebot,
which runs JavaScript) get the page shell first and the `<title>`, description and share tags streamed
afterwards, inside `<body>`. Crawlers that read only the first HTML (social previews, Bing, AI
fetchers: the `htmlLimitedBots` list in `next.config.ts`) get the tags in `<head>`. Should report HTML
ever be cached in front of the app, the cache key must keep the two apart (the user agent class), or
a preview crawler would get a browser's copy without tags in `<head>`.

## Protecting Tesseract

A report that is not cached sends its generators' queries to Tesseract on the server: about 160 for
a place, 30 to 55 for the other report types. Each worker sends at most `UPSTREAM_MAX_CONCURRENCY`
requests to a host at a time, whatever the number of reports it is rendering (`src/lib/api/limit.ts`);
the rest wait their turn, so a cold cache makes pages slower instead of piling queries onto Tesseract. Size the total (workers × slots) from a load test of the Tesseract server: the
default 8 slots at about 0.3 s a query are some 25 queries a second per worker, close to the legacy
CMS's brake of 20 a second per process. The browser's chart requests are not limited by this; they
go to the public API host directly, as before.

When requests wait, each worker logs a summary per host at most every 10 seconds:

```
[upstream] api-penn.datausa.io: 516 requests in 10 s, answered in 0.12 s (p95 0.40 s, max 3.03 s); 526 waited for one of 8 slots (longest 1.0 s, up to 40 waiting), 0 dropped after 30 s; now 8 in flight, 14 waiting
```

"Answered in" is the time from sending a request to having read its response: when it grows while
Tesseract answers a direct query quickly, the workers are too busy to read their responses (CPU), or
the site's heavier queries are what slowed. `scripts/loadtest/run.mjs` measures both under load.

With `ENABLE_DEBUG_ROUTES=true`, `GET /api/debug/upstream` returns the counters of the worker that
answers (each PM2 worker has its own). Dropped requests leave gaps in the page that was being built;
if they show up in the log, raise the slots (when Tesseract has room) or add workers.

## Shared cache (Redis)

Reports render from the **generator cache**: the output of each report generator for each member, in
Redis, tagged by the cube it read (`docs/architecture.md`, "Generator cache"). Member attributes and
the lookup tables live there too. All workers and hosts share it, it survives deploys and restarts,
and a data release purges only the cubes it changed.

**Redis is not part of the app's deploy.** It runs in its own compose project, started once per host
and left running. `deploy.sh` and `deploy-prod.sh` never start, stop or recreate it (their
`up --force-recreate --remove-orphans` only touches the app's project); they check that it answers
`PING` before switching the app and stop with an error if it does not.

```bash
docker network create datausa-cache                     # once per host (the deploy scripts also create it)
docker compose -f compose-redis.yaml up -d              # once per host; REDIS_MAXMEMORY=2gb by default
# in the app's env file:  REDIS_URL=redis://datausa-redis:6379
```

- **Persistence.** AOF (`appendfsync everysec`) plus RDB snapshots on the `datausa-redis-data` volume:
  a Redis restart or a host reboot keeps the cache.
- **Memory.** `maxmemory` with `volatile-lru`: entries carry a 30-day TTL and are evicted least
  recently used; tag sets, purge counters and the warm queue have no TTL and are never evicted.
  Measured against penn (52 states and the 10 largest counties): about 169 entries per report,
  median entry 0.4 KB (90th percentile 1.6 KB, largest 190 KB), some 240 KB of entries and 290 KB
  with the tag sets per report, 18 MB for those 62 reports. The 152 most visited reports take about
  45 MB, and the default 2 GB holds some 7,000 reports.
- **Deploys keep it.** Keys carry a version per generator computed from source text and data
  (`data/generator-manifest.json`, `npm run build:manifest`), never from the build: a deploy that
  changes no generator reads every entry the previous build wrote; one that changes a generator
  recomputes only that generator (shared code: all of them). Entries of versions no longer built
  are never read again and expire by TTL; nothing is flushed on deploy.
- **Backups** (optional: the cache can always be recomputed from Tesseract):
  `docker exec datausa-redis redis-cli bgsave`, then copy the volume
  (`docker run --rm -v datausa-redis-data:/data -v "$PWD":/backup alpine tar czf /backup/redis.tgz -C /data .`).
  Restore by extracting it into the volume with Redis stopped.
- **Size and state.** `npm run cache:purge -- --stats` prints the key count, tags and memory;
  `GET /api/debug/report?id=texas` (with `ENABLE_DEBUG_ROUTES=true`) shows each generator's hit or
  miss and sends `x-gen-cache: <hits>/<total>`. Every report render logs one line with its hits,
  misses, waits on other workers and Redis time; report pages carry the same counts in the
  `data-gen-cache` and `data-report-generators` attributes of `#Profile` (a streamed page cannot set
  response headers).
- **Browsing keys (optional).** RedisInsight is defined in `compose-redis.yaml` under the `ui`
  profile, so it never starts with Redis. It has no login and listens on `127.0.0.1:5540` only:
  start it when needed (`docker compose -f compose-redis.yaml --profile ui up -d redisinsight`),
  open an SSH tunnel (`ssh -L 5540:127.0.0.1:5540 <host>`, then http://localhost:5540), and stop it
  afterwards (`docker compose -f compose-redis.yaml --profile ui stop redisinsight`). The
  connection to `datausa-redis` is preconfigured.
- **Redis down.** Reads time out after 50 ms and a circuit breaker skips Redis for 30 s after five
  errors: pages render from Tesseract as without the cache, slower but complete.

### Warming the whole site (batched warmer)

The background warmer recomputes purged reports one at a time at `WARMER_MAX_QPS`; filling an empty
cache that way takes days. `npm run warm:batch` (`docs/architecture.md`, "Batched warmer") renders
a list of reports through the real engine in member groups, fetching shared URLs once, skipping
queries for levels a cube lacks and batching member queries whose split passed the verification
gate. Run it from a checkout of the deployed commit with the production build's manifest
(`npm run build:manifest`, so the keys are the ones the site reads) against the Tesseract the site
uses:

```bash
# the plan: a JSON array of {"profile": "geo", "id": "05000US25025"} (a hierarchy is optional)
NEXT_PUBLIC_TESSERACT_URL=https://api.datausa.io/ GEOSERVICE_URL=https://geoservice.datausa.io/api/ \
REDIS_URL=redis://<redis host>:6379 \
  npm run warm:batch -- --plan plan.json --out /var/tmp/warm-$(date +%F) --workers 6 --cap 16 --max-cap 50 --geo-rate 8
```

- **Load on Tesseract.** All requests of the run share one cap: it starts at `--cap` (16), rises by 4
  every 20 s up to `--max-cap` while nothing fails, and drops by 40% (pausing 30 s after five
  errors) on 5xx, timeouts or a p95 above 15 s. Every change is logged in `events.jsonl`. The
  site's own traffic is not counted: on a server that also serves users, keep `--max-cap` well under
  what Tesseract takes (one penn server answered about 30 requests a second at most).
- **Geoservice.** Geo reports read it for their attributes (parents, neighbours) and two
  generators. It blocks a client that sends too many requests (HTTP 429 behind a challenge page, for
  a few minutes: about 30 a second did it), so the run keeps it at `--geo-rate` a second (default 4),
  halves the rate and pauses a minute on a 429. Reports whose attributes are already cached do not
  call it.
- **Redis memory.** Size `maxmemory` for the reports in the plan before starting (about 0.2–0.3 MB
  per geo report, see the measurements in the run's `summary.json`); with `volatile-lru` an
  undersized Redis evicts entries the run just wrote.
- **Resuming.** Rerunning the same plan skips the reports that are already a full hit, so a run that
  stopped can simply be started again. `--force` re-renders everything.
- **One at a time.** A run takes `warm:batch:lock` in Redis and refuses to start if another holds it.
- **Progress.** `progress.jsonl` (one line every 15 s: reports, requests by kind, cap and rate,
  p50/p95 per cube, Redis memory, workers' memory and CPU); the console prints a one-line summary.

## Data releases

Each release comes with the list of cubes it changed. Purge exactly those, from a checkout with
Node (it talks to Redis directly, so it works with the site down):

```bash
REDIS_URL=redis://<redis host>:6379 npm run cache:purge -- --cubes acs_yg_total_population_5,pums_5
# or through the site:
curl -X POST https://datausa.io/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET" \
     -H "content-type: application/json" -d '{"cubes": ["acs_yg_total_population_5"]}'
```

Each cube's entries are deleted for every worker and host at once (the counts are printed), the
affected reports are queued, and the warmer recomputes them in the background at `WARMER_MAX_QPS`
(states first, then counties by population, then the rest). A name the cache never saw is reported
as unknown (exit code 2), which catches typos in the list. `{"tags": ["geoservice"]}` (or
`--tags geoservice`) purges what came from the geoservice.

What still uses Next's per-worker `use cache` (the home page tiles and map, the dataset pages, the
COVID employment route, the latest-data figures, similar places on report pages) keeps its
`revalidateTag` tags: `{"tags": ["tesseract"]}` and the others expire them on the worker that answers;
`pm2 reload datausa-site` clears them on every worker. Report data is not affected by a reload.

The latest-data home page (`/home-next`) reads BLS and EIA directly, not Tesseract. Its figures are
cached for two hours (state unemployment for twelve) under the `external-data` tag, so on a release
morning (CPI and the jobs report at 8:30 a.m. ET, EIA fuel prices on Monday or Tuesday) either wait
up to two hours or purge that tag: `-d '{"tags": ["external-data"]}'`. Release dates for the
"Coming up" list are in `src/content/latest/releases.ts`; add each new year's BLS dates there.

## Cutover and rollback

1. Deploy the new app on the VM on port 3301 next to the running Docker containers (ports 9994-9997).
2. Validate with the regression script against the live host: `NEW_URL=http://127.0.0.1:3301 npx tsx scripts/regression/compare.ts /profile/geo/massachusetts ...`.
3. Switch the Nginx upstream to `datausa_site`, `nginx -s reload`.
4. Keep the Docker containers stopped but present for a week; rollback is switching the upstream back and reloading Nginx.
5. Before decommissioning the legacy VM services: keep the Prism database reachable (gap G2). The profile images are served by this app (see Report photos above).
