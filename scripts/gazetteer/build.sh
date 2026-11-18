#!/usr/bin/env bash
# Builds data/gazetteer.tsv from the Census Bureau's 2024 Gazetteer files: land area, water area and
# an interior point for every state, county, place, metropolitan area and congressional district.
#
#   scripts/gazetteer/build.sh
#
# The output is committed; `npm run build:dimensions` loads it into the `geo_facts` table of the
# dimensions database and uses the points to work out which places lie in which county and metro
# area (scripts/legacy-export/geo-containment.ts). School districts carry the same facts in
# data/school-districts.jsonl (scripts/school-districts/build.sh). PUMAs have no 2024 file.
#
# Columns: id (Tesseract id: summary-level prefix + GEOID), land_sqmi, water_sqmi, lat, lon.
# Re-run when the vintage of the population data changes (the ids follow the same vintage).
set -euo pipefail

BASE="https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer"
# file, id prefix, sha256
FILES=(
  "2024_Gaz_state_national.zip 04000US 608678c4b1aee5bd7577d7ee8754763af5b9c662d44cef23f30fead56d9284ae"
  "2024_Gaz_counties_national.zip 05000US 3c337402b5c6e8d5aa26b4278ccf4edc8989f2683765b3ffbf22296cdb2df3a0"
  "2024_Gaz_place_national.zip 16000US cf262fc92b2326f7a8c62a89d156a60eb17d64d6d35f7a62310c43bb08972c06"
  "2024_Gaz_cbsa_national.zip 31000US 0ec21c5d83982467903f1500fbbae87311edc81f09bed8ec1bbded80bce7eec3"
  "2024_Gaz_119CDs_national.zip 50000US 544b14949130dfa5e07bf3179854a8138deefa825ad6e8187057de175d71b17d"
)

cd "$(dirname "$0")/../.."
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
OUT="data/gazetteer.tsv"

printf 'id\tland_sqmi\twater_sqmi\tlat\tlon\n' > "$WORK/out.tsv"
for entry in "${FILES[@]}"; do
  read -r file prefix sha <<< "$entry"
  curl -fsSL -o "$WORK/$file" "$BASE/$file"
  echo "$sha  $WORK/$file" | shasum -a 256 -c - > /dev/null
  # columns are found by name: their positions differ from file to file
  unzip -p "$WORK/$file" | tr -d '\r' | awk -F'\t' -v prefix="$prefix" '
    NR == 1 { for (i = 1; i <= NF; i++) { gsub(/ +$/, "", $i); col[$i] = i } next }
    { for (i = 1; i <= NF; i++) gsub(/^ +| +$/, "", $i)
      printf "%s%s\t%s\t%s\t%s\t%s\n", prefix, $col["GEOID"], $col["ALAND_SQMI"], $col["AWATER_SQMI"], $col["INTPTLAT"], $col["INTPTLONG"] }
  ' >> "$WORK/out.tsv"
done
mv "$WORK/out.tsv" "$OUT"
echo "Built $OUT: $(($(wc -l < "$OUT") - 1)) geographies"
