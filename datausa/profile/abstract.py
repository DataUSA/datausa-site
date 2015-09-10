import os, requests
from abc import ABCMeta

from section import Section
from datausa.utils import fetch

class Profile(object):

    __metaclass__ = ABCMeta

    def __init__(self, attr_id, attr_type):
        self.id = attr_id
        self.attr = fetch(attr_id, attr_type)
        self.attr_type = attr_type

    def sections(self):
        profile_path = os.path.dirname(os.path.realpath(__file__))
        directory = os.path.join(profile_path, self.path, "sections/")
        files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith(".yml")]
        return [Section("".join(open(f).readlines()), self) for f in files]
