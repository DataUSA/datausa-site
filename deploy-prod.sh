#!/usr/bin/env bash
# (Re)starts the production container from the image built by build.sh and waits until it is healthy.
#
#   IMAGE_TAG=local/datausa-site:prod ./build.sh
#   ./deploy-prod.sh
#   PM2_INSTANCES=4 ./deploy-prod.sh
#
# Inside the running container:
#   docker exec -it datausa-site-prod pm2 ls|logs|monit
#   docker exec datausa-site-prod pm2 reload datausa-site   # fresh workers, empty data cache
#
# The compose file binds 127.0.0.1:3301 for the existing Nginx upstream, so this expects the
# bare-PM2 deployment (if it is still running) to be stopped first.
set -Eeuo pipefail
cd "$(dirname "$0")"

COMPOSE=(docker compose -f compose-production.yaml)
CONTAINER=datausa-site-prod

# The shared cache (Redis, compose-redis.yaml) lives outside this project: never started, stopped or
# recreated here. Check that it answers before switching the app, so a deploy never brings the site
# up against a missing cache (every report would be computed from Tesseract).
ENV_FILE="${ENV_FILE:-.env}"
REDIS_URL_VALUE="$(grep -E '^REDIS_URL=' "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d "\"'" || true)"
docker network inspect datausa-cache >/dev/null 2>&1 || docker network create datausa-cache >/dev/null
if [ -n "$REDIS_URL_VALUE" ]; then
  echo "Checking Redis at ${REDIS_URL_VALUE}"
  if ! docker run --rm --network datausa-cache --add-host host.docker.internal:host-gateway redis:7.4-alpine \
      redis-cli -u "$REDIS_URL_VALUE" ping 2>/dev/null | grep -q PONG; then
    echo "Redis at ${REDIS_URL_VALUE} does not answer PING; the app was not switched." >&2
    echo "Start it once with \`docker compose -f compose-redis.yaml up -d\` (deploys never start it), see docs/deployment.md." >&2
    exit 1
  fi
else
  echo "warning: REDIS_URL is not set in ${ENV_FILE}: the site will run without the shared cache" >&2
fi

echo "Compose up"
"${COMPOSE[@]}" up -d --remove-orphans --force-recreate

echo -n "Waiting for ${CONTAINER} to become healthy "
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)"
  if [ "$status" = "healthy" ]; then
    echo; echo "${CONTAINER} is healthy on port 3301 ($(docker inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$CONTAINER"))"
    exit 0
  fi
  echo -n "."
  sleep 5
done

echo; echo "${CONTAINER} did not become healthy (last status: ${status})" >&2
"${COMPOSE[@]}" logs --tail 50 >&2
exit 1
