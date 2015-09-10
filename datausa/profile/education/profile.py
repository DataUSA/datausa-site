import yaml
from datausa.profile.abstract import Profile

class EduProfile(Profile):

    def __init__(self, attr_id):
        self.path = "education/"
        super(EduProfile, self).__init__(attr_id, "cip")
