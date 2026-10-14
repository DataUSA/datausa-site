#!/usr/bin/env bash
# Builds the sandbox image (local/datausa-site:sandbox) from the current checkout.
#
#   ./build.sh               # uses ./.env
#   ENV_FILE=.env.sandbox ./build.sh --no-cache
#
# Extra arguments are passed to `docker build`.
set -Eeuo pipefail
cd "$(dirname "$0")"

ENV_FILE="${ENV_FILE:-.env}"
IMAGE_TAG="${IMAGE_TAG:-local/datausa-site:sandbox}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE (see .env.example)" >&2
  exit 1
fi

GIT_SHA="$(git rev-parse --short HEAD)"
echo "Building ${IMAGE_TAG} from $(git branch --show-current)@${GIT_SHA} with ${ENV_FILE} ..."

DOCKER_BUILDKIT=1 docker build \
  --secret id=dotenv,src="$ENV_FILE" \
  --build-arg ENV_FILE_HASH="$(git hash-object "$ENV_FILE")" \
  --build-arg GIT_SHA="$GIT_SHA" \
  -t "$IMAGE_TAG" \
  "$@" \
  .

echo "Built ${IMAGE_TAG} (${GIT_SHA})"
