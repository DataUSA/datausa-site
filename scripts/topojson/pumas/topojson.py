import json, os, subprocess, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    shape_dir = os.path.join(directory, "shapefiles")
    cmd = "topojson -s 10e-9 -o {}/pumas.json --id-property GEOID10 -- ".format(directory)

    for folder in os.walk(shape_dir):
        base_dir = folder[0]
        if base_dir != shape_dir:
            filename = base_dir.split("/")[-1]
            state = filename.split("_")[2]
            cmd += "{}={}/{}.shp ".format(state, base_dir, filename)

    print cmd
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()

    with open(os.path.join(directory, "pumas.json"), "r+") as data_file:
        data = json.load(data_file)
        geoms = []
        for key, value in data["objects"].iteritems():
            for g in value["geometries"]:
                g["id"] = "79500US{}".format(g["id"])
            geoms += value["geometries"]

        data["objects"] = {
            "pumas": {
                "bbox": [],
                "geometries": geoms,
                "type": "GeometryCollection"
            }
        }
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
