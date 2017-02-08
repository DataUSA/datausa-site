import os, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    source = os.path.join(directory, "shapefiles/cb_2015_us_county_500k.shp")
    # source = os.path.join(directory, "shapefiles/cb_2015_us_county_5m.shp")

    cmds = []

    cmds.append(("geo2topo -n counties=<("
        "shp2json -n {0} "
            "| ndjson-map 'd.id = \\\"05000US\\\" + d.properties.GEOID, delete d.properties, d') "
        "| topoquantize 1e7 "
        "| toposimplify -p 0.001 -f "
        "> {1}/counties.json"
        ).format(source, directory))

    os.system("""echo "{}" | pbcopy""".format(" && ".join(cmds)))
    print "Command copied to clipboard, please press CMD+V to run."

if __name__ == '__main__':
    topojson()
