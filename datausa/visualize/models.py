import json, urllib
from config import API

class Viz(object):
    """A visualization object to be built using D3plus.

    Attributes:
        config (dict): Configuration for D3plus
        data (List[dict]): A list of data dictionary objects that tell D3plus how to load and transform the data needed for the visualization.

    """

    def __init__(self, params):
        """Initializes a new Viz class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        # force the data of params into a list
        data = params.pop("data") if isinstance(params["data"], list) else [params.pop("data")]

        # loop through each data and append to self.data
        self.data = []
        for d in data:

            # create a new dict containing the 'split' and 'static' params
            data_obj = {
                "split": d.pop("split", None),
                "static": d.pop("static", None)
            }

            # Set fallback API params
            d["sumlevel"] = d.get("sumlevel", "all")
            d["year"] = d.get("year", 2013)
            d["sort"] = d.get("sort", "desc")
            d["order"] = d.get("order", "")
            d["required"] = d.get("required", d["order"])

            # create the data URL
            data_obj["url"] = "{}/api/?{}".format(API, urllib.urlencode(d))

            # store the params in the return dict
            data_obj["params"] = d

            # append the data dict to self.data
            self.data.append(data_obj)

        # set self.config to the params
        self.config = params

        # set the tooltip config using the function
        self.config["tooltip"] = self.tooltip()

    def attr_url(self):
        """str: URL to be used to load attribute data """

        # if 'attrs' in the config, return a URL
        if "attrs" in self.config:
            return "{}/attrs/{}/".format(API, self.config["attrs"])

        return None

    def serialize(self):
        """dict: JSON dump of Viz attrs, config, and data """
        return json.dumps({
            "attrs": self.attr_url(),
            "config": self.config,
            "data": self.data
        })

    def tooltip(self):
        """List[str]: A list of important data keys to be displayed in tooltips """

        tooltip = []

        # check each data call for 'required' and 'order'
        for d in self.data:
            tooltip += [d["params"][k] for k in ["required", "order"] if k in d["params"]]

        # check the config for 'x' 'y' and 'size'
        tooltip += [self.config[k] for k in ["x", "y", "size"] if k in self.config]

        return tooltip
