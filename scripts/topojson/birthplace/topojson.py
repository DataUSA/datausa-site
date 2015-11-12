# -*- coding: utf-8 -*-
import json, os, requests, subprocess, sys

API = os.environ.get("DATAUSA_API", "http://postgres.datawheel.us")

def topojson():

    usa = {c[0]: c[1] for c in requests.get("{}/attrs/birthplace/".format(API)).json()["data"] if c[0]}

    directory = "/".join(sys.argv[0].split("/")[:-1])
    source = "shapefiles/ne_10m_admin_0_countries.shp"
    cmd = "topojson -s 10e-7 --id-property ADM0_A3 -o {0}/birthplace.json birthplace={0}/{1}".format(directory, source)
    print cmd
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()

    with open("{}/birthplace.json".format(directory), "r+") as data_file:
        data = json.load(data_file)
        geoms = []
        # print "id,name"
        for geo in data["objects"]["birthplace"]["geometries"]:
            if geo["id"] in usa:
                geo["id"] = usa[geo["id"]]
                geoms.append(geo)
            # else:
            #     print u"{},{}".format(geo["id"], geo["properties"]["NAME"])
        data["objects"]["birthplace"]["geometries"] = geoms
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
