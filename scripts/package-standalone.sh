#!/usr/bin/env bash
# Finishes a `next build` for the self-hosted deployment: the standalone server bundle needs the
# static assets, the public folder, the dimensions database and the share-image fonts next to it.
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
# fonts read at request time by the /og share-image routes (src/lib/og/assets.ts)
rm -rf .next/standalone/assets
cp -R assets .next/standalone/assets
# report photos (about 720 MB, not in Git): linked, not copied, unless PROFILE_IMAGES_DIR points elsewhere
# (no trailing slash: removes a previous link, or a copy left by an older build, never the photos themselves)
rm -rf .next/standalone/profile-images
if [ -d profile-images ]; then
  ln -s "$(pwd)/profile-images" .next/standalone/profile-images
else
  echo "warning: no profile-images/ folder; report photos will 404 unless PROFILE_IMAGES_DIR is set" >&2
fi
echo "standalone bundle ready in .next/standalone ($(du -sh .next/standalone | cut -f1))"
