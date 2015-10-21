import json, os, requests

API = os.environ.get("DATAUSA_API", "http://usa.datawheel.us:5000")

def read_json():

    oec = {c["id"]: c["name"] for c in requests.get("http://atlas.media.mit.edu/attr/country/").json()["data"]}
    usa = {c[1]: c[0] for c in requests.get("{}/attrs/birthplace/".format(API)).json()["data"]}

    with open('datausa/static/topojson/countries.json', 'r+') as data_file:
        data = json.load(data_file)
        for geo in data["objects"]["countries"]["geometries"]:
            if geo["id"] in oec:
                name = oec[geo["id"]]
                if name in usa:
                    new_id = usa[name]
                    print u"Matched {} to {}".format(geo["id"], new_id)
                    geo["id"] = str(new_id)
                    geo["matched"] = "1"
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    read_json()
