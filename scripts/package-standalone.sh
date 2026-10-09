#!/usr/bin/env bash
# Finishes a `next build` for the self-hosted deployment: the standalone server bundle needs the
# static assets, the public folder and the dimensions database next to it.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .next/standalone/server.js ]; then
  echo "Run \`npm run build\` first (no .next/standalone/server.js)" >&2
  exit 1
fi

mkdir -p .next/standalone/.next .next/standalone/public .next/standalone/data
rm -rf .next/standalone/.next/static .next/standalone/public
cp -R .next/static .next/standalone/.next/static
cp -R public .next/standalone/public
cp data/dimensions.sqlite .next/standalone/data/dimensions.sqlite
echo "standalone bundle ready in .next/standalone ($(du -sh .next/standalone | cut -f1))"
