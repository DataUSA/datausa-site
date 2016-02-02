import os, requests, yaml
from config import API, basedir, CROSSWALKS, PROFILES
from datausa import cache, app
from datausa.consts import COLMAP, DICTIONARY

def datafold(data):
    """List[dict]: combines the headers and data from an API call """
    return [dict(zip(data["headers"], d)) for d in data["data"]]

def datasplit(data):
    data = [v for (k,v) in data.items()]
    headers = [k for (k,v) in data[0].items()]
    data = [[v for (k, v) in d.items()] for d in data]
    return {"data": data, "headers": headers}

def fetch(attr_id, attr_type):
    """dict: Returns an attribute dict container information like 'name' and 'color' """
    if isinstance(attr_type, basestring) and "_iocode" in attr_type:
        attr_type = "iocode"
    if attr_type in attr_cache and attr_id in attr_cache[attr_type]:
        return attr_cache[attr_type][attr_id]
    else:
        if attr_id in DICTIONARY:
            name = DICTIONARY[attr_id]
        elif attr_type == "geo" and attr_id[:3] == "140":
            prefix = attr_id[13:][:3]
            suffix = attr_id[16:]
            if suffix == "00":
                suffix = ""
            else:
                suffix = ".{}".format(suffix)
            name = "Census Tract {}{}".format(prefix, suffix)
        else:
            name = "N/A"
        return {
            "id": attr_id,
            "name": name
        }

def pivotname(id_string, keys):
    names = [COLMAP[keys[i]][v] for i, v in enumerate(id_string.split("_"))]
    for i, v in enumerate(names):
        if keys[i] in attr_cache:
            v = fetch(v, keys[i])
            names[i] = v["display_name"] if "display_name" in v else v["name"]
    return " ".join(names)

@cache.memoize()
def get_parents(attr_id, attr_type):
    """get parents from API"""
    url = "{}/attrs/{}/{}/parents".format(API, attr_type, attr_id)
    try:
        return datafold(requests.get(url).json())
    except ValueError:
        return []


@cache.memoize()
def get_children(attr_id, attr_type, sumlevel=None):
    url = "{}/attrs/{}/{}/children/".format(API, attr_type, attr_id)
    if sumlevel:
        url = "{}?sumlevel={}".format(url, sumlevel)
    try:
        return datafold(requests.get(url).json())
    except ValueError:
        return ""


def acs_crosswalk(attr_type, attr_id):
    url = "{}/attrs/crosswalk/{}/{}/".format(API, attr_type, attr_id)
    try:
        data = requests.get(url)
        results = datafold(data.json())
        return [fetch(row["attr_id"], row["attr_kind"]) for row in results]
    except ValueError:
        return []

@cache.memoize()
def build_attr_cache():
    app.logger.info("Loading attr data from API...")
    print "{}/attrs/list".format(API)
    req = requests.get("{}/attrs/list".format(API))
    response_json = req.json()
    attr_names = response_json["data"]

    results = {}

    for attr_name in attr_names:

        try:
            r = requests.get("{}/attrs/{}".format(API, attr_name))
            attr_list = datafold(r.json())
            app.logger.info("Loaded {} attributes for: {}".format(len(attr_list), attr_name))
            results[attr_name] = {}
            for obj in attr_list:
                oid = obj["id"]
                url_name = obj["url_name"] if "url_name" in obj else None
                if oid not in results[attr_name] or results[attr_name][oid]["level"] > obj["level"]:
                    results[attr_name][oid] = obj
                    if url_name:
                        new_obj = obj.copy()
                        new_obj['pretty'] = True
                        results[attr_name][url_name] = new_obj
        except Exception, err:
            app.logger.info("ERROR: Could not load {} attributes. Reason: {}".format(attr_name, err))

    app.logger.info("Attr cache setup complete.")
    return results

attr_cache = build_attr_cache()

@cache.memoize()
def build_profile_cache():
    profile_path = os.path.join(basedir, "datausa/profile")
    profiles = {}

    ranks = requests.get("{}/attrs/ranks/".format(API)).json()["data"]

    for p in PROFILES:
        profiles[p] = {"sections": [], "ranks": ranks[p]}
        splash_path = os.path.join(profile_path, p, "splash.yml")
        splash = yaml.load("".join(open(splash_path).readlines()))
        sections = splash["sections"]
        for s in sections:
            section_path = os.path.join(profile_path, p, "{}.yml".format(s))
            section_data = yaml.load("".join(open(section_path).readlines()))
            profiles[p]["sections"].append({"anchor": s, "title": section_data["title"], "description": section_data["description"]})
        app.logger.info("Loaded {} profile anchors for: {}".format(len(profiles[p]["sections"]), p))
    return profiles

def geo_neighbors(geo_id):
    url = "{}/attrs/geo/{}/neighbors/".format(API, geo_id)
    try:
        data = requests.get(url)
        results = datafold(data.json())
        return [fetch(row["neighbor"], "geo") for row in results]
    except ValueError:
        return []

profile_cache = build_profile_cache()
