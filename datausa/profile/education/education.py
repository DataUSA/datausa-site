from datausa.profile.profile import Profile

class EduProfile(Profile):
    """The main Education Profile class.

    Attributes:
        path (str): Name of the folder where this file is located.
        section_order (List[str]): Order list of strings that match the YAML configuration filenames, on order they should appear on the page.

    """

    def __init__(self, attr_id):
        """Initializes a new Education Profile class.

        Args:
            attr_id (str): String ID of CIP attribute.

        """

        """ set 'path' and 'section_order' """
        self.path = "education/"
        self.section_order = ["institutions", "demographics"]

        """ call parent class's init function, manually passing 'cip' as the attr_type """
        super(EduProfile, self).__init__(attr_id, "cip")
