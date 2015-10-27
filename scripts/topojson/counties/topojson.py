import json, os, subprocess, sys

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    source = "shapefiles/cb_2013_us_county_500k.shp"
    cmd = "topojson -s 10e-8 --id-property GEOID -o {0}/counties.json counties={0}/{1}".format(directory, source)
    print cmd
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()

    with open("{}/counties.json".format(directory), "r+") as data_file:
        data = json.load(data_file)
        for geo in data["objects"]["counties"]["geometries"]:
            geo["id"] = "05000US{}".format(geo["id"])
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
