import json, math, os, re, requests, string, yaml
from flask import url_for
from itertools import combinations
from requests.models import RequestEncodingMixin

from section import Section
from config import API

from datausa import app
from datausa.consts import COLMAP, SUMLEVELS, TEXTCOMPARATORS
from datausa.utils.data import fetch, get_parents, profile_cache, get_children
from datausa.utils.format import num_format, param_format
from datausa.utils.manip import datafold, stat
from datausa.utils.multi_fetcher import merge_dicts, multi_col_top
from datausa.profile.abstract import BaseObject


class Profile(BaseObject):
    """An abstract class for all Profiles.

    Handles fetching attribute properties and reading in YAML configuration files as strings.

    Attributes:
        attr (dict): Attribute of profile.
        attr_type (str): The attribute type of the profile.
        id (str): String ID of attribute.

    """

    def __init__(self, attr_id, attr_type, required_namespaces=None):
        """Initializes a new Profile class.

        Args:
            attr_id (str): The ID of the selected attribute
            attr_type (str): The attribute type of the profile.

        """

        # set attr (using the fetch function) and attr_type
        self.attr = fetch(attr_id, attr_type)
        self.attr_type = attr_type
        self.variables = self.load_vars(required_namespaces)
        self.splash = Section(self.load_yaml(self.open_file("splash")), self)

    def children(self, **kwargs):

        attr_id = kwargs.get("attr_id", self.id(**kwargs))
        my_prefix = attr_id[:3]
        requested_prefix = kwargs.get("prefix", False)

        if kwargs.get("dataset", False) == "chr" and my_prefix not in ["010", "040"]:
            attr_id = self.parents()[1]["id"]
            my_prefix = "040"

        if requested_prefix and "children" in SUMLEVELS["geo"][my_prefix]:
            if my_prefix in ("310", "160"):
                return attr_id
            requested_prefix = SUMLEVELS["geo"][my_prefix]["children"] if requested_prefix == "True" or requested_prefix is True else requested_prefix
            return "^{}".format(attr_id.replace(my_prefix, requested_prefix))
        if "children" in SUMLEVELS["geo"][my_prefix]:
            sumlevel = SUMLEVELS["geo"][my_prefix]["children"]
        else:
            sumlevel = False

        children = get_children(attr_id, self.attr_type, sumlevel)

        return u",".join([c["id"] for c in children])

    @staticmethod
    def get_uniques(list_of_dict):
        seen = set()
        new_list_of_dict = []
        for d in list_of_dict:
            t = tuple(d.items())
            if t not in seen:
                seen.add(t)
                new_list_of_dict.append(d)
        return new_list_of_dict

    def id(self, **kwargs):
        """str: The id of attribute taking into account the dataset and grainularity of the Section """

        # if there is a specified dataset in kwargs
        if "dataset" in kwargs:
            dataset = kwargs["dataset"]
            # if the attribute is a CIP and the dataset is PUMS, return the parent CIP code
            if self.attr_type == "cip" and dataset == "pums":
                return self.attr["id"][:2]
            elif self.attr_type == "geo" and dataset == "ipeds":
                if "ipeds" not in self.attr:
                    url = "{}/attrs/geo/{}/ipeds/".format(API, self.attr["id"])
                    try:
                        result = requests.get(url).json()["data"]
                        if len(result):
                            self.attr["ipeds"] = result[0]
                        else:
                            self.attr["ipeds"] = self.attr["id"]
                    except ValueError:
                        app.logger.info("STAT ERROR: {}".format(url))
                        self.attr["ipeds"] = self.attr["id"]
                return self.attr["ipeds"]
            elif self.attr_type == "geo" and dataset == "pums":
                attr_id = self.attr["id"]
                prefix = attr_id[:3]
                if kwargs.get("parent", False) and prefix not in ["010", "040"]:
                    attr_id = self.parents()[1]["id"]
                    prefix = "040"

                acceptedPrefixes = ["010", "040", "795"]

                if prefix in acceptedPrefixes:
                    return attr_id
                else:
                    for p in reversed(self.parents()):
                        if p["id"][:3] in acceptedPrefixes:
                            return p["id"]

            elif self.attr_type == "geo" and dataset == "chr":
                attr_id = self.attr["id"]
                prefix = attr_id[:3]
                if kwargs.get("parent", False) and prefix not in ["010", "040"]:
                    attr_id = self.parents()[1]["id"]
                    prefix = "040"

                acceptedPrefixes = ["010", "040", "795"]

                if prefix in acceptedPrefixes:
                    return attr_id
                else:
                    for p in reversed(self.parents()):
                        if p["id"][:3] in acceptedPrefixes:
                            return p["id"]

        return self.attr["id"]

    def image(self):
        if "image_link" in self.attr:
            url = "/static/img/splash/{}/".format(self.attr_type)
            image_attr = False
            if self.attr["image_link"]:
                image_attr = self.attr
            else:
                parents = [fetch(p["id"], self.attr_type) for p in get_parents(self.attr["id"], self.attr_type)]
                for p in reversed(parents):
                    if p["image_link"]:
                        image_attr = p
                        break
            if image_attr:
                return {
                    "url": "{}{}.jpg".format(url, image_attr["id"]),
                    "link": image_attr["image_link"],
                    "author": image_attr["image_author"],
                    "meta": image_attr.get("image_meta", False)
                    }
        return None

    def level(self, **kwargs):
        """str: A string representation of the depth type. """
        attr_type = kwargs.get("attr_type", self.attr_type)
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

        if "titlecase" in kwargs:
            name = name.title()

        if "desc" in labels:
            name = u"<span class='term' data-tooltip-offset='0' data-tooltip-id='data-tooltip-term' data-tooltip='{}'>{}</span>".format(labels['desc'], name)
            if "link" in labels:
                name = u"<a href='{}' class='term' data-tooltip-offset='0' data-tooltip-id='data-tooltip-term' data-tooltip='{}' target='_blank'>{}</a>".format(labels['link'], labels['desc'], name)

        return name

    def load_vars(self, required_namespaces=None):
        """Reads variables from disk and resolves them based on API"""
        var_data = self.load_yaml(self.open_file("vars"))
        if required_namespaces:
            var_data = [vd for vd in var_data
                        if vd['namespace'] in required_namespaces]
        # call api to retrieve data
        var_map = [multi_col_top(self, params) for params in var_data]
        # merge the various namespaces into a single dict
        var_map = merge_dicts(*var_map)
        return var_map

    def load_yaml(self, config):
        if isinstance(config, dict):
            config = json.dumps(config)
        elif isinstance(config, file):
            config = "".join(config.readlines())
        config = config.decode("utf-8", 'ignore')
        config = yaml.load(config)

        if 'topics' in config:
            config['topics'] = [t for t in config['topics'] if self.allowed_levels(t)]

        config = json.dumps(config)

        # regex to find all keys matching {{*}}
        keys = re.findall(r"\{\{([^\}]+)\}\}", config)

        # loop through each key
        for k in keys:
            # split the key at a blank space to find params
            condition, text = k.split("||")

            condition = self.parse_stats(condition)
            first, second = condition.split(":")
            not_equals = second.startswith("!")

            if not_equals:
                second = second[1:]

            if text == "True":
                text = True
            elif text == "False":
                text = False

            if (not_equals and first == second) or (not not_equals and first != second):
                if isinstance(text, bool):
                    if text:
                        text = False
                    else:
                        text = True
                else:
                    text = ""

            k = k.decode("utf-8", 'ignore')

            # replace all instances of key with the returned value
            if isinstance(text, bool):
                config = config.replace("\"{{{{{}}}}}\"".format(k), str(text))
            else:
                config = config.replace("{{{{{}}}}}".format(k), text)

        # regex to find all keys matching <<*>>
        config = self.parse_stats(config)

        # load the config through the YAML interpreter and set title, description, and topics
        return yaml.load(config)

    def make_links(self, list_of_profiles, attr_type=None):
        attr_type = attr_type or self.attr_type
        top = [u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=attr_type, attr_id=p["url_name"] if "url_name" in p and p["url_name"] else p["id"] ), p["name"]) for p in list_of_profiles]
        if len(top) > 1:
            top[-1] = "and {}".format(top[-1])
        if len(top) == 2:
            top = " ".join(top)
        else:
            top = "; ".join(top)
        return top

    def name(self, **kwargs):
        """str: The attribute name """

        if "id" in kwargs and "attr" in kwargs:
            attr = fetch(kwargs["id"], kwargs["attr"])
        elif "dataset" in kwargs:
            attr = fetch(self.id(**kwargs), self.attr_type)
        else:
            attr = self.attr

        name = attr["display_name"] if "display_name" in attr else attr["name"]
        text_only = kwargs.get("text_only", False)
        if not text_only and attr["id"] != self.attr["id"]:
            url_name = attr["url_name"] if "url_name" in attr and attr["url_name"] else attr["id"]
            name = u"<a href='{}'>{}</a>".format(url_for("profile.profile", attr_type=self.attr_type, attr_id=url_name), name)
        return name

    def open_file(self, f):
        profile_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(profile_path, self.attr_type, "{}.yml".format(f))
        return open(file_path)

    def parents(self, **kwargs):
        id_only = kwargs.get("id_only", False)
        limit = kwargs.pop("limit", None)
        attr_id = self.id(**kwargs)
        prefix = kwargs.get("prefix", None)

        if (prefix or limit) and id_only == False:
            top = get_parents(attr_id, self.attr_type)
            if prefix:
                top = [p for p in top if p["id"].startswith(prefix)]
            if limit:
                top = top[-int(limit):]
            top = self.make_links(top)
            return top

        if self.attr["id"] == "01000US":

            col = kwargs.get("col", False)
            if col:

                params = {
                    "show": "geo",
                    "required": col,
                    "sumlevel": "state",
                    "order": col,
                    "sort": "desc",
                    "year": "latest"
                }

                query = RequestEncodingMixin._encode_params(params)
                url = "{}/api?{}".format(API, query)

                try:
                    results = [r for r in datafold(requests.get(url).json()) if r[col]]
                except ValueError:
                    app.logger.info("STAT ERROR: {}".format(url))
                    return ""

                results = results[:2] + results[-2:]

                if id_only:
                    return ",".join([r["geo"] for r in results])
                else:
                    return [fetch(r["geo"], "geo") for r in results]
            else:
                results = [
                    {"id": "04000US06", "name": "California"},
                    {"id": "04000US48", "name": "Texas"},
                    {"id": "04000US36", "name": "New York"},
                    {"id": "16000US1150000", "name":"Washington D.C."},
                    {"id": "16000US3651000", "name":"New York, NY"},
                    {"id": "16000US0644000", "name":"Los Angeles, CA"},
                    {"id": "16000US1714000", "name":"Chicago, IL"}
                ]

                if id_only:
                    return ",".join([r["id"] for r in results])
                else:
                    return results

        results = [p for p in get_parents(attr_id, self.attr_type) if p["id"] != attr_id]
        results = self.get_uniques(results)

        if prefix:
            results = [r for r in results if r["id"].startswith(prefix)]

        if limit:
            results = results[-int(limit):]

        if id_only:
            return ",".join([r["id"] for r in results])
        else:
            return results

    def parse_stats(self, string):
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
                        val = u"<span class='stat-span' data-url='{}'>{}</span>".format(val["url"], val["value"])

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

    def percent(self, **kwargs):
        """str: 2 columns divided by one another """

        attr_type = kwargs.get("attr_type", self.attr_type)
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
                r["{}_key".format(t)] = params["col"]
                r[t] = self.top(**params)["data"][0]

            elif "var:" in key:

                keys = key.split(":")[1].split(",")
                if len(keys) == 2:
                    keys.append(None)
                ns, col, row = keys
                r["{}_key".format(t)] = col
                r[t] = self.var(namespace=ns, key=col, row=row, format="raw")

            elif "," in key:

                num, den = key.split(",")
                subparams = {}
                subparams["num"] = num
                subparams["den"] = den
                subparams["data_only"] = True
                subparams["num_id"] = params[t_type]
                subparams["den_id"] = params[t_type]
                r["{}_key".format(t)] = None
                r[t] = self.percent(**subparams)

            else:

                params["required"] = key
                r["{}_key".format(t)] = key

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
        text = kwargs.get("text", False)
        if text and text in TEXTCOMPARATORS:
            r["num"] = float(num_format(r["num"], r["num_key"], False, suffix=False).replace(",", ""))
            r["den"] = float(num_format(r["den"], r["den_key"], False, suffix=False).replace(",", ""))

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

        if text and text in TEXTCOMPARATORS:
            text = TEXTCOMPARATORS[text]
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
                val = self.var(**kwargs)
            else:
                val = self.top(**kwargs)[0]
            if val:
                val = float(val)
            else:
                val = 2
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
        attr_type = kwargs.get("attr_type", self.attr_type)

        params = {}
        params[attr_type] = self.attr["id"]
        params["required"] = col
        params["show"] = kwargs.get("show", self.attr_type)
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
        return num_format(profile_cache[self.attr_type]["ranks"][self.sumlevel(**kwargs)], condense=False)

    def sections(self):
        """list[Section]: Loads YAML configuration files and converts them to Section classes. """

        # pass each file to the Section class and return the final array
        return [Section(self.load_yaml(self.open_file(f)), self, f) for f in self.splash.sections]

    def section_by_topic(self, section_name, slugs):
        '''Section: Creates a custom Section object with the desired topics by slug'''
        if section_name in self.splash.sections:
            # read from disk only if the name is in our sections list
            section_file = self.open_file(section_name)
            section_dict = yaml.load(section_file)
            filtered_topics = [t for t in section_dict['topics'] if 'slug' in t and t['slug'] in slugs]
            desired_config = {'topics': filtered_topics}
            if 'title' in section_dict:
                desired_config['title'] = section_dict['title']
            if 'description' in section_dict:
                desired_config['description'] = section_dict['description']
            return Section(self.load_yaml(json.dumps(desired_config)), self, section_name)
        return None

    def siblings(self, **kwargs):
        limit = kwargs.pop("limit", 5)
        # get immediate parents
        parent = get_parents(self.attr["id"], self.attr_type)
        parent = self.get_uniques(parent)
        parent = parent[-1]

        siblings = [c for c in get_children(parent["id"], self.attr_type, self.sumlevel()) if c['id'] != self.attr["id"]]
        siblings = siblings[:limit+1]

        return self.make_links(siblings)


    def solo(self):
        attr_id = self.attr["id"]
        if attr_id[:3] in ["010", "040"]:
            return ""
        else:
            states = [p["id"] for p in self.parents() if p["id"][:3] == "040"]
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
        attr_id = self.id(**kwargs)
        attr_type = kwargs.get("attr_type", self.attr_type)

        if kwargs.get("dataset", False):
            if self.attr["id"] != attr_id:
                substitution = fetch(attr_id, self.attr_type)
        else:
            kwargs["data_only"] = True
            attrs = kwargs.pop("attrs", attr_type)
            subs = self.top(**kwargs)
            if "subs" in subs:
                subs = subs["subs"]
                if attr_type in subs and subs[attr_type] != attr_id:
                    substitution = fetch(subs[attr_type], attrs)

        if key == "name":
            if substitution:
                return u"Based on data from {}".format(substitution[key])
            else:
                return ""
        else:
            if substitution:
                return substitution[key]
            else:
                if "_iocode" in attr_type:
                    return fetch(attr_id, attr_type)[key]
                return self.attr[key]

    def sumlevel(self, **kwargs):
        """str: A string representation of the depth type. """
        attr_type = kwargs.get("attr_type", self.attr_type)
        attr_id = kwargs.get("attr_id", self.id(**kwargs))
        requested_prefix = kwargs.get("prefix", False)

        if attr_type == "geo":
            if requested_prefix:
                name = SUMLEVELS["geo"][requested_prefix]["sumlevel"]
            else:
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

        attr_type = kwargs.get("attr_type", self.attr_type)
        dataset = kwargs.get("dataset", False)
        moe = kwargs.pop("moe", False)
        truncate = int(kwargs.pop("truncate", 0))

        # create a params dict to use in the URL request
        params = {}

        # set the section's attribute ID in params
        attr_id = kwargs.get("attr_id", False)
        if attr_type != self.attr_type and attr_id and "top" in attr_id:
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
                kwargs["prefix"] = kwargs.get("prefix", True)
                where = self.children(**kwargs)
                if kwargs["prefix"] is True:
                    pre = kwargs.pop("prefix")
                if len(where) > 0:
                    params["where"] = "{}:{}".format(self.attr_type, where)
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
        return stat(params, col=col, dataset=dataset, data_only=data_only, moe=moe, truncate=truncate)

    def var(self, **kwargs):
        namespace = kwargs["namespace"]
        key = kwargs["key"]
        formatting = kwargs.get("format", "pretty")
        row = kwargs.get("row", False)

        var_map = self.variables
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

    @classmethod
    def compute_namespaces(cls, attr_type, section_name, topics):
        profile_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(profile_path, attr_type, "{}.yml".format(section_name))
        section_dict = yaml.load(open(file_path, 'r'))
        my_topics = [t for t in section_dict['topics'] if 'slug' in t and t['slug'] in topics]
        raw_topics = json.dumps(my_topics)
        keys = re.findall(r"namespace=([^\|>]+)", raw_topics)
        return keys
