import json, os, subprocess, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    shape_dir = os.path.join(directory, "shapefiles")
    for folder in os.walk(shape_dir):
        base_dir = folder[0]
        if base_dir != shape_dir:
            filename = base_dir.split("/")[-1]
            state = filename.split("_")[2]

            cmd = "topojson -s 10e-10 --id-property GEOID -o {}/places_{}.json places={}/{}.shp".format(directory, state, base_dir, filename)
            print cmd
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            p.wait()

            with open("{}/places_{}.json".format(directory, state), "r+") as data_file:
                data = json.load(data_file)
                for geo in data["objects"]["places"]["geometries"]:
                    geo["id"] = "16000US{}".format(geo["id"])
                data_file.seek(0)
                json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
