# Deployment — self-hosted VM, PM2, Nginx

The site is a standard Next.js 16 production build run by PM2 in cluster mode behind the existing
Nginx reverse proxy (and Cloudflare in front of that). There is no Docker, no CMS database, no
page generation and no cache-warming step: a fresh deploy serves any valid report URL on its
first request.

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
npm run build                # prebuild builds data/dimensions.sqlite from data/*.jsonl, then next build (standalone)
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

Keep the existing `server` block and proxy cache; replace the four Docker upstream ports with the
PM2 cluster port:

```nginx
upstream datausa_site { server 127.0.0.1:3301; keepalive 32; }

location /_next/static/ {
  proxy_pass http://datausa_site;
  proxy_cache_valid 200 365d;
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
  # existing proxy_cache directives can stay; report pages send Cache-Control for the edge
}

# generated share images (og:image): each costs a report run and an image render, and sends
# Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800; let the proxy cache honour it
location /og/ { proxy_pass http://datausa_site; proxy_cache_valid 200 1d; }
location = /api/revalidate { proxy_pass http://datausa_site; proxy_cache off; }
location /api/prism/      { proxy_pass http://datausa_site; proxy_cache off; }
```

**Cached HTML and crawlers.** Next.js sends report pages in two shapes. Ordinary browsers (and
Googlebot, which runs JavaScript) get the page shell first and the `<title>`, description and share
tags streamed afterwards, inside `<body>`. Crawlers that read only the first HTML (social previews,
Bing, AI fetchers: the `htmlLimitedBots` list in `next.config.ts`) get the tags in `<head>`. A proxy
cache that stores one copy per URL can therefore hand a browser's copy to a preview crawler, which
then finds no tags in `<head>`. Wherever report HTML is cached, keep the two apart by adding the
visitor class to the cache key:

```nginx
# http {} level; keep the pattern in step with htmlLimitedBots in next.config.ts
map $http_user_agent $html_limited_bot {
  default 0;
  "~*(-Google|Google-|Slurp|DuckDuckBot|baiduspider|yandex|bingbot|BingPreview|applebot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Pinterestbot|redditbot|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|PerplexityBot|meta-external|Amazonbot|CCBot|Bytespider)" 1;
}
# in the location that caches report HTML
proxy_cache_key "$scheme$host$request_uri$html_limited_bot";
```

The same applies to a Cloudflare rule that caches HTML: bypass it for these user agents, or do not
cache report HTML there. The alternative is `htmlLimitedBots: /.*/`, which puts the tags in `<head>`
for everyone at the cost of the page shell (the loading skeleton) waiting for the report data.

Report HTML is safe to cache at the edge for the same 30 minutes as today; `Cache-Control` headers
are set by the app. Prism and revalidation endpoints must never be cached (per-visitor cookies).

## Protecting Tesseract

A report that is not cached sends its generators' queries to Tesseract on the server: about 160 for
a place, 30 to 55 for the other report types. Each worker sends at most `UPSTREAM_MAX_CONCURRENCY`
requests to a host at a time, whatever the number of reports it is rendering (`src/lib/api/limit.ts`);
the rest wait their turn, so a cold cache after a deploy makes pages slower instead of piling queries
onto Tesseract. Size the total (workers × slots) from a load test of the Tesseract server: the
default 8 slots at about 0.3 s a query are some 25 queries a second per worker, close to the legacy
CMS's brake of 20 a second per process. The browser's chart requests are not limited by this; they
go to the public API host (and Cloudflare's cache in front of it) as before.

When requests wait, each worker logs a summary per host at most every 10 seconds:

```
[upstream] api-penn.datausa.io: 516 requests in 10 s, answered in 0.12 s (p95 0.40 s, max 3.03 s); 526 waited for one of 8 slots (longest 1.0 s, up to 40 waiting), 0 dropped after 30 s; now 8 in flight, 14 waiting
```

"Answered in" is the time from sending a request to having read its response: when it grows while
Tesseract answers a direct query quickly, the workers are too busy to read their responses (CPU), or
the site's heavier queries are what slowed. `scripts/loadtest/run.mjs` measures both under load.

With `ENABLE_DEBUG_ROUTES=true`, `GET /api/debug/upstream` returns the counters of the worker that
answers (each PM2 worker has its own). Dropped requests leave gaps in the page that was being built;
if they show up in the log, raise the slots (when Tesseract has room), add workers or reduce the
traffic that reaches the app (the page cache in front of it).

## Caching and data releases

Application data (Tesseract, geoservice, external feeds) is cached in-process with
`use cache` + tags (`docs/architecture.md`). After a dataset release:

1. `curl -X POST https://datausa.io/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"`
   purges the data tags on the worker that handles the request. With several PM2 workers, either
   call it once per worker (Nginx `proxy_pass` to each port when workers listen on distinct ports),
   or simply `pm2 reload datausa-site`, which starts fresh workers with empty caches.
2. Purge the Nginx proxy cache / Cloudflare as today.

Nothing is pre-generated, so stale entries are at most the `data` cache-life (`next.config.ts`).

The latest-data home page (`/home-next`) reads BLS and EIA directly, not Tesseract. Its figures are
cached for two hours (state unemployment for twelve) under the `external-data` tag, so on a release
morning (CPI and the jobs report at 8:30 a.m. ET, EIA fuel prices on Monday or Tuesday) either wait
up to two hours or purge that tag: `-d '{"tags": ["external-data"]}'`. Release dates for the
"Coming up" list are in `src/content/latest/releases.ts`; add each new year's BLS dates there.

## Cutover and rollback

1. Deploy the new app on the VM on port 3301 next to the running Docker containers (ports 9994-9997).
2. Validate with the regression script against the live host: `NEW_URL=http://127.0.0.1:3301 npx tsx scripts/regression/compare.ts /profile/geo/massachusetts ...`.
3. Switch the Nginx upstream to `datausa_site`, `nginx -s reload`, purge Cloudflare.
4. Keep the Docker containers stopped but present for a week; rollback is switching the upstream back and reloading Nginx.
5. Before decommissioning the legacy VM services: keep the Prism database reachable (gap G2). The profile images are served by this app (see Report photos above).
