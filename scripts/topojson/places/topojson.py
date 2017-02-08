import os, re, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    shape_dir = os.path.join(directory, "shapefiles")

    cmds = []

    for filename in [f for f in os.listdir(shape_dir) if re.match(r'.+\.shp$', f)]:

        state = filename.split("_")[2]
        cmds.append(("geo2topo -n places=<("
            "shp2json -n {0}/{1} "
                "| ndjson-map 'd.id = \\\"16000US\\\" + d.properties.GEOID, delete d.properties, d'; "
            "shp2json -n {2}/states/cb_2013_us_state_500k.shp "
                "| ndjson-map 'd.id = \\\"04000US\\\" + d.properties.GEOID, delete d.properties, d' "
                "| ndjson-filter 'd.id === \\\"04000US{3}\\\"') "
            "| topoquantize 1e7 "
            "| toposimplify -p 0.0005 -f "
            "> {2}/places_{3}.json"
            ).format(shape_dir, filename, directory, state))

    os.system("""echo "{}" | pbcopy""".format(" && ".join(cmds)))
    print "Command copied to clipboard, please press CMD+V to run."

if __name__ == '__main__':
    topojson()
