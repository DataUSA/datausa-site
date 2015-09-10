import requests
from config import API

def datafold(data):
    return [dict(zip(data["headers"], d)) for d in data["data"]]

def fetch(attr_id, attr_type):
    r = requests.get("{}/attrs/{}/{}".format(API, attr_type, attr_id))
    if r.status_code != requests.codes.ok:
        return None
    return datafold(r.json())[0]
