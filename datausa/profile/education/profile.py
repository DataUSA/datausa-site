import yaml
from datausa.profile.abstract import Profile
from datausa.utils import fetch

class EduProfile(Profile):

    def __init__(self, attr_id):

        self.path = "education/"
        self.section_order = ["institutions", "demographics"]

        super(EduProfile, self).__init__(attr_id, "cip")
