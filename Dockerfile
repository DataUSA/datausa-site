# Sandbox image: the same standalone build as the PM2 deployment (docs/deployment.md), run by
# pm2-runtime inside the container so `pm2 reload|logs|monit` work through `docker exec`.
# Built by build.sh, run by deploy.sh with compose-sandbox.yaml.

FROM node:24-alpine AS deps
# https://github.com/nodejs/docker-node/tree/main#nodealpine (Next's SWC binaries need glibc shims)
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat bash
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# The env file is mounted as a build secret (never a layer) at a path `next build` loads, so the
# NEXT_PUBLIC_* values get inlined into the client bundle. Secrets do not take part in the layer
# cache, so build.sh passes the file's hash to rebuild whenever it changes.
ARG ENV_FILE_HASH
RUN --mount=type=secret,id=dotenv,target=/app/.env.production.local \
    echo "env ${ENV_FILE_HASH}" \
    && npm run build \
    && scripts/package-standalone.sh \
    && rm -f .next/standalone/.env*


FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Listen on every interface inside the container (ecosystem.config.cjs defaults to 127.0.0.1).
ENV LISTEN_HOST=0.0.0.0
ENV PM2_HOME=/app/.pm2

RUN npm install -g pm2@6.0.8 && npm cache clean --force

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app/.pm2 \
    && chown nextjs:nodejs /app/.pm2

# Same layout as the VM deployment, so ecosystem.config.cjs is used unchanged.
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone

# Next writes its incremental cache (generated report HTML, cached data) into this folder at
# request time. compose-production.yaml mounts a named volume here, and an empty named volume is
# initialized from the mountpoint's ownership, so create it readable/writable by nextjs before
# dropping privileges.
RUN mkdir -p .next/standalone/.next/cache && chown nextjs:nodejs .next/standalone/.next/cache

ARG GIT_SHA=unknown
LABEL org.opencontainers.image.revision=${GIT_SHA}

USER nextjs
EXPOSE 3301

CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]
