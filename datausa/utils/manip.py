import itertools, requests
from requests.models import RequestEncodingMixin
from flask import abort, url_for
from config import API, CROSSWALKS, PROFILES
from datausa import app
from datausa.consts import COLMAP
from datausa.utils.data import datafold, fetch, pivotname
from datausa.utils.format import num_format

def datapivot(data, keys, sort="desc", column_id="id", column_value="value", column_name="name"):

    if isinstance(data, list):
        data = data[0]

    combinations = itertools.product(*[COLMAP[c] for c in keys])
    columns = ["_".join(col) for col in combinations]

    moe = False
    for k in data:
        if dropfirst(k) in columns:
            moe = k.split("_")[0]
            break

    pivoted = [{column_id: dropfirst(k), column_value: v, column_name: pivotname(dropfirst(k), keys)} for k, v in data.iteritems() if dropfirst(k) in columns]
    if moe and "{}_{}_moe".format(moe, pivoted[0][column_id]) in data.keys():
        for row in pivoted:
            row["moe"] = data["{}_{}_moe".format(moe, row[column_id])]

    return sorted(pivoted, key=lambda x: x[column_value], reverse=(sort == "desc"))

def dropfirst(c):
    return "_".join(c.split("_")[1:])

def stat(params, col="name", dataset=False, data_only=False, moe=False, truncate=0):

    # convert request arguments into a url query string
    rank = int(params.pop("rank", "1"))
    if rank > 1 and params["limit"] == 1:
        params["limit"] = rank
    query = RequestEncodingMixin._encode_params(params)
    url = "{}/api?{}".format(API, query)
    stat_url = "{}?{}&col={}&dataset={}&moe={}&rank={}".format(url_for("profile.statView"), query, col, dataset, moe, str(rank))

    try:
        r = requests.get(url).json()
    except ValueError:
        app.logger.info("STAT ERROR: {}".format(url))
        return {
            "url": stat_url,
            "value": "N/A"
        }

    if data_only:
        return r
    else:
        r = datafold(r)

    if dataset == "stat":
        if isinstance(r[0][col], list):
            r = [{params["show"]:x} for x in r[0][col]]
            col = "name"

    if len(r) == 0:
        return {
            "url": stat_url,
            "value": "N/A"
        }

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

    if col in COLMAP or "-" in col:
        vals = datapivot(r, col.split("-"), sort="desc")

        if moe:
            top = [vals[rank - 1]["moe"]]
        else:
            top = [vals[rank - 1]["name"]]
            vals = [vals[rank - 1]["value"]]

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
                top = [u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr, attr_id=t[0]), t[1]) if attr != "geo" or t[0][:3] != "140" else t[1] for t in top]
            else:
                top = [t["display_name"] if "display_name" in t else t[col] for t in top]

        elif col == "id":
            top = [d[show] for d in r]
        else:
            top = [d[col] for d in r]

    if col != "id":
        if moe:
            col = moe
        top = [num_format(t, col) if isinstance(t, (int, float)) else t for t in top]

    # coerce all values to strings
    top = [u"{}".format(t) if t != "" else u"N/A" for t in top]

    if col == "id":
        top = ",".join(top)
    else:
        num_items = len(top)
        
        if truncate and num_items > truncate:
            top, rest = top[:int(truncate)], top[int(truncate):]
            # now stringify
            top = "{}; <a href='#' class='show-more'>and {} more</a>".format(u"; ".join(top), len(rest))
            if len(rest) > 1:
                rest = u"; ".join(rest)
            else:
                rest = u"and {}".join(rest[-1])
            top = "<span>{}</span><span class='the_rest'>{}</span>".format(top, rest)
        
        else:
            if num_items > 1:
                top[-1] = u"and {}".format(top[-1])
            if num_items == 2:
                top = u" and ".join(top)
            else:
                top = u"; ".join(top)

    # otherwise, return the list joined with commans
    return {
        "url": stat_url,
        "value": top,
        "data": vals
    }
