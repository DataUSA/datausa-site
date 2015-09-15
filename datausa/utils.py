import requests
from config import API

def datafold(data):
    """List[dict]: combines the headers and data from an API call """
    return [dict(zip(data["headers"], d)) for d in data["data"]]

def fetch(attr_id, attr_type):
    """dict: Returns an attribute dict container information like 'name' and 'color' """

    """ strip out '_id' if it is present in 'attr_type' """
    attr_type = attr_type.replace("_id", "")

    """ make an API request to get the specific attribute """
    r = requests.get("{}/attrs/{}/{}".format(API, attr_type, attr_id))

    """ if no attribute was returned, create a dummy dict with 'name' set to id """
    if r.status_code != requests.codes.ok:
        return {
            "id": attr_id,
            "name": attr_id
        }

    return datafold(r.json())[0]
