import os
from section import Section
from datausa.utils import fetch

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

    def color(self):
        if hasattr(self.attr, "color"):
            return self.attr["color"]
        return "#006ea8"

    def sections(self):
        """list[Section]: Loads YAML configuration files and converts them to Section classes. """

        # determine path to each of the YAML files
        profile_path = os.path.dirname(os.path.realpath(__file__))
        directory = os.path.join(profile_path, self.path, "sections/")
        files = [os.path.join(directory, "{}.yml".format(f)) for f in self.section_order]

        # pass each file to the Section class and return the final array
        return [Section("".join(open(f).readlines()), self) for f in files]
