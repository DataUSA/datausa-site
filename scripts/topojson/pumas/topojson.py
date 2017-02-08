import os, re, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    shape_dir = os.path.join(directory, "shapefiles")

    pumas = []
    for filename in [f for f in os.listdir(shape_dir) if re.match(r'.+\.shp$', f)]:
        # if "2015_25" in filename or "2015_36" in filename:
        pumas.append("shp2json -n {}/{} | ndjson-map 'd.id = \\\"79500US\\\" + d.properties.GEOID10, delete d.properties, d'".format(shape_dir, filename))

    cmd = "geo2topo -n pumas=<({}) | topoquantize 1e7 | toposimplify -p 0.0005 -f > {}".format("; ".join(pumas), os.path.join(directory, "pumas.json"))

    # print cmd

    os.system("""echo "{}" | pbcopy""".format(cmd))

    print "Command copied to clipboard, please press CMD+V to run."

if __name__ == '__main__':
    topojson()
