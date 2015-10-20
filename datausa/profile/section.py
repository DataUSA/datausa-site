import re, yaml

from config import API
from datausa.visualize.models import Viz
from datausa.utils.data import attr_cache, datafold, fetch, stat

class Section(object):
    """A section of a profile page that contains many horizontal text/viz topics.

    Attributes:
        attr (dict): Attribute of profile.
        description (str): Description of the Section, read from YAML configuration.
        profile (Profile): Profile the Section lives within.
        title (str): Title of the Section, read from YAML configuration.
        topics (List[dict]): List of the various topic dictionaries in the Section.

    """

    def __init__(self, config, profile):
        """Initializes a new Section class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        # Set the attr and profile attributes
        self.attr = profile.attr
        self.profile = profile

        # regex to find all keys matching {{*}}
        keys = re.findall(r"\{\{([^\}]+)\}\}", config)

        # loop through each key
        for k in keys:
            # split the key at a blank space to find params
            val = re.findall(r"<<([^>]+)>>", k)[0]
            func, params = val.split(" ") if " " in val else (val, "")

            # if Section has a function with the same name as the key
            if hasattr(self, func):

                # convert params into a dict, splitting at pipes
                params = dict(item.split("=") for item in params.split("|")) if params else {}
                # run the Section function, passing the params as kwargs
                ret = getattr(self, func)(**params)

                if func in self.attr and self.attr[func] == ret:
                    # if the attr has this attribute and it's the same, remove it
                    ret = ""
                else:
                    # else, replace it with the returned value
                    ret = k.replace("<<{}>>".format(val), ret)

            # replace all instances of key with the returned value
            config = config.replace("{{{{{}}}}}".format(k), ret)



        # regex to find all keys matching <<*>>
        keys = re.findall(r"<<([^>]+)>>", config)

        # loop through each key
        for k in keys:
            # split the key at a blank space to find params
            func, params = k.split(" ") if " " in k else (k, "")

            # if Section has a function with the same name as the key
            if hasattr(self, func):
                # convert params into a dict, splitting at pipes
                params = dict(item.split("=") for item in params.split("|")) if params else {}
                # run the Section function, passing the params as kwargs
                val = getattr(self, func)(**params)

                # if it returned an object, convert it to string
                if not isinstance(val, (unicode, str)):
                    val = "<span data-url='{}'>{}</span>".format(val["url"], val["value"])

                # replace all instances of key with the returned value
                config = config.replace("<<{}>>".format(k), val.encode("utf-8"))

        # load the config through the YAML interpreter and set title, description, and topics
        config = yaml.load(config)

        if "title" in config:
            self.title = config["title"]

        if "description" in config:
            self.description = config["description"]

        if "topics" in config:
            self.topics = config["topics"]

            # loop through the topics
            for topic in self.topics:

                # instantiate the "viz" config into an array of Viz classes
                if not isinstance(topic["viz"], list):
                    topic["viz"] = [topic["viz"]]
                topic["viz"] = [Viz(viz, color=self.profile.color()) for viz in topic["viz"]]

                # fill selector if present
                if "select" in topic and isinstance(topic["select"]["data"], str):
                    topic["select"]["param"] = topic["select"]["data"]
                    topic["select"]["data"] = [v for k, v in attr_cache[topic["select"]["data"]].iteritems()]

        if "sections" in config:
            self.sections = config["sections"]

        if "stats" in config:
            self.stats = config["stats"]

        if "facts" in config:
            self.facts = config["facts"]

    def id(self, **kwargs):
        """str: The id of attribute taking into account the dataset and grainularity of the Section """

        # if there is a specified dataset in kwargs
        if "dataset" in kwargs:
            dataset = kwargs["dataset"]
            # if the attribute is a CIP and the dataset is PUMS, return the parent CIP code
            if self.profile.attr_type == "cip" and dataset == "pums":
                return self.attr["id"][:2]

        return self.attr["id"]

    def name(self, **kwargs):
        """str: The attribute name """

        if "id" in kwargs and "attr" in kwargs:
            return fetch(kwargs["id"], kwargs["attr"])["name"]
        elif "dataset" in kwargs:
            return fetch(self.id(dataset=kwargs["dataset"]), self.profile.attr_type)["name"]

        return self.attr["name"]

    def top(self, **kwargs):
        """str: A text representation of a top statistic or list of statistics """

        attr_type = kwargs.get("attr_type", self.profile.attr_type)

        # create a params dict to use in the URL request
        params = {}

        # set the section's attribute ID in params
        params[attr_type] = kwargs.get("attr_id", self.attr["id"])

        # get output key from either the value in kwargs (while removing it) or 'name'
        col = kwargs.pop("col", "name")

        # if the output key is not name, then add it to the params as a 'required' key
        if col != "name":
            params["required"] = col

        # add the remaining kwargs into the params dict
        params = dict(params.items()+kwargs.items())

        # set default params
        params["limit"] = params.get("limit", 1)
        params["sort"] = params.get("sort", "desc")
        params["order"] = params.get("order", "")
        params["exclude"] = params.get("exclude", "")
        params["year"] = params.get("year", 2013)
        params["sumlevel"] = params.get("sumlevel", "all")
        params["show"] = params.get("show", attr_type)

        # if no required param is set, set it to the order param
        if "required" not in params:
            params["required"] = params["order"]
        elif params["order"] == "":
            params["order"] = params["required"]

        # make the API request using the params
        return stat(params, col=col, dataset=kwargs.get("dataset", False))

    def __repr__(self):
        return "Section: {}".format(self.title)
