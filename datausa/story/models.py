import yaml
import json

from datausa.profile.section import Section
from datausa.profile.profile import Profile
from datausa import base_dir


class Story(Profile):

    def __init__(self, attr_id, attr_type):
        self.id = attr_id
        self.attr_type = attr_type
        self.attr = {"id": "01000US", "name": "United States"}
        
        # read and update
        file_obj = self.open_file(attr_id)
        story_conf = yaml.load(file_obj)
        self.title = story_conf['title'] if 'title' in story_conf else ''
        self.description = story_conf['description'] if 'description' in story_conf else ''
        self.date = story_conf['date'] if 'date' in story_conf else ''
        self.authors = story_conf['authors'] if 'authors' in story_conf else []
        self.background_image = story_conf['background_image'] if 'background_image' in story_conf else None
            
        tmp_obj = {"topics": story_conf['topics']}
        section = Section(json.dumps(tmp_obj), self)
        self.topics = section.topics
