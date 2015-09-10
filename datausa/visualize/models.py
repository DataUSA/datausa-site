import json, urllib
from config import API

class Viz(object):

    def __init__(self, params):
        self.color = params.pop("color", None)
        self.type = params.pop("type")
        self.size = params.pop("size", None)
        self.x = params.pop("x", None)
        self.y = params.pop("y", None)

        params["sumlevel"] = params.get("sumlevel", "all")
        params["year"] = params.get("year", 2013)
        self.params = params

    def attr_url(self):
        return "{}/attrs/{}/".format(API, self.params["show"])

    def data_url(self):
        required = ",".join(filter(None, [self.size, self.x, self.y]))
        return "{}/api/?{}&required={}".format(API, urllib.urlencode(self.params), required)

    def serialize(self):
        return json.dumps({
            "attr_type": self.params["show"],
            "attr_url": self.attr_url(),
            "color": self.color,
            "data_url": self.data_url(),
            "size": self.size,
            "type": self.type,
            "x": self.x,
            "y": self.y
        })
