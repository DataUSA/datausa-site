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

    def __init__(self, params, color="#006ea8"):
        """Initializes a new Viz class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        self.color = color;

        # force the data of params into a list
        data = params.pop("data") if isinstance(params["data"], list) else [params.pop("data")]

        # loop through each data and append to self.data
        self.data = []
        for d in data:

            # create a new dict containing the 'split' and 'static' params
            data_obj = {
                "map": d.pop("map", None),
                "split": d.pop("split", None),
                "static": d.pop("static", None)
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
            "color": self.color,
            "config": self.config,
            "data": self.data
        })

    def tooltip(self):
        """List[str]: A list of important data keys to be displayed in tooltips """

        tooltip = []

        # check each data call for 'required' and 'order'
        for d in self.data:
            p = d["params"]
            for k in ["required", "order"]:
                if k in p and p[k] != "" and p[k] not in tooltip:
                    tooltip.append(p[k])

        # check the config for 'x' 'y' and 'size'
        for k in ["x", "y", "size"]:
            if k in self.config and self.config[k] not in tooltip:
                val = self.config[k]
                if isinstance(val, str):
                    tooltip.append(val)
                elif "value" in val:
                    tooltip.append(val["value"])

        return tooltip
