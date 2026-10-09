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
| `NEXT_PUBLIC_IMAGE_BASE_URL` | yes (for now) | Host serving `/api/profile/<slug>/<member>/<size>` images. |
| `SITE_URL` | yes | Canonical origin for metadata, canonical URLs, sitemaps. |
| `DIMENSIONS_DB_PATH` | no | Override of `data/dimensions.sqlite` (relative to the server's working directory). |
| `REVALIDATE_SECRET` | yes | Shared secret for `POST /api/revalidate`. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | no | GA4 id (`G-9X03EHGTVS` in production). |
| `NEXT_PUBLIC_GDPR` | no | `true` shows the cookie banner and starts GA4 in denied consent mode. |
| `PRISM_DATABASE_URL`, `PRISM_JWT_SECRET`, `PRISM_COOKIE_DAYS` | no | PeoplePrism registrations (gated health sections). Without them the form answers 503 and the sections stay locked. |
| `API_MAX_CONCURRENCY`, `API_TIMEOUT_MS` | no | Generator fan-out tuning (defaults 12 and 20000). |
| `GA_KEYFILE`, `GA_PROPERTY_ID` | no | Google Analytics 4 service-account key (path) and property for the home page's most-viewed reports; without them the curated default tiles are shown. |
| `PM2_INSTANCES` | no | Cluster size (default `max`). |

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
with the title in the HTML). `GET /api/search?q=mass` exercises the SQLite database.

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

location = /api/revalidate { proxy_pass http://datausa_site; proxy_cache off; }
location /api/prism/      { proxy_pass http://datausa_site; proxy_cache off; }
```

Report HTML is safe to cache at the edge for the same 30 minutes as today; `Cache-Control` headers
are set by the app. Prism and revalidation endpoints must never be cached (per-visitor cookies).

## Caching and data releases

Application data (Tesseract, geoservice, external feeds) is cached in-process with
`use cache` + tags (`docs/architecture.md`). After a dataset release:

1. `curl -X POST https://datausa.io/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"`
   purges the data tags on the worker that handles the request. With several PM2 workers, either
   call it once per worker (Nginx `proxy_pass` to each port when workers listen on distinct ports),
   or simply `pm2 reload datausa-site`, which starts fresh workers with empty caches.
2. Purge the Nginx proxy cache / Cloudflare as today.

Nothing is pre-generated, so stale entries are at most the `data` cache-life (`next.config.ts`).

## Cutover and rollback

1. Deploy the new app on the VM on port 3301 next to the running Docker containers (ports 9994-9997).
2. Validate with the regression script against the live host: `NEW_URL=http://127.0.0.1:3301 npx tsx scripts/regression/compare.ts /profile/geo/massachusetts ...`.
3. Switch the Nginx upstream to `datausa_site`, `nginx -s reload`, purge Cloudflare.
4. Keep the Docker containers stopped but present for a week; rollback is switching the upstream back and reloading Nginx.
5. Before decommissioning the legacy VM services: move profile images (gap G1) and keep the Prism database reachable (gap G2).
