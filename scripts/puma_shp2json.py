import json, os, subprocess, sys

def read_files():

    directory = sys.argv[1]
    folders = os.walk(directory)
    cmd = "topojson -o {} --id-property GEOID10 -- ".format(os.path.join(directory, "pumas.json"))
    print cmd
    for folder in folders:
        base_dir = folder[0]
        if base_dir != directory:
            filename = base_dir.split("/")[-1]
            id_num = filename.split("_")[2]
            if id_num == "25":
                id_num = "pumas"
            cmd += "{}={} ".format(id_num, os.path.join(base_dir, "{}.shp".format(filename)))
    print cmd
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()

    with open(os.path.join(directory, "pumas.json"), 'r+') as data_file:
        data = json.load(data_file)
        geoms = []
        bbox = [0,0,0,0]
        for key, value in data["objects"].iteritems():
            for g in value["geometries"]:
                g["id"] = "79500US{}".format(g["id"])
            geoms += value["geometries"]
            box = value["bbox"]
            if box[0] < bbox[0]:
                bbox[0] = box[0]
            if box[1] > bbox[1]:
                bbox[1] = box[1]
            if box[2] < bbox[2]:
                bbox[2] = box[2]
            if box[3] > bbox[3]:
                bbox[3] = box[3]

        print bbox

        data["objects"] = {
            "pumas": {
                "bbox": bbox,
                "geometries": geoms,
                "type": "GeometryCollection"
            }
        }
        data_file.seek(0)
        json.dump(data, data_file)

if __name__ == '__main__':
    read_files()
