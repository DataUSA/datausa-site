import itertools, requests
from requests.models import RequestEncodingMixin
from flask import abort, url_for
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
    else:
        app.logger.info("Missing {} attribute: {}".format(attr_type, attr_id))
        abort(404)

def default_params(params):

    params["sumlevel"] = params.get("sumlevel", "all")
    params["year"] = params.get("year", 2013)
    params["sort"] = params.get("sort", "desc")
    params["order"] = params.get("order", "")
    params["exclude"] = params.get("exclude", "")
    params["required"] = params.get("required", params["order"])

    if params["show"] == "skill":
        del params["year"]

    return params

def stat(params, col="name", dataset=False, data_only=False):

    # convert request arguments into a url query string
    query = RequestEncodingMixin._encode_params(params)
    url = "{}/api?{}".format(API, query)

    try:
        r = requests.get(url).json()
    except ValueError:
        app.logger.info("STAT ERROR: {}".format(url))
        raise Exception(url)

    if data_only:
        return r
    else:
        r = datafold(r)

    app.logger.info("Requested stat: {}".format(url))

    # if the output key is 'name', fetch attributes for each return and create an array of 'name' values
    # else create an array of the output key for each returned datapoint
    if col == "ratio":
        denom = max([d[params["order"]] for d in r[1:]])
        return num_format(r[0][params["order"]]/denom, key=col)
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
    elif col == "id":
        top = [d[params["show"]] for d in r]
    else:
        top = [d[col] for d in r]

    top = [num_format(t, col) if isinstance(t, (int, float)) else t for t in top]

    # coerce all values to strings
    top = [str(t) if t != "" else "N/A" for t in top]

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
        "url": "{}?{}&col={}&dataset={}".format(url_for("profile.stat"), query, col, dataset),
        "value": top
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
