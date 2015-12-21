import requests
from requests.models import RequestEncodingMixin

from flask import url_for
from config import API, CROSSWALKS, PROFILES
from datausa.utils.format import num_format
from datausa import app
from datausa.utils.data import attr_cache, datafold, fetch
from datausa.utils.manip import datapivot

# lookup_map = {
#     "birthplace": True,
#     "language": True
# }


def render_col(my_data, headers, col, url=False):
    value = my_data[headers.index(col)]
    if not value:
        return "N/A"

    attr_type = col
    if "_iocode" in col:
        attr_type = "iocode"

    if attr_type not in attr_cache:
        if isinstance(value, basestring):
            return_value = value
        else:
            # do simple number formating
            return_value = num_format(value, col)
    else:
        # lookup the attr object and get the name
        attr = fetch(value, attr_type)
        attr = attr["display_name"] if "display_name" in attr else attr["name"]
        if attr_type in PROFILES or attr_type in CROSSWALKS:
            attr = u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr_type, attr_id=value), attr)
        return_value = attr

    if url:
        return_value = u"<span data-url='{}'>{}</span>".format(url, return_value)
    return return_value


def merge_dicts(*dict_args):
    '''
    Given any number of dicts, shallow copy and merge into a new dict,
    precedence goes to key value pairs in latter dicts.
    '''
    result = {}
    for dictionary in dict_args:
        result.update(dictionary)
    return result


def multi_col_top(profile, params):
    attr_type = params.get("attr_type", profile.attr_type)
    rows = params.pop("rows", False)
    params["show"] = params.get("show", attr_type)
    params["limit"] = params.get("limit", 1)
    params["sumlevel"] = params.get("sumlevel", "all")
    params["sort"] = params.get("sort", "desc")
    if attr_type not in params:
        params[attr_type] = profile.id
    cols = params.pop("required", [])
    params["required"] = ",".join(cols)
    namespace = params.pop("namespace")
    pivot = params.pop("pivot", False)
    query = RequestEncodingMixin._encode_params(params)

    ''' replace when variable functions work in vars! '''
    url = u"{}/api?{}".format(API, query).replace("%3C%3Cid%3E%3E", profile.id)
    '''  '''

    try:
        r = requests.get(url).json()
    except ValueError:
        app.logger.info("STAT ERROR: {}".format(url))
        return {
            "url": "N/A",
            "value": "N/A"
        }

    headers = r["headers"]
    return_obj = {namespace: {} if not rows else []}

    if pivot:

        base_url = u"{}?{}&col={}".format(url_for("profile.statView"), query, "-".join(pivot["keys"]))

        limit = pivot.get("limit", 1)
        cols = pivot["cols"]
        api_data = datapivot(datafold(r)[0], pivot["keys"])[:limit]

        if rows:
            myobject = {}
            for index, data_row in enumerate(api_data):
                myobject = {}
                headers = data_row.keys()
                values = data_row.values()
                for col in cols:
                    stat_url = u"{}&rank={}".format(base_url, index + 1)
                    myobject[col] = render_col(values, headers, col, stat_url)
                return_obj[namespace].append(myobject)
        else:
            values = api_data[0].values()
            headers = api_data[0].keys()
            stat_url = u"{}&rank=1".format(base_url)
            for col in cols:
                return_obj[namespace][col] = render_col(values, headers, col, stat_url)

    elif not rows:
        if not r["data"]:
            return {}
        api_data = r["data"][0]
        for col in cols:
            return_obj[namespace][col] = render_col(api_data, headers, col)
    else:
        for data_row in r["data"]:
            myobject = {}
            for col in cols:
                myobject[col] = render_col(data_row, headers, col)
            return_obj[namespace].append(myobject)

    return return_obj
