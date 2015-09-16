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

    def sections(self):
        """list[Section]: Loads YAML configuration files and converts them to Section classes. """

        # determine path to each of the YAML files

        # pass each file to the Section class and return the final array
