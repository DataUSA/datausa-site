import os, requests
from section import Section
from config import API
from datausa.utils.data import datafold, fetch

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

        self.splash = Section(self.file2string("splash"), self)

    def children(self):
        try:
            return datafold(requests.get("{}/attrs/{}/{}/children".format(API, self.attr_type, self.id)).json())
        except ValueError:
            raise Exception(params)

    def color(self):
        if hasattr(self.attr, "color"):
            return self.attr["color"]
        return "#006ea8"

    def file2string(self, file):
        profile_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(profile_path, self.attr_type, "{}.yml".format(file))
        return "".join(open(file_path).readlines())

    def image(self):
        return "/static/img/splash/cip/4005.jpg"

    def parents(self):
        try:
            return datafold(requests.get("{}/attrs/{}/{}/parents".format(API, self.attr_type, self.id)).json())
        except ValueError:
            raise Exception(params)

    def sections(self):
        """list[Section]: Loads YAML configuration files and converts them to Section classes. """

        # pass each file to the Section class and return the final array
        return [Section(self.file2string(f), self) for f in self.splash.sections]
