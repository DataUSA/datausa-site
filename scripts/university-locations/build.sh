#!/usr/bin/env bash
# Builds data/university-locations.tsv from the IPEDS institutional directory (the "HD" survey file
# of the National Center for Education Statistics): where each college and university is, so a
# state's universities page can map them as points.
#
#   scripts/university-locations/build.sh
#
# The output is committed; `npm run build:dimensions` loads it into the `university_locations` table
# of the dimensions database. Columns: id (IPEDS UNITID, the University id in Tesseract), lat, lon,
# city (the city or town of its address) and state (postal abbreviation).
# Re-run with the next year's file when the enrollment cube moves to it.
set -euo pipefail

URL="https://nces.ed.gov/ipeds/datacenter/data/HD2024.zip"
SHA256="d98425c123d7c0e872aec6e83960dfb501884818bf17385c340790f3d1f28345"

cd "$(dirname "$0")/../.."
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
OUT="data/university-locations.tsv"

curl -fsSL -o "$WORK/hd.zip" "$URL"
echo "$SHA256  $WORK/hd.zip" | shasum -a 256 -c - > /dev/null
unzip -p "$WORK/hd.zip" > "$WORK/hd.csv"
# a CSV with quoted names (commas inside): read with Python's csv module, columns found by name
python3 -I - "$WORK/hd.csv" "$WORK/out.tsv" <<'PY'
import csv, sys
src, out = sys.argv[1], sys.argv[2]
with open(src, newline="", encoding="utf-8-sig", errors="replace") as f, open(out, "w") as o:
    o.write("id\tlat\tlon\tcity\tstate\n")
    for row in csv.DictReader(f):
        row = {k.strip(): v for k, v in row.items()}
        try:
            lat, lon = float(row["LATITUDE"]), float(row["LONGITUD"])
        except ValueError:
            continue
        if lat == 0 and lon == 0:
            continue
        clean = lambda v: " ".join(v.replace("\t", " ").split())
        o.write(f"{row['UNITID'].strip()}\t{lat:.5f}\t{lon:.5f}\t{clean(row['CITY'])}\t{clean(row['STABBR'])}\n")
PY
mv "$WORK/out.tsv" "$OUT"
echo "Built $OUT: $(($(wc -l < "$OUT") - 1)) institutions"
