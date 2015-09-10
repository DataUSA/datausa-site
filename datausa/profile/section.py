import re, requests, urllib, yaml
from config import API
from datausa.visualize.models import Viz
from datausa.utils import datafold, fetch

class Section(object):

    def __init__(self, config, profile):

        self.attr = profile.attr
        self.profile = profile

        keys = re.findall(r"<<([^>]+)>>", config)

        for k in keys:
            func, params = k.split(" ") if " " in k else (k, "")
            if hasattr(self, func):
                params = dict(item.split("=") for item in params.split(",")) if params else {}
                config = config.replace("<<{0}>>".format(k), getattr(self, func)(**params))

        config = yaml.load(config)
        self.title = config["title"]
        self.description = config["description"]
        self.topics = config["topics"]

        for topic in self.topics:
            topic["viz"] = Viz(topic["viz"])

    def id(self, **kwargs):
        if "dataset" in kwargs:
            dataset = kwargs["dataset"]
            if self.profile.attr_type == "cip" and dataset == "pums":
                return self.attr["id"][:2]
        return self.attr["id"]

    def name(self, **kwargs):
        if "dataset" in kwargs:
            return fetch(self.id(dataset=kwargs["dataset"]), self.profile.attr_type)["name"]
        return self.attr["name"]

    def top(self, **kwargs):

        show = kwargs.get("show")
        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        params = {}
        params[attr_type] = kwargs.get("attr_id", self.id(dataset=kwargs.get("dataset", "")))

        if "col" in kwargs:
            params["required"] = kwargs.pop("col")
            col = params["required"]
        else:
            col = "name"

        params = dict(params.items()+kwargs.items())
        params["limit"] = params.get("limit", 1)
        params["sort"] = params.get("sort", "desc")
        params["order"] = params.get("order", "")
        params["year"] = params.get("year", 2013)
        params["show"] = params.get("show", show)
        params["sumlevel"] = params.get("sumlevel", "all")

        params = urllib.urlencode(params)
        r = datafold(requests.get("{}/api?{}".format(API, params)).json())

        if col == "name":
            top = [fetch(d[show], show)[col] for d in r]
        else:
            top = [d[col] for d in r]

        top = [str(t) for t in top]

        if len(top) > 1:
            top[-1] = "and {}".format(top[-1])
        return ", ".join(top)

    def __repr__(self):
        return "Section: {}".format(self.title)
