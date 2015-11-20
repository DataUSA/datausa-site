import json
from requests.models import RequestEncodingMixin
from config import API
from datausa.utils.data import default_params

class Viz(object):
    """A visualization object to be built using D3plus.

    Attributes:
        config (dict): Configuration for D3plus
        data (List[dict]): A list of data dictionary objects that tell D3plus how to load and transform the data needed for the visualization.

    """

    def __init__(self, params, highlight=False):
        """Initializes a new Viz class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        self.highlight = params.pop("highlight", highlight);

        # force the data of params into a list
        data = params.pop("data") if isinstance(params["data"], list) else [params.pop("data")]

        # remove sumlevel if it exists
        sumlevel = params.pop("sumlevel", None)

        # loop through each data and append to self.data
        self.data = []
        for d in data:

            # create a new dict containing the 'split' and 'static' params
            data_obj = {
                "map": d.pop("map", None),
                "split": d.pop("split", None),
                "static": d.pop("static", None),
                "share": d.pop("share", None)
            }

            # Set fallback API params
            d = default_params(d)

            # create the data URL
            p = RequestEncodingMixin._encode_params(d)
            data_obj["url"] = "{}/api/?{}".format(API, p)

            # store the params in the return dict
            data_obj["params"] = d

            # append the data dict to self.data
            self.data.append(data_obj)

        self.attrs = []
        if "attrs" in params:
            # force the attrs of params into a list
            attrs = params.pop("attrs") if isinstance(params["attrs"], list) else [params.pop("attrs")]
            # loop through each data and append to self.data
            self.attrs = [{"type": a, "url": "{}/attrs/{}/".format(API, a)} for a in attrs]

        # set self.config to the params
        self.config = params

        # set the tooltip config using the function
        self.config["tooltip"] = self.tooltip()

        # set default depth to zero
        self.config["depth"] = int(params["depth"]) if "depth" in params else 0

        # set default text to "name"
        self.config["text"] = params["text"] if "text" in params else "name"

    def serialize(self):
        """dict: JSON dump of Viz attrs, config, and data """
        return json.dumps({
            "attrs": self.attrs,
            "config": self.config,
            "data": self.data,
            "highlight": self.highlight
        })

    def tooltip(self):
        """List[str]: A list of important data keys to be displayed in tooltips """

        tooltip = []
        ids = self.config["id"]
        if not isinstance(ids, list):
            ids = [ids]

        # check each data call for 'required' and 'order'
        for d in self.data:
            if "share" in d:
                tooltip.append("share")
            p = d["params"]
            for k in ["required", "order"]:
                if k in p:
                    val = p[k].split(",")
                    for v in val:
                        if v != "" and v not in tooltip and v not in ids:
                            tooltip.append(v)
                            moe = "{}_moe".format(v)
                            if moe not in tooltip:
                                tooltip.append(moe)

        # check the config for 'x' 'y' and 'size'
        axis = "y"
        for k in ["x", "y"]:
            if k in self.config:
                val = self.config[k]
                if not isinstance(val, (str, int, float)):
                    if "scale" in val and val["scale"] == "discrete":
                        axis = "x" if k is "y" else "y"

        for k in [axis, "size"]:
            if k in self.config:
                val = self.config[k]
                if not isinstance(val, (str, int, float)):
                    val = val.get("value", False)

                if val and val not in tooltip and val not in ids:
                    tooltip.append(val)
                    if k == axis:
                        tooltip.append("{}2_{}".format(axis, val))
                    moe = "{}_moe".format(val)
                    if moe not in tooltip:
                        tooltip.append(moe)

        return tooltip
