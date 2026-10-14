#!/usr/bin/env bash
# (Re)starts the sandbox container from the image built by build.sh and waits until it is healthy.
#
#   ./deploy.sh
#   SANDBOX_PORT=3054 PM2_INSTANCES=4 ./deploy.sh
#
# Inside the running container:
#   docker exec -it datausa-site-sandbox pm2 ls|logs|monit
#   docker exec datausa-site-sandbox pm2 reload datausa-site   # fresh workers, empty data cache
set -Eeuo pipefail
cd "$(dirname "$0")"

COMPOSE=(docker compose -f compose-sandbox.yaml)
CONTAINER=datausa-site-sandbox

echo "Compose up"
"${COMPOSE[@]}" up -d --remove-orphans --force-recreate

echo -n "Waiting for ${CONTAINER} to become healthy "
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)"
  if [ "$status" = "healthy" ]; then
    echo; echo "${CONTAINER} is healthy on port ${SANDBOX_PORT:-3054} ($(docker inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$CONTAINER"))"
    exit 0
  fi
  echo -n "."
  sleep 5
done

echo; echo "${CONTAINER} did not become healthy (last status: ${status})" >&2
"${COMPOSE[@]}" logs --tail 50 >&2
exit 1
