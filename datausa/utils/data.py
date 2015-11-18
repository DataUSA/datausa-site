import itertools, os, requests, yaml
from requests.models import RequestEncodingMixin
from flask import abort, url_for
from config import API, basedir, CROSSWALKS, PROFILES
from datausa import cache, app
from datausa.utils.format import dictionary, num_format


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
    if isinstance(attr_type, str) and "_iocode" in attr_type:
        attr_type = "iocode"
    if attr_type in attr_cache and attr_id in attr_cache[attr_type]:
        return attr_cache[attr_type][attr_id]
    else:
        name = dictionary[attr_id] if attr_id in dictionary else "N/A"
        return {
            "id": attr_id,
            "name": name
        }

def default_params(params):

    params["sumlevel"] = params.get("sumlevel", "all")
    params["year"] = params.get("year", "latest")
    params["sort"] = params.get("sort", "desc")
    params["order"] = params.get("order", "")
    params["exclude"] = params.get("exclude", "")
    if "force" not in params:
        params["required"] = params.get("required", params["order"])

    if "show" in params and params["show"] == "skill" or params["year"] == "none":
        del params["year"]

    return params


@cache.memoize()
def get_parents(attr_id, attr_type):
    """get parents from API"""
    url = "{}/attrs/{}/{}/parents".format(API, attr_type, attr_id)
    try:
        return datafold(requests.get(url).json())
    except ValueError:
        return []


def stat(params, col="name", dataset=False, data_only=False, moe=False):

    # convert request arguments into a url query string
    rank = int(params.pop("rank", "1"))
    if rank > 1 and params["limit"] == 1:
        params["limit"] = rank
    unformatted = params.pop("unformatted", False)
    query = RequestEncodingMixin._encode_params(params)
    url = "{}/api?{}".format(API, query)

    try:
        r = requests.get(url).json()
    except ValueError:
        if params["force"] == "ipeds.grads_yg":
            raise Exception(url)
        app.logger.info("STAT ERROR: {}".format(url))
        return {
            "url": "{}?{}&col={}&dataset={}".format(url_for("profile.statView"), query, col, dataset),
            "value": "N/A"
        }

    if data_only:
        return r
    else:
        r = datafold(r)

    # if the output key is 'name', fetch attributes for each return and create an array of 'name' values
    # else create an array of the output key for each returned datapoint
    vals = []
    show = params["show"].split(",")[-1]
    if col == "ratio":
        if params["limit"] == 1:
            vals = sorted([v for k, v in r[0].iteritems() if k in params["required"].split(",")], reverse=True)
            if vals[0] == 0 or vals[1] == 0:
                val = 0
            else:
                val = vals[0]/vals[1]
            return num_format(val, key=col)
        else:
            denom = max([d[params["order"]] for d in r[1:]])
            return num_format(r[0][params["order"]]/denom, key=col)


    if col == "diff":
        return num_format(r[0][params["order"]] - r[1][params["order"]], key=col)

    if col in col_map or "-" in col:
        r = [r[0]]
        def drop_first(c):
            return "_".join(c.split("_")[1:])
        keys = col.split("-")
        cols = ["_".join(c) for c in list(itertools.product(*[col_map[c] for c in keys]))]
        vals = [sorted([(k, v) for k, v in d.iteritems() if drop_first(k) in cols], key=lambda x: x[1], reverse=True) for d in r]

        if moe:
            top = [r[0]["{}_moe".format(v[0][0])] for v in vals]
        else:
            top = [drop_first(v[rank - 1][0]) for v in vals]
            vals = [v[rank - 1][1] for v in vals]
            top = [col_map[keys[i]][v] for x in top for i, v in enumerate(x.split("_"))]
            for i, v in enumerate(top):
                if keys[i] in attr_cache:
                    v = fetch(v, keys[i])
                    top[i] = v["display_name"] if "display_name" in v else v["name"]
            top = [" ".join(top)]
    else:
        if rank > 1:
            r = r[rank-1:]

        if moe:
            top = [d[moe] for d in r]
        elif col == "name":
            if dataset in ["acs", "pums"]:
                attr = "{}_{}".format(dataset, show)
            else:
                attr = show

            top = [fetch(d[show], attr) for d in r]

            if attr in PROFILES or attr in CROSSWALKS:
                top = [(t["id"], t["display_name"]) if "display_name" in t else (t["id"], t[col]) for t in top]
                top = ["<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr, attr_id=t[0]), t[1]) for t in top]
            else:
                top = [t["display_name"] if "display_name" in t else t[col] for t in top]

        elif col == "id":
            top = [d[show] for d in r]
        else:
            top = [d[col] for d in r]

    if unformatted:
        return top

    if col != "id":
        if moe:
            col = moe
        top = [num_format(t, col) if isinstance(t, (int, float)) else t for t in top]

    # coerce all values to strings
    top = [u"{}".format(t) if t != "" else u"N/A" for t in top]

    if col == "id":
        top = ",".join(top)
    else:
        # list creation for non-ids
        if len(top) > 1:
            top[-1] = "and {}".format(top[-1])

        if len(top) == 2:
            top = " ".join(top)
        else:
            top = ", ".join(top)

    # otherwise, return the list joined with commans
    return {
        "url": "{}?{}&col={}&dataset={}&moe=".format(url_for("profile.statView"), query, col, dataset, moe),
        "value": top,
        "data": vals
    }

def acs_crosswalk(attr_type, attr_id):
    url = "{}/attrs/crosswalk/{}/{}/".format(API, attr_type, attr_id)
    try:
        data = requests.get(url)
        results = datafold(data.json())
        return [fetch(row["attr_id"], row["attr_kind"]) for row in results]
    except ValueError:
        return []

# create a mapping for splitting demographic columns
col_map = {
    "sex": {
        "men": "1",
        "women": "2",
        "male": "1",
        "female": "2"
    },
    "race": {
        "white": "1",
        "black": "2",
        "native": "3",
        "asian": "6",
        "hispanic": "11",
        "latino": "11",
        "hawaiian": "7",
        "multi": "9",
        "2ormore": "9",
        "unknown": "8",
        "other": "8"
    },
    "ageBucket": {
        "under5": "< 5",
        "5": "5",
        "6to11": "6-11",
        "12to14": "12-14",
        "15": "15",
        "16to17": "16-17",
        "18to24": "18-24",
        "25to34": "25-34",
        "35to44": "35-44",
        "45to54": "45-54",
        "55to64": "55-64",
        "65to74": "65-74",
        "75over": "75+"
    },
    "incomeBucket": {
        "under10": "< $10k",
        "10to15": "$10-$15k",
        "15to20": "$15-$20k",
        "20to25": "$20-$25k",
        "25to30": "$25-$30k",
        "30to35": "$30-$35k",
        "35to40": "$35-$40k",
        "40to45": "$40-$45k",
        "45to50": "$45-$50k",
        "50to60": "$50-$60k",
        "60to75": "$60-$75k",
        "75to100": "$75-$100k",
        "100to125": "$100-$125k",
        "125to150": "$125-$150k",
        "150to200": "$150-$200k",
        "200over": "$200k+"
    },
    "propertyvalBucket": {
        "less10k": "< $10k",
        "10kto15k": "$10k-$15k",
        "15kto20k": "$15k-$20k",
        "20kto25k": "$20k-$25k",
        "25kto30k": "$25k-$30k",
        "30kto35k": "$30k-$35k",
        "35kto40k": "$35k-$40k",
        "40kto50k": "$40k-$50k",
        "50kto60k": "$50k-$60k",
        "60kto70k": "$60k-$70k",
        "80kto90k": "$80k-$90k",
        "90kto100k": "$90k-$100k",
        "100kto125k": "$100k-$125k",
        "150kto175k": "$150k-$175k",
        "175kto200k": "$175k-$200k",
        "200kto250k": "$200k-$250k",
        "250kto300k": "$250k-$300k",
        "300kto400k": "$300k-$400k",
        "400kto500k": "$400k-$500k",
        "500kto750k": "$500k-$750k",
        "750kto1M": "$750k-$1M",
        "1Mover": "$1M+"
    },
    "propertytaxBucket": {
        "none": "$0",
        "less800": "< $800",
        "800to1500": "$800-$1.5k",
        "1500to2000": "$1.5k-$2k",
        "2000to3000": "$2k-$3k",
        "3000over": "$3k+"
    },
    "conflict": {
        "wwii": "1",
        "korea": "2",
        "vietnam": "3",
        "gulf90s": "4",
        "gulf01": "5"
    },
    "vehicles": {
        "none": "0",
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5over": "5+"
    },
    "transport": {
        "drove": "Drove Alone",
        "carpooled": "Carpooled",
        "cartruckorvan": "Truck or Van",
        "publictrans": "Public Transit",
        "bicycle": "Bicycle",
        "walked": "Walked",
        "other": "Other",
        "home": "Work at Home",
        "motorcycle": "Motorcycle",
        "taxi": "Taxi"
    }
}
col_map["acs_race"] = col_map["race"]
col_map["pums_race"] = col_map["race"]

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
            results[attr_name] = {obj["id"]: obj for obj in attr_list}
        except:
            app.logger.info("ERROR: Could not load {} attributes".format(attr_name))

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

profile_cache = build_profile_cache()
