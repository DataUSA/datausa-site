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
            func, params = k.split(" ") if " " in k else (k, None)
            if hasattr(self, func):
                if params:
                    params = dict(item.split("=") for item in params.split(","))
                    config = config.replace("<<{0}>>".format(k), getattr(self, func)(**params))
                else:
                    config = config.replace("<<{0}>>".format(k), getattr(self, func)())

        config = yaml.load(config)
        self.title = config["title"]
        self.description = config["description"]
        self.topics = config["topics"]

        for topic in self.topics:
            topic["viz"] = Viz(topic["viz"])

    def id(self):
        return self.attr["id"]

    def name(self):
        return self.attr["name"]

    def top(self, **kwargs):
        show = kwargs.get("show")
        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        params = {
            "limit": kwargs.get("limit", 1),
            "sort": kwargs.get("sort", "desc"),
            "order": kwargs.get("order"),
            "year": kwargs.get("year", 2013),
            "show": show,
            "sumlevel": kwargs.get("sumlevel", "all"),
        }
        params[attr_type] = kwargs.get("attr_id", self.attr["id"])
        params = urllib.urlencode(params)

        r = requests.get("{}/api?{}".format(API, params))
        top = [fetch(d[show], show) for d in datafold(r.json())]

        top = [t["name"] for t in top]
        if len(top) > 1:
            top[-1] = "and {}".format(top[-1])
        return ", ".join(top)

    def __repr__(self):
        return "Section: {}".format(self.title)
