#!/usr/bin/env bash
# Rebuilds a shape file in public/topojson from the Census Bureau's cartographic boundary files.
#
#   scripts/topojson/build.sh puma        PUMA.json       2020 PUMAs (redrawn once a decade; the 2020
#                                                         vintage, published May 2023, is the current one
#                                                         and the one Tesseract uses for every year)
#   scripts/topojson/build.sh districts   Districts.json  districts of the 119th Congress (2025 file)
#
# The files the legacy site shipped predate both: its PUMAs were the 2010 vintage (952 of 2,380 ids
# matched nothing) and its districts predate the 2022 redistricting. When a new Congress redraws
# districts, point `districts` at the new cb_<year>_us_cd<congress>_500k file and update the hash.
#
# Output matches the other files in public/topojson: one object, each geometry carrying only its
# Tesseract id (summary-level prefix + Census GEOID), simplified for state-sized maps.
#
# mapshaper is run through npx at a pinned version; it is a build-time tool, not a dependency.
set -euo pipefail

MAPSHAPER="mapshaper@0.7.61"

case "${1:-}" in
  puma)
    SOURCE="https://www2.census.gov/geo/tiger/GENZ2020/shp/cb_2020_us_puma20_500k.zip"
    SHA256="5b43d4f5c60e25dceb136e90534c89bb7e404eb4f0548d9749e1f2ac2091725f"
    ID='id = "79500US" + GEOID20'; LAYER="pumas"; SIMPLIFY="6%"; OUT="PUMA.json" ;;
  districts)
    SOURCE="https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_cd119_500k.zip"
    SHA256="8e804518d333d67e24e25c61767c6a7c78fd0a0852179e8cc19c36fd66011010"
    ID='id = "50000US" + GEOID'; LAYER="districts"; SIMPLIFY="3%"; OUT="Districts.json" ;;
  *)
    echo "usage: $0 puma|districts" >&2; exit 1 ;;
esac

cd "$(dirname "$0")/../.."
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

curl -fsSL -o "$WORK/source.zip" "$SOURCE"
echo "$SHA256  $WORK/source.zip" | shasum -a 256 -c -
unzip -q "$WORK/source.zip" -d "$WORK/shp"

npx -y "$MAPSHAPER" "$WORK"/shp/*.shp \
  -each "$ID" \
  -filter-fields id \
  -rename-layers "$LAYER" \
  -simplify weighted "$SIMPLIFY" keep-shapes \
  -clean \
  -o format=topojson id-field=id drop-table bbox quantization=1e6 "$WORK/$OUT"

mv "$WORK/$OUT" "public/topojson/$OUT"
ls -l "public/topojson/$OUT"
