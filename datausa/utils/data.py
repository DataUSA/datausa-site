import itertools, requests
from requests.models import RequestEncodingMixin
from flask import url_for
from config import API, PROFILES
from datausa import cache, app
from datausa.utils.format import num_format

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
    if attr_type in attr_cache and attr_id in attr_cache[attr_type]:
        return attr_cache[attr_type][attr_id]
    return {"id": attr_id, "name": attr_id}

def stat(params, col="name", dataset=False):

    # convert request arguments into a url query string
    query = RequestEncodingMixin._encode_params(params)

    try:
        r = datafold(requests.get("{}/api?{}".format(API, query)).json())
    except ValueError:
        app.logger.info("ERROR: Requesting stat: /api?{}".format(query))
        raise Exception(params)

    app.logger.info("Requested stat: /api?{}".format(query))

    # if the output key is 'name', fetch attributes for each return and create an array of 'name' values
    # else create an array of the output key for each returned datapoint
    if col in col_map or "-" in col:
        def drop_first(c):
            return "_".join(c.split("_")[1:])
        keys = col.split("-")
        cols = ["_".join(c) for c in list(itertools.product(*[col_map[c] for c in keys]))]
        vals = [drop_first(max(d, key=lambda x: d[x] if "_" in x and drop_first(x) in cols else 0)) for d in r]
        vals = [fetch(col_map[keys[i]][v], keys[i]) for x in vals for i, v in enumerate(x.split("_"))]
        top = [" ".join([v["name"] for v in vals])]
    elif col == "name":
        if dataset:
            attr = "{}_{}".format(dataset, params["show"])
        else:
            attr = params["show"]

        top = [fetch(d[params["show"]], attr) for d in r]

        if attr in PROFILES:
            top = ["<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr, attr_id=t["id"]), t[col]) for t in top]
        else:
            top = [t[col] for t in top]

    else:
        top = [d[col] for d in r]

    top = [num_format(t, col) if isinstance(t, (int, float)) else t for t in top]

    # coerce all values to strings
    top = [str(t) if t != "" else "N/A" for t in top]

    # if there's more than 1 value, prefix the last string with 'and'
    if len(top) > 1:
        top[-1] = "and {}".format(top[-1])

    # if there's only 2 values, return the list joined with a space
    if len(top) == 2:
        return " ".join(top)

    # otherwise, return the list joined with commans
    return {
        "url": "{}?{}&col={}&dataset={}".format(url_for("profile.stat"), query, col, dataset),
        "value": ", ".join(top)
    }

# create a mapping for splitting demographic columns
col_map = {
    "sex": {
        "men": "1",
        "women": "2"
    },
    "race": {
        "white": "1",
        "black": "2",
        "native": "3",
        "asian": "6",
        "hispanic": "11",
        "hawaiian": "7",
        "multi": "9",
        "unknown": "8"
    }
}

@cache.memoize()
def build_attr_cache():
    app.logger.info("Loading attr data from API...")
    req = requests.get("{}/attrs/list".format(API))
    response_json = req.json()
    attr_names = response_json["data"]

    results = {}

    for attr_name in attr_names:
        app.logger.info("Loading attr data for: {}".format(attr_name))

        r = requests.get("{}/attrs/{}".format(API, attr_name))
        attr_list = datafold(r.json())
        results[attr_name] = {obj["id"]: obj for obj in attr_list}
    app.logger.info("Attr cache setup complete.")
    return results

attr_cache = build_attr_cache()
