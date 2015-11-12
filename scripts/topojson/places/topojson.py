import json, os, subprocess, sys

errors = {
    "01": ["16000US0126896", "16000US0163288", "16000US0119648", "16000US0174424"],
    "04": ["16000US0423620", "16000US0444270", "16000US0427400"],
    "06": ["16000US0675000", "16000US0644000", "16000US0653980", "16000US0614890"],
    "08": ["16000US0846465", "16000US0832155", "16000US0845970", "16000US0825280", "16000US0857630"],
    "12": ["16000US1250750", "16000US1247050", "16000US1212925"],
    "13": ["16000US1376756", "16000US1351492", "16000US1365044", "16000US1353060", "16000US1360340", "16000US1314500"],
    "17": ["16000US1751622", "16000US1761067", "16000US1712385", "16000US1751180", "16000US1730926", "16000US1700685", "16000US1715599", "16000US1769524", "16000US1733136", "16000US1744524", "16000US1766131", "16000US1703883"],
    "18": ["16000US1836003", "16000US1820728", "16000US1854180", "16000US1849932", "16000US1823278"],
    "21": ["16000US2158620", "16000US2154642"],
    "22": ["16000US2241155", "16000US2240735", "16000US2210075"],
    "27": ["16000US2756302", "16000US2748580"],
    "29": ["16000US2935648", "16000US2938000", "16000US2964082"],
    "31": ["16000US3137000", "16000US3128000"],
    "32": ["16000US3231900", "16000US3240000"],
    "35": ["16000US3502000", "16000US3515720", "16000US3512850"],
    "37": ["16000US3764180"],
    "39": ["16000US3915000", "16000US3922694", "16000US3907972", "16000US3918000", "16000US3985792"],
    "40": ["16000US4077050", "16000US4000200", "16000US4037800", "16000US4032750", "16000US4008725", "16000US4029600", "16000US4055000", "16000US4013950"],
    "42": ["16000US4241216"],
    "45": ["16000US4551280", "16000US4516405", "16000US4550875", "16000US4561405"],
    "47": ["16000US4760280", "16000US4708540", "16000US4750780", "16000US4741520", "16000US4770580", "16000US4716300"],
    "48": ["16000US4856000", "16000US4810768", "16000US4853388", "16000US4876000", "16000US4824000", "16000US4856348", "16000US4841464", "16000US4829336", "16000US4842016", "16000US4819000", "16000US4838020", "16000US4819624", "16000US4858820", "16000US4817648", "16000US4811368", "16000US4857644", "16000US4862870", "16000US4830416", "16000US4848372"],
    "49": ["16000US4967440"],
    "53": ["16000US5353545"],
    "55": ["16000US5537825"]
}

def topojson():

    directory = "/".join(sys.argv[0].split("/")[:-1])
    shape_dir = os.path.join(directory, "shapefiles")

    for folder in os.walk(shape_dir):
        base_dir = folder[0]
        if base_dir != shape_dir:
        # if base_dir != shape_dir and base_dir.split("/")[-1].split("_")[2] == "01":
            filename = base_dir.split("/")[-1]
            state = filename.split("_")[2]

            cmd = "topojson -s 10e-9 --id-property GEOID -o {0}/places_{1}.json -- places={2}/{3}.shp states={0}/states/cb_2013_us_state_500k.shp".format(directory, state, base_dir, filename)

            print ""
            print "State: {}".format(state)
            print cmd
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            p.wait()

            with open("{}/places_{}.json".format(directory, state), "r+") as data_file:
                data = json.load(data_file)

                state_geom = [s for s in data["objects"]["states"]["geometries"] if s["id"] == "{}".format(state)][0]
                state_geom["id"] = "04000US{}".format(state)
                del data["objects"]["states"]

                for geo in data["objects"]["places"]["geometries"]:
                    geo["id"] = "16000US{}".format(geo["id"])

                if state in errors:
                    excludes = errors[state]
                    print "Excluding: {}".format(", ".join(excludes))
                    data["objects"]["places"]["geometries"] = [g for g in data["objects"]["places"]["geometries"] if g["id"] not in excludes]

                data["objects"]["places"]["geometries"].append(state_geom)
                data_file.seek(0)
                json.dump(data, data_file)

if __name__ == '__main__':
    topojson()
