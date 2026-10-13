#!/usr/bin/env python3
"""
Builds src/content/geo/district-labels.json: a familiar name for every congressional district
("Irving, Arlington & Mansfield" for Texas's 6th), shown beside the official name.

    python3 scripts/districts/build-labels.py [--congress 119] [--cache DIR]

Standard library only. Two sources:

1. Census Bureau, <congress>th Congressional District Summary File (2020 Census). Its geography
   header gives the 2020 population of every place and county part inside each district. Only that
   one small file is read out of each state's archive, with HTTP range requests (the archives are
   up to 200 MB each). The previous Congress's file is read too, to see which districts changed.

2. Daily Kos Elections' naming guide (2022 maps): a hand-written geographic description per
   district, e.g. "Appalachian Kentucky". It is used in place of the computed label wherever the
   district is identical to the one it was written for; a redrawn district gets the computed label.
   The descriptions are kept in the output, so a rebuild still works if the sheet is unavailable.

Computed label, by 2020 population:
  - one city holds half the district or more: the city ("Denver"), or "Part of <city>" when the
    district has under 70% of it, naming the counties or New York boroughs it covers;
  - otherwise up to three places with at least 7% of the district each ("Lubbock & Abilene"),
    or "<city> area" when only one qualifies;
  - no such place (rural districts, and states whose towns are not census places): the largest
    counties ("Bucks & Montgomery Counties");
  - at-large districts get no label.
"""
import argparse, collections, csv, datetime, io, json, os, re, sys, tempfile, time, urllib.error, urllib.request, zipfile

CENSUS = "https://www2.census.gov/programs-surveys/decennial/2020/data/{n}th-congressional-district-summary-file/"
DAILY_KOS_SHEET = "https://docs.google.com/spreadsheets/d/1weoLFu2U5lmxQNcB8pFItGHj1Lb_M2E9Oi48sI4w1vY"
DAILY_KOS_ARTICLE = "https://www.dailykos.com/stories/2022/8/8/2113098/-The-Daily-Kos-Elections-naming-guide-to-this-decade-s-new-congressional-districts"
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "content", "geo", "district-labels.json")


def fetch(req, timeout=120):
    """urlopen with patience: the Census file server answers 429 when asked too quickly."""
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.headers, r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or attempt == 7:
                raise
            time.sleep(15 * (attempt + 1))


class HttpFile(io.RawIOBase):
    """A remote file read with range requests, enough for zipfile to open one member."""

    def __init__(self, url):
        self.url, self.pos = url, 0
        headers, _ = fetch(urllib.request.Request(url, method="HEAD"))
        self.size = int(headers["Content-Length"])

    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos

    def seek(self, offset, whence=0):
        self.pos = offset if whence == 0 else self.pos + offset if whence == 1 else self.size + offset
        return self.pos

    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        if n == 0 or self.pos >= self.size:
            return b""
        end = min(self.pos + n, self.size) - 1
        _, data = fetch(urllib.request.Request(self.url, headers={"Range": f"bytes={self.pos}-{end}"}))
        self.pos += len(data)
        return data

    def readinto(self, b):
        data = self.read(len(b))
        b[:len(data)] = data
        return len(data)


def load_districts(congress, cache):
    """{state fips + district: {st, pop, places, counties}} from the summary file's geography header."""
    base = CENSUS.format(n=congress)
    folder = os.path.join(cache, f"geo{congress}")
    os.makedirs(folder, exist_ok=True)
    listing = fetch(base)[1].decode("utf8", "replace")
    for state in re.findall(r'href="([A-Z][A-Za-z_]+)/"', listing):
        marker = os.path.join(folder, state + ".txt")
        if os.path.exists(marker) and os.path.getsize(marker) > 0:
            continue
        time.sleep(1.5)
        page = fetch(base + state + "/")[1].decode("utf8", "replace")
        archives = re.findall(r'href="([a-z]{2}2020\.cd\d+\.zip)"', page)
        if not archives:
            continue
        archive = zipfile.ZipFile(io.BufferedReader(HttpFile(base + state + "/" + archives[0]), buffer_size=1 << 20))
        geo = [n for n in archive.namelist() if "geo" in n][0]
        rows = []
        for line in archive.read(geo).decode("latin-1").split("\n"):
            r = line.split("|")
            # summary levels: 500 district, 510 district-county, 531 district-place (or remainder)
            if len(r) > 90 and r[2] in ("500", "510", "531"):
                rows.append("|".join([r[1], r[2], r[9], r[86], r[87], r[90]]))  # state, level, geocode, name, name with type, population
        with open(marker, "w", encoding="utf8") as f:
            f.write("\n".join(rows) + "\n")
        print(f"  {congress}th Congress: {state}", file=sys.stderr)
    out = {}
    for name in sorted(os.listdir(folder)):
        for line in open(os.path.join(folder, name), encoding="utf8"):
            r = line.rstrip("\n").split("|")
            if len(r) < 6:
                continue
            st, level, code, base_name, full, pop = r
            rec = out.setdefault(code[:4], {"st": st, "pop": 0, "places": [], "counties": []})
            if level == "500":
                rec["pop"] = int(pop)
            elif level == "510":
                rec["counties"].append({"code": code[4:], "name": base_name, "full": full, "pop": int(pop)})
            else:
                rec["places"].append({"code": code[4:], "name": base_name, "full": full, "pop": int(pop)})
    return out


def load_daily_kos(previous):
    """{"TX-06": description}; falls back to the descriptions already in the output file."""
    try:
        text = fetch(DAILY_KOS_SHEET + "/export?format=csv&gid=0")[1].decode("utf8")
        rows = list(csv.reader(io.StringIO(text)))[1:]
        found = {r[0].strip(): r[3].strip() for r in rows if len(r) >= 4 and r[3].strip()}
        if len(found) > 400:
            return found
    except Exception as error:  # noqa: BLE001 - any failure means "use what we have"
        print(f"Daily Kos sheet unavailable ({error}); reusing the stored descriptions", file=sys.stderr)
    return {v["key"]: v["dailykos"] for v in previous.values() if v.get("dailykos")}


CLEAN = [
    (r"\s*\(balance\)$", ""), (r"\s+(metropolitan|metro|unified|consolidated) government$", ""), (r"\s+city$", ""),
    (r"^Urban Honolulu$", "Honolulu"), (r"^Louisville/Jefferson County$", "Louisville"), (r"^Nashville-Davidson$", "Nashville"),
    (r"^Lexington-Fayette$", "Lexington"), (r"^Augusta-Richmond County$", "Augusta"), (r"^Athens-Clarke County$", "Athens"),
    (r"^Macon-Bibb County$", "Macon"), (r"^Butte-Silver Bow$", "Butte"), (r"^Anaconda-Deer Lodge County$", "Anaconda"),
    (r"^Boise City$", "Boise"), (r"^New York$", "New York City"), (r"^San Buenaventura \(Ventura\)$", "Ventura"),
]
BOROUGHS = {"Kings": "Brooklyn", "New York": "Manhattan", "Richmond": "Staten Island", "Bronx": "the Bronx", "Queens": "Queens"}
PLURALS = {"County": "Counties", "Parish": "Parishes", "Borough": "Boroughs", "Municipio": "Municipios", "Census Area": "Census Areas"}


def clean(name):
    for pattern, replacement in CLEAN:
        name = re.sub(pattern, replacement, name)
    return name.strip()


def join(names):
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " & " + names[-1]


def county_label(d):
    counties = sorted(d["counties"], key=lambda c: -c["pop"])
    picks = [c for c in counties if c["pop"] / d["pop"] >= 0.12][:3] or counties[:1]
    if sum(c["pop"] for c in picks) / d["pop"] < 0.4:  # many small counties: name the three largest
        picks = counties[:3]
    full = [re.sub(r" \(part\)$", "", c["full"]) for c in picks]
    kinds = {f[len(c["name"]):].strip() for f, c in zip(full, picks)}
    if len(kinds) != 1 or not next(iter(kinds)):
        return join(full)
    kind = kinds.pop()
    return f"{join([c['name'] for c in picks])} {kind if len(picks) == 1 else PLURALS.get(kind, kind)}"


def compute(cd, d, totals, spans):
    if cd.endswith(("00", "98")):  # at large (98: delegate or resident commissioner)
        return None
    places = sorted([p for p in d["places"] if p["code"] != "99999"], key=lambda p: -p["pop"])
    if not places:
        return county_label(d)
    share = lambda p: p["pop"] / d["pop"]  # noqa: E731
    top = places[0]
    held = top["pop"] / totals[(cd[:2], top["code"])]
    if share(top) >= 0.5:
        city = clean(top["name"])
        if held >= 0.7:
            return city
        extra = [clean(p["name"]) for p in places[1:3] if share(p) >= 0.1]
        counties = [c for c in sorted(d["counties"], key=lambda c: -c["pop"]) if c["pop"] / d["pop"] >= 0.2][:2]
        # a city spread over several counties (New York's boroughs): say which part
        if spans[(cd[:2], top["code"])] > 1 and counties and not extra:
            if city == "New York City":
                return f"New York City: {join([BOROUGHS.get(c['name'], c['name']) for c in counties])}"
            return f"Part of {city} ({join([c['name'] for c in counties])} {'County' if len(counties) == 1 else 'Counties'})"
        return join([f"Part of {city}"] + extra)
    picks = [p for p in places if share(p) >= 0.07][:3]
    if not picks or (share(top) < 0.1 and len(picks) < 2):
        return county_label(d)
    if len(picks) == 1:
        # a sliver of a big city next door says little: name the counties instead
        return county_label(d) if held < 0.5 else f"{clean(top['name'])} area"
    return join([clean(p["name"]) for p in picks])


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--congress", type=int, default=119)
    parser.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "datausa-district-labels"))
    args = parser.parse_args()

    previous = {}
    if os.path.exists(OUTPUT):
        previous = json.load(open(OUTPUT, encoding="utf8")).get("labels", {})
    new = load_districts(args.congress, args.cache)
    old = load_districts(args.congress - 1, args.cache)
    daily_kos = load_daily_kos(previous)

    totals, seen = collections.Counter(), collections.defaultdict(set)
    for cd, d in new.items():
        for p in d["places"]:
            totals[(cd[:2], p["code"])] += p["pop"]
            if d["pop"] and p["code"] != "99999" and p["pop"] / d["pop"] >= 0.5:
                seen[(cd[:2], p["code"])].update(c["name"] for c in d["counties"] if c["pop"] / d["pop"] >= 0.2)
    spans = collections.Counter({k: len(v) for k, v in seen.items()})

    canon = lambda d: (d["pop"], sorted(map(str, d["places"])), sorted(map(str, d["counties"])))  # noqa: E731
    labels, counts = {}, collections.Counter()
    for cd in sorted(new):
        d = new[cd]
        if cd.endswith("ZZ") or not d["pop"]:  # water-only "district not defined" areas
            continue
        at_large = cd.endswith(("00", "98"))
        key = f"{d['st']}-{'AL' if at_large else cd[2:]}"
        unchanged = cd in old and canon(old[cd]) == canon(d)
        computed = compute(cd, d, totals, spans)
        described = None if at_large else daily_kos.get(key)
        entry = {"key": key, "label": None, "source": None, "computed": computed, "dailykos": described, "unchanged": unchanged}
        if described and unchanged:
            entry["label"], entry["source"] = described, "dailykos"
        elif computed:
            entry["label"], entry["source"] = computed, "computed"
        counts[entry["source"] or "none"] += 1
        labels[f"50000US{cd}"] = entry

    result = {
        "_about": "Generated by scripts/districts/build-labels.py; do not edit by hand (see OVERRIDES in src/lib/dimensions/district-labels.ts).",
        "congress": args.congress,
        "generated": datetime.date.today().isoformat(),
        "sources": {
            "census": CENSUS.format(n=args.congress),
            "dailykos": DAILY_KOS_ARTICLE,
            "dailykosSheet": DAILY_KOS_SHEET
        },
        "labels": labels
    }
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(labels)} districts: {dict(counts)} -> {os.path.relpath(OUTPUT)}")


if __name__ == "__main__":
    main()
