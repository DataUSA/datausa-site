import math, os, re, requests, yaml
from itertools import combinations
from requests.models import RequestEncodingMixin
from flask import url_for
import string

from config import API
from datausa import app
from datausa.consts import COLMAP, SUMLEVELS
from datausa.visualize.models import Viz
from datausa.utils.data import attr_cache, fetch, profile_cache
from datausa.utils.manip import datafold, stat
from datausa.utils.format import num_format, param_format

textLookup = {
    "age": ("older than", "younger than", "the same age as"),
    "highlow": ("higher than", "lower than", "the same as"),
    "longshort": ("longer", "shorter", "equal"),
    "moreless": ("more than", "less than", "the same as")
}


class Section(object):
    """A section of a profile page that contains many horizontal text/viz topics.

    Attributes:
        attr (dict): Attribute of profile.
        description (str): Description of the Section, read from YAML configuration.
        profile (Profile): Profile the Section lives within.
        title (str): Title of the Section, read from YAML configuration.
        topics (List[dict]): List of the various topic dictionaries in the Section.

    """

    def __init__(self, f, profile, anchor=""):
        """Initializes a new Section class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """
        if isinstance(f, basestring):
            config = f
        else:
            config = "".join(f.readlines())
        config = config.decode("utf-8", 'ignore')

        # Set the attr and profile attributes
        self.attr = profile.attr
        self.anchor = anchor
        self.profile = profile

        def loadStats(string):
            keys = re.findall(r"<<(.*?)>>", string)
            for k in keys:
                func, params = k.split(" ") if " " in k else (k, "")
                # if Section has a function with the same name as the key
                if hasattr(self, func):
                    # convert params into a dict, splitting at pipes
                    params = dict(item.split("=") for item in params.split("|")) if params else {}
                    # run the Section function, passing the params as kwargs
                    val = getattr(self, func)(**params)

                    # if it returned an object, convert it to string
                    if isinstance(val, (int, long, float, complex)):
                        val = str(val)
                    elif isinstance(val, dict):
                        col = params.get("col", "name")
                        if col == "id":
                            val = val["value"]
                        else:
                            val = u"<span data-url='{}'>{}</span>".format(val["url"], val["value"])

                    # replace all instances of key with the returned value
                    # !! TODO: fix unicode black magic !!
                    if isinstance(val, str):
                        val = val.decode("utf-8", 'ignore')
                    # !! TODO: fix root cause of unprintable strings in attrs
                    # val = filter(lambda x: x in string.printable, val)
                else:
                    val = u"N/A"
                k = k.decode("utf-8", 'ignore')
                string = string.replace(u"<<{}>>".format(k), val)
            return string

        # regex to find all keys matching {{*}}
        keys = re.findall(r"\{\{([^\}]+)\}\}", config)

        # loop through each key
        for k in keys:
            # split the key at a blank space to find params
            condition, text = k.split("||")

            condition = loadStats(condition)
            first, second = condition.split(":")
            not_equals = second.startswith("!")
            if not_equals:
                second = second[1:]
            if (not_equals and first == second) or (not not_equals and first != second):
                ret = ""
            else:
                ret = loadStats(text)

            # replace all instances of key with the returned value
            k = k.decode("utf-8", 'ignore')
            config = config.replace("{{{{{}}}}}".format(k), ret)


        # regex to find all keys matching <<*>>
        config = loadStats(config)

        # load the config through the YAML interpreter and set title, description, and topics
        config = yaml.load(config)

        if "title" in config:
            self.title = config["title"]

        if "group" in config:
            self.group = config["group"]

        if "description" in config:
            self.description = config["description"]
            if not isinstance(self.description, list):
                self.description = [self.description]

        if "viz" in config:
            self.viz = Viz(config["viz"])

        if "topics" in config:
            self.topics = config["topics"]

            self.topics = [t for t in self.topics if self.allowedLevels(t)]

            # loop through the topics
            for topic in self.topics:

                if "description" in topic and not isinstance(topic["description"], list):
                    topic["description"] = [topic["description"]]

                def getHighlight(viz_obj):
                    ids = viz_obj["id"]
                    if not isinstance(ids, list):
                        ids = [ids]
                    if self.profile.attr_type in ids:
                        return self.attr["id"]
                    else:
                        return False

                if "stat" in topic:
                    topic["stat"] = [s for s in topic["stat"] if self.allowedLevels(s)]

                # instantiate the "viz" config into an array of Viz classes
                if "viz" in topic:
                    if not isinstance(topic["viz"], list):
                        topic["viz"] = [topic["viz"]]
                    topic["viz"] = [v for v in topic["viz"] if self.allowedLevels(v)]
                    topic["viz"] = [Viz(viz, getHighlight(viz)) for viz in topic["viz"]]

                if "miniviz" in topic:
                    topic["miniviz"] = Viz(topic["miniviz"], getHighlight(topic["miniviz"]))

                # fill selector if present
                if "select" in topic:
                    if isinstance(topic["select"]["data"], str):
                        if "param" not in topic["select"]:
                            topic["select"]["param"] = topic["select"]["data"]
                        topic["select"]["data"] = [v for k, v in attr_cache[topic["select"]["data"]].iteritems()]
                    elif isinstance(topic["select"]["data"], list):
                        topic["select"]["data"] = [fetch(v, False) for v in topic["select"]["data"]]

        if "sections" in config:
            self.sections = config["sections"]

        if "stats" in config:
            self.stats = config["stats"]

        if "facts" in config:
            self.facts = config["facts"]

    def allowedLevels(self, obj):
        """bool: Returns whether or not a topic/viz is allowed for a specific profile """
        if "sumlevel" in obj:
            levels = [t for t in obj["sumlevel"].split(",")]
            if self.profile.attr_type == "geo":
                level = SUMLEVELS["geo"][self.attr["id"][:3]]["sumlevel"]
            else:
                level = len(self.attr["id"])

            if "!" in obj["sumlevel"]:
                return not "!{}".format(level) in levels
            else:
                return level in levels

        return True

    def children(self, **kwargs):
        attr_id = kwargs.get("attr_id", self.id(**kwargs))
        prefix = attr_id[:3]
        if kwargs.get("dataset", False) == "chr" and prefix not in ["010", "040"]:
            attr_id = self.profile.parents()[1]["id"]
            prefix = "040"
        if kwargs.get("prefix", False) and "children" in SUMLEVELS["geo"][prefix]:
            if prefix in ("310", "160"):
                return attr_id
            return "^{}".format(attr_id.replace(prefix, SUMLEVELS["geo"][prefix]["children"]))
        if "children" in SUMLEVELS["geo"][prefix]:
            sumlevel = SUMLEVELS["geo"][prefix]["children"]
        else:
            sumlevel = False
        return u",".join([c["id"] for c in self.profile.children(attr_id=attr_id, sumlevel=sumlevel)])

    def id(self, **kwargs):
        return self.profile.id_sub(**kwargs)

    def level(self, **kwargs):
        """str: A string representation of the depth type. """
        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        attr_id = kwargs.get("attr_id", self.id(**kwargs))
        dataset = kwargs.get("dataset", False)

        if attr_type == "geo":
            prefix = attr_id[:3]
            if dataset == "chr" and prefix not in ["010", "040"]:
                prefix = "040"

            labels = SUMLEVELS["geo"][prefix]
            if kwargs.get("child", False) and "children" in labels:
                prefix = labels["children"]

            labels = SUMLEVELS["geo"][prefix]

        else:
            labels = SUMLEVELS[attr_type][self.sumlevel(**kwargs)]

        if kwargs.get("short", False) and "shortlabel" in labels:
            name = labels["shortlabel"]
        else:
            name = labels["label"]

        if "plural" in kwargs:
            name = u"{}ies".format(name[:-1]) if name[-1] == "y" else u"{}s".format(name)

        if "uppercase" in kwargs:
            name = name.capitalize()

        return name

    def name(self, **kwargs):
        """str: The attribute name """

        if "id" in kwargs and "attr" in kwargs:
            attr = fetch(kwargs["id"], kwargs["attr"])
        elif "dataset" in kwargs:
            attr = fetch(self.id(**kwargs), self.profile.attr_type)
        else:
            attr = self.attr

        name = attr["display_name"] if "display_name" in attr else attr["name"]
        text_only = kwargs.get("text_only", False)
        if not text_only and attr["id"] != self.attr["id"]:
            name = u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=self.profile.attr_type, attr_id=attr["id"]), name)
        return name

    def parents(self, **kwargs):
        col = kwargs.get("col", False)
        prefix = kwargs.get("prefix", None)
        if prefix:
            top = [u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type="geo", attr_id=p["id"]), p["name"]) for p in self.profile.parents() if p["id"].startswith(prefix)]
            if len(top) > 1:
                top[-1] = "and {}".format(top[-1])
            if len(top) == 2:
                top = " ".join(top)
            else:
                top = "; ".join(top)
            return top

        if col and self.attr["id"] == "01000US":

            params = {
                "show": "geo",
                "required": col,
                "sumlevel": "state",
                "order": col,
                "sort": "desc"
            }

            query = RequestEncodingMixin._encode_params(params)
            url = "{}/api?{}".format(API, query)

            try:
                results = [r for r in datafold(requests.get(url).json()) if r[col]]
            except ValueError:
                app.logger.info("STAT ERROR: {}".format(url))
                return ""

            results = results[:2] + results[-2:]

            return ",".join([r["geo"] for r in results])

        return u",".join([p["id"] for p in self.profile.parents()])

    def percent(self, **kwargs):
        """str: 2 columns divided by one another """

        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        attr_id = kwargs.get("attr_id", self.attr["id"])

        r = {"num": 1, "den": 1}
        for t in r.keys():
            key = kwargs.get(t)

            params = {}
            params["limit"] = 1
            params["year"] = kwargs.get("year", "latest")
            params = param_format(params)
            t_type = kwargs.get("{}_type".format(t), attr_type)
            params["show"] = kwargs.get("show", t_type)
            params[t_type] = kwargs.get("{}_id".format(t), attr_id)
            params["exclude"] = kwargs.get("exclude", kwargs.get("{}_exclude".format(t), ""))

            if "top:" in key:

                params["col"], params["force"] = key.split(":")[1].split(",")
                r[t] = self.top(**params)["data"][0]

            elif "var:" in key:

                keys = key.split(":")[1].split(",")
                if len(keys) == 2:
                    keys.append(None)
                ns, col, row = keys
                r[t] = self.var(namespace=ns, key=col, row=row, format="raw")

            elif "," in key:

                num, den = key.split(",")
                subparams = {}
                subparams["num"] = num
                subparams["den"] = den
                subparams["data_only"] = True
                subparams["num_id"] = params[t_type]
                subparams["den_id"] = params[t_type]
                r[t] = self.percent(**subparams)

            else:

                params["required"] = key

                # convert request arguments into a url query string
                query = RequestEncodingMixin._encode_params(params)
                url = u"{}/api?{}".format(API, query)

                try:
                    r[t] = datafold(requests.get(url).json())
                except ValueError:
                    app.logger.info("STAT ERROR: {}".format(url))
                    return "N/A"

                if len(r[t]) == 0:
                    return "N/A"
                r[t] = r[t][0][key]

            if r[t] in [None, "N/A"]:
                return "N/A"

        diff = kwargs.get("diff", False)
        if r["num"] == 0 or r["den"] == 0:
            val = 0
        elif diff:
            val = r["num"] - r["den"]
        else:
            val = r["num"]/r["den"]

        if kwargs.get("invert", False):
            val = 1 - val

        if kwargs.get("data_only", False):
            return val

        text = kwargs.get("text", False)
        if text and text in textLookup:
            text = textLookup[text]
            if diff:
                if val > 0:
                    return text[0]
                elif val < 0:
                    return text[1]
                else:
                    return text[2]
            else:
                if val > 1:
                    return text[0]
                elif val < 1:
                    return text[1]
                else:
                    return text[2]
        elif diff or kwargs.get("ratio", False):
            return num_format(abs(val))
        else:
            return "{}%".format(num_format(val * 100))

    def plural(self, **kwargs):
        text = kwargs.pop("text")
        try:
            if "namespace" in kwargs:
                kwargs["format"] = "raw"
                val = float(self.var(**kwargs))
            else:
                val = float(self.top(**kwargs)[0])
        except ValueError:
            val = 2
        if val != 1:
            return "{}ies".format(text[:-1]) if text[-1] == "y" else "{}s".format(text)
        return text

    def range(self, **kwargs):
        minVal = int(kwargs.get("min"))
        maxVal = int(kwargs.get("max"))
        return str(range(minVal, maxVal + 1))

    def ranks(self, **kwargs):

        ranks = int(kwargs.get("limit", 1))
        col = kwargs.get("col")
        attr_type = kwargs.get("attr_type", self.profile.attr_type)

        params = {}
        params[attr_type] = self.attr["id"]
        params["required"] = col
        params["show"] = kwargs.get("show", self.profile.attr_type)
        params["sumlevel"] = "all"

        query = RequestEncodingMixin._encode_params(params)
        url = "{}/api?{}".format(API, query)

        try:
            rank = int(datafold(requests.get(url).json())[0][col])
        except ValueError:
            app.logger.info("STAT ERROR: {}".format(url))
            return ""

        if rank <= (ranks/2 + 1):
            return ",".join([str(r) for r in range(1, ranks + 1)])

        del params[attr_type]
        params["limit"] = 1
        params["order"] = col
        params["sort"] = "desc"

        query = RequestEncodingMixin._encode_params(params)
        url = "{}/api?{}".format(API, query)

        try:
            max_rank = int(datafold(requests.get(url).json())[0][col])
        except ValueError:
            app.logger.info("STAT ERROR: {}".format(url))
            return ""

        if rank > (max_rank - ranks/2 - 1):
            results = range(max_rank - ranks + 1, max_rank + 1)
        else:
            results = range(int(math.ceil(rank - ranks/2)), int(math.ceil(rank + ranks/2) + 1))

        return ",".join([str(r) for r in results])

    def rank_max(self, **kwargs):
        return num_format(profile_cache[self.profile.attr_type]["ranks"][self.sumlevel()], condense=False)

    def solo(self):
        attr_id = self.attr["id"]
        if attr_id[:3] in ["010", "040"]:
            return ""
        else:
            states = [p["id"] for p in self.profile.parents() if p["id"][:3] == "040"]
            return_ids = []
            for state in states:
                try:
                    url = "{}/attrs/geo/{}/children?sumlevel={}".format(API, state, attr_id[:3])
                    results = datafold(requests.get(url).json())
                    return_ids += [r["id"] for r in results]
                except ValueError:
                    return ""
            return ",".join(return_ids)

    def sub(self, **kwargs):
        substitution = False
        key = kwargs.pop("key", "name")
        if kwargs.get("dataset", False):
            attr_id = self.id(**kwargs)
            if self.attr["id"] != attr_id:
                substitution = fetch(attr_id, self.profile.attr_type)
        else:
            kwargs["data_only"] = True
            attr_type = kwargs.get("attr_type", self.profile.attr_type)
            attrs = kwargs.pop("attrs", attr_type)
            subs = self.top(**kwargs)
            if "subs" not in subs:
                return ""
            subs = subs["subs"]
            if attr_type in subs and subs[attr_type] != self.attr["id"]:
                substitution = fetch(subs[attr_type], attrs)

        if substitution:
            if key == "name":
                substitution = substitution["name"]
                return u"Based on data from {}".format(substitution)
            else:
                return substitution[key]
        else:
            return ""

    def sumlevel(self, **kwargs):
        """str: A string representation of the depth type. """
        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        attr_id = kwargs.get("attr_id", self.id(**kwargs))

        if attr_type == "geo":
            prefix = attr_id[:3]
            if kwargs.get("dataset", False) == "chr" and prefix not in ["010", "040"]:
                prefix = "040"
            if kwargs.get("child", False) and "children" in SUMLEVELS["geo"][prefix]:
                prefix = SUMLEVELS["geo"][prefix]["children"]
            name = SUMLEVELS["geo"][prefix]["sumlevel"]

            if "plural" in kwargs:
                name = u"{}ies".format(name[:-1]) if name[-1] == "y" else u"{}s".format(name)

            return name

        elif attr_type == "cip":
            return str(len(attr_id))

        else:
            return str(fetch(attr_id, attr_type)["level"])

    def top(self, **kwargs):
        """str: A text representation of a top statistic or list of statistics """

        attr_type = kwargs.get("attr_type", self.profile.attr_type)
        dataset = kwargs.get("dataset", False)
        moe = kwargs.pop("moe", False)

        # create a params dict to use in the URL request
        params = {}

        # set the section's attribute ID in params
        attr_id = kwargs.get("attr_id", False)
        if attr_type != self.profile.attr_type and attr_id and "top" in attr_id:
            l, o = attr_id.split(":")
            attr_id = self.top(**{
                "col": "id",
                "order": o,
                "sort": "desc",
                "limit": l[3:],
                "show": attr_type
            })["value"]

        child = kwargs.get("child", False)
        if attr_id == False:
            if child:
                aid = self.id(**kwargs)
                prefix = aid[:3]
                if dataset == "chr" and prefix not in ["010", "040"]:
                    aid = self.profile.parents()[1]["id"]
                    prefix = "040"
                if "children" in SUMLEVELS["geo"][prefix]:
                    if prefix in ("310", "160"):
                        params["where"] = "geo:{}".format(aid)
                    else:
                        params["where"] = "geo:^{}".format(aid.replace(prefix, SUMLEVELS["geo"][prefix]["children"]))
                    attr_id = ""
        if attr_id == False:
            attr_id = self.id(**kwargs)
        params[attr_type] = attr_id

        # get output key from either the value in kwargs (while removing it) or 'name'
        col = kwargs.pop("col", "name")
        data_only = kwargs.pop("data_only", False)
        if child:
            kwargs["sumlevel"] = self.sumlevel(**kwargs)

        for k in ["attr_type", "attr_id", "child", "dataset"]:
            if k in kwargs:
                del kwargs[k]

        # add the remaining kwargs into the params dict
        params = dict(params.items()+kwargs.items())

        # set default params
        params["limit"] = params.get("limit", 1)
        params["show"] = params.get("show", attr_type)
        params["sumlevel"] = params.get("sumlevel", "all")
        if "sumlevel" in params["sumlevel"]:
            params["sumlevel"] = params["sumlevel"].replace("sumlevel", self.sumlevel())
        if "naics_level" in params and "sumlevel" in params["naics_level"]:
            params["naics_level"] = params["naics_level"].replace("sumlevel", self.sumlevel())
        if "soc_level" in params and "sumlevel" in params["soc_level"]:
            params["soc_level"] = params["soc_level"].replace("sumlevel", self.sumlevel())
        params = param_format(params)

        if "force" not in params and params["required"] == "":
            col_maps = COLMAP.keys()
            col_maps += ["-".join(c) for c in list(combinations(col_maps, 2))]

            # extra allowed values for 'col'
            col_maps += ["id", "name", "ratio"]

            if col not in col_maps:
                params["required"] = col
            elif "order" in params:
                params["required"] = params["order"]

        if moe and "force" not in params:
            params["required"] += ",{}".format(moe)

        # make the API request using the params
        return stat(params, col=col, dataset=dataset, data_only=data_only, moe=moe)

    def var(self, **kwargs):
        namespace = kwargs["namespace"]
        key = kwargs["key"]
        formatting = kwargs.get("format", "pretty")
        row = kwargs.get("row", False)

        var_map = self.profile.variables
        if var_map:
            if row and namespace in var_map and var_map[namespace]:
                row = int(row)
                if row < len(var_map[namespace]):
                    return var_map[namespace][row][key][formatting]
            if namespace in var_map and key in var_map[namespace]:
                return var_map[namespace][key][formatting]
            return "N/A"
        else:
            raise Exception("vars.yaml file has no variables")

    def __repr__(self):
        return u"Section: {}".format(self.title)
