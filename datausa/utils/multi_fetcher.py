import requests
from requests.models import RequestEncodingMixin

from flask import url_for
from config import API, CROSSWALKS, PROFILES
from datausa.utils.format import num_format
from datausa import app
from datausa.utils.data import attr_cache, fetch

# lookup_map = {
#     "birthplace": True,
#     "language": True
# }


def render_col(my_data, headers, col):
    value = my_data[headers.index(col)]
    if not value:
        return "N/A"

    attr_type = col
    if "_iocode" in col:
        attr_type = "iocode"

    if attr_type not in attr_cache:
        # do simple number formating
        return num_format(value, col)
    else:
        # lookup the attr object and get the name
        attr = fetch(value, attr_type)
        attr = attr["display_name"] if "display_name" in attr else attr["name"]
        if attr_type in PROFILES or attr_type in CROSSWALKS:\
            attr = u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr_type, attr_id=value), attr)
        return attr


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
    cols = params.pop("required")
    params["required"] = ",".join(cols)
    namespace = params.pop("namespace")
    query = RequestEncodingMixin._encode_params(params)
    url = "{}/api?{}".format(API, query).replace("%3C%3Cid%3E%3E", profile.id)
    try:
        r = requests.get(url).json()
    except ValueError:
        app.logger.info("STAT ERROR: {}".format(url))
        return {
            "url": "N/A",
            "value": "N/A"
        }
    if not rows:
        if not r["data"]:
            return {}
        api_data = r["data"][0]
    else:
        api_data = r["data"]
    headers = r["headers"]
    moi = {namespace: {} if not rows else []}

    if not rows:
        for col in cols:
            moi[namespace][col] = render_col(api_data, headers, col)
    else:
        for data_row in api_data:
            myobject = {}
            for col in cols:
                myobject[col] = render_col(data_row, headers, col)
            moi[namespace].append(myobject)
    return moi
