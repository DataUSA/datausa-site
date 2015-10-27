import json, os, subprocess, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    source = "shapefiles/cb_2013_us_state_500k.shp"
    cmd = "topojson -s 10e-10 --id-property GEOID -o {0}/states.json states={0}/{1}".format(directory, source)
    print cmd
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()

    with open("{}/states.json".format(directory), "r+") as data_file:
        data = json.load(data_file)
        for geo in data["objects"]["states"]["geometries"]:
            geo["id"] = "04000US{}".format(geo["id"])
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
