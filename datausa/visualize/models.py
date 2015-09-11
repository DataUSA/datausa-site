import json, urllib
from config import API

class Viz(object):

    def __init__(self, params):

        data = params.pop("data") if isinstance(params["data"], list) else [params.pop("data")]
        self.data = []
        for d in data:

            data_obj = {
                "split": d.pop("split", None),
                "static": d.pop("static", None)
            }

            # Set fallback API parameters
            d["sumlevel"] = d.get("sumlevel", "all")
            d["year"] = d.get("year", 2013)
            d["sort"] = d.get("sort", "desc")
            d["order"] = d.get("order", "")
            d["required"] = d.get("required", d["order"])

            data_obj["url"] = "{}/api/?{}".format(API, urllib.urlencode(d))
            data_obj["params"] = d

            self.data.append(data_obj)

        self.map = params.pop("map", None)
        self.config = params
        self.config["tooltip"] = self.tooltip()

        # self.color = params.pop("color", None)
        # self.type = params.pop("type")
        # self.size = params.pop("size", None)
        # self.x = params.pop("x", None)
        # self.y = params.pop("y", None)
        # self.order = params.get("order", None)
        # self.attr_type = params["show"].replace("_id", "")

        # params["sumlevel"] = params.get("sumlevel", "all")
        # params["year"] = params.get("year", 2013)
        # params["sort"] = params.get("sort", "desc")
        #
        # self.required = filter(None, [self.size, self.x, self.y, self.order, self.color])
        # self.params = params

    def attr_url(self):
        if "attrs" in self.config:
            return "{}/attrs/{}/".format(API, self.config["attrs"])
        return None

    def serialize(self):
        return json.dumps({
            "attrs": self.attr_url(),
            "config": self.config,
            "data": self.data
        })

    def tooltip(self):
        tooltip = []
        for d in self.data:
            tooltip += [d["params"][k] for k in ["required", "order"] if k in d["params"]]
        tooltip += [self.config[k] for k in ["x", "y", "size"] if k in self.config]
        return tooltip
