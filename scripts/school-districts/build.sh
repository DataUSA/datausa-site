#!/usr/bin/env bash
# Builds everything the site knows about school districts from the Census Bureau's cartographic
# boundary files (unified, elementary and secondary districts are published as three files):
#
#   public/topojson/SchoolDistrict_<state FIPS>.json   shapes, one file per state like Place_ and Tract_
#   data/school-districts.jsonl                        members (id, name, slug) with grade span, land
#                                                      area and an interior point for the search map
#
#   scripts/school-districts/build.sh
#
# Vintage: the 2024 files hold the 2023-24 school year boundaries, the ones the 2020-2024 ACS 5-year
# estimates are tabulated for. To move to a new vintage change YEAR and the three hashes, rerun, and
# review the diff of data/school-districts.jsonl (districts merge and rename every year; the slug of
# an existing id is kept, see build-members.ts).
#
# Ids follow the other geographies: summary level + "00US" + Census GEOID (state FIPS + district
# code), so 97000US2502790 is the unified district 02790 in Massachusetts. Summary levels: 950
# elementary, 960 secondary, 970 unified. The "School District Not Defined" remainders (code 99997)
# are dropped.
#
# Elementary and secondary districts overlap each other (and never a unified district), so the
# layers are simplified together, to keep shared borders identical, but not cleaned as one layer.
#
# mapshaper is run through npx at a pinned version; it is a build-time tool, not a dependency.
set -euo pipefail

MAPSHAPER="mapshaper@0.7.61"
YEAR="2024"
BASE="https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp"
SIMPLIFY="8%"

# kind, summary level, sha256 of cb_<YEAR>_us_<kind>_500k.zip
SOURCES=(
  "unsd 970 b17771a02b8f84a5e53705cd32b9917596946b59510b1daaee61d75ecb3e0785"
  "elsd 950 809ce368525846ed0c95983c39c9a72091e04cbcee6721e338243735579b9619"
  "scsd 960 75ed9249ff905a1191535ca4db580851add1a357bcfe4343cf702fb3834c549a"
)

cd "$(dirname "$0")/../.."
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir "$WORK/shapes"

INPUTS=()
IDS=()
for source in "${SOURCES[@]}"; do
  read -r kind level sha <<<"$source"
  file="cb_${YEAR}_us_${kind}_500k"
  curl -fsSL -o "$WORK/$file.zip" "$BASE/$file.zip"
  echo "$sha  $WORK/$file.zip" | shasum -a 256 -c -
  unzip -q "$WORK/$file.zip" -d "$WORK/$kind"
  INPUTS+=("$WORK/$kind/$file.shp")
  IDS+=(-each "id = \"${level}00US\" + GEOID" "target=$file")
done

npx -y "$MAPSHAPER" -i "${INPUTS[@]}" combine-files \
  "${IDS[@]}" \
  -filter '!/99997$/.test(GEOID)' target='*' \
  -each 'lon = Math.round(this.innerX * 1e4) / 1e4, lat = Math.round(this.innerY * 1e4) / 1e4' target='*' \
  -simplify weighted "$SIMPLIFY" keep-shapes \
  -merge-layers target='*' force name=districts \
  -o format=json "$WORK/districts.json" \
  -split STATEFP \
  -o format=topojson singles id-field=id drop-table bbox quantization=1e5 "$WORK/shapes/"

# One file per state, named like the other per-state shape files; the object is called "districts"
# in every file (mapshaper names it after the state it was split on).
rm -f public/topojson/SchoolDistrict_*.json
node -e '
  const fs = require("node:fs"), path = require("node:path");
  const [from, to] = process.argv.slice(1);
  for (const file of fs.readdirSync(from)) {
    const topology = JSON.parse(fs.readFileSync(path.join(from, file), "utf8"));
    const [key] = Object.keys(topology.objects);
    topology.objects = {districts: topology.objects[key]};
    fs.writeFileSync(path.join(to, `SchoolDistrict_${path.basename(file, ".json")}.json`), JSON.stringify(topology));
  }
' "$WORK/shapes" public/topojson

npx tsx scripts/school-districts/build-members.ts "$WORK/districts.json" "$YEAR"

du -ch public/topojson/SchoolDistrict_*.json | tail -1
