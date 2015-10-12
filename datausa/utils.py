import requests
from config import API
from datausa import cache, app

def datafold(data):
    """List[dict]: combines the headers and data from an API call """
    return [dict(zip(data["headers"], d)) for d in data["data"]]

def fetch(attr_id, attr_type):
    """dict: Returns an attribute dict container information like 'name' and 'color' """
    attr_type = attr_type.replace("_id", "")
    if attr_type in attr_cache and attr_id in attr_cache[attr_type]:
        return attr_cache[attr_type][attr_id]
    return {"id": attr_id, "name": attr_id}

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
