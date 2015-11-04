import os
import requests
import yaml
from section import Section
from config import API
from datausa.utils.data import datafold, fetch
from datausa.utils.multi_fetcher import merge_dicts, multi_col_top


class Profile(object):
    """An abstract class for all Profiles.

    Handles fetching attribute properties and reading in YAML configuration files as strings.

    Attributes:
        attr (dict): Attribute of profile.
        attr_type (str): The attribute type of the profile.
        id (str): String ID of attribute.

    """

    def __init__(self, attr_id, attr_type):
        """Initializes a new Profile class.

        Args:
            attr_id (str): The ID of the selected attribute
            attr_type (str): The attribute type of the profile.

        """

        # set id, attr (using the fetch function), and attr_type
        self.id = attr_id
        self.attr = fetch(attr_id, attr_type)
        self.attr_type = attr_type

        self.variables = self.load_vars()
        self.splash = Section("splash", self)

    def children(self, **kwargs):
        attr_id = kwargs.get("attr_id", self.id)
        try:
            return datafold(requests.get("{}/attrs/{}/{}/children".format(API, self.attr_type, attr_id)).json())
        except ValueError:
            return []

    def color(self):
        if hasattr(self.attr, "color"):
            return self.attr["color"]
        return "#006ea8"

    def load_vars(self):
        """Reads variables from disk and resolves them based on API"""
        profile_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(profile_path, self.attr_type, "vars.yml")
        if os.path.isfile(file_path):
            var_data = yaml.load(open(file_path))
            # call api to retrieve data
            var_map = [multi_col_top(self, params) for params in var_data]
            # merge the various namespaces into a single dict
            var_map = merge_dicts(*var_map)
            return var_map
        return None

    def image(self):
        if "image_link" in self.attr:
            url = "/static/img/splash/{}/".format(self.attr_type)
            if self.attr["image_link"]:
                return {"url": "{}{}.jpg".format(url,self.attr["id"]), "link": self.attr["image_link"], "author": self.attr["image_author"]}
            parents = [fetch(p["id"], self.attr_type) for p in self.parents()]
            for p in reversed(parents):
                if p["image_link"]:
                    return {"url": "{}{}.jpg".format(url,p["id"]), "link": p["image_link"], "author": p["image_author"]}
        return None

    def parents(self):
        url = "{}/attrs/{}/{}/parents".format(API, self.attr_type, self.id)
        try:
            return datafold(requests.get(url).json())
        except ValueError:
            return []

    def sections(self):
        """list[Section]: Loads YAML configuration files and converts them to Section classes. """

        # pass each file to the Section class and return the final array
        return [Section(f, self) for f in self.splash.sections]
