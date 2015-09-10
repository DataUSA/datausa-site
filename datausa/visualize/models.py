import json, urllib
from config import API

class Viz(object):

    def __init__(self, params):
        self.color = params.pop("color", None)
        self.type = params.pop("type")
        self.size = params.pop("size", None)
        self.x = params.pop("x", None)
        self.y = params.pop("y", None)
        self.order = params.get("order", None)

        params["sumlevel"] = params.get("sumlevel", "all")
        params["year"] = params.get("year", 2013)
        params["sort"] = params.get("sort", "desc")

        self.required = filter(None, [self.size, self.x, self.y, self.order])
        self.params = params

    def attr_url(self):
        if self.params["show"] not in ["age"]:
            return "{}/attrs/{}/".format(API, self.params["show"])
        return None

    def data_url(self):
        return "{}/api/?{}&required={}".format(API, urllib.urlencode(self.params), ",".join(self.required))

    def serialize(self):
        return json.dumps({
            "attr_type": self.params["show"],
            "attr_url": self.attr_url(),
            "color": self.color,
            "data_url": self.data_url(),
            "order": self.order,
            "size": self.size,
            "tooltip": self.required,
            "type": self.type,
            "x": self.x,
            "y": self.y
        })
