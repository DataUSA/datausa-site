import yaml
import json

from datausa.profile.section import Section
from datausa.profile.profile import Profile
from datausa import base_dir

from os.path import join, isfile
import os
from datausa.utils.format import num_format, sumlevels
from datausa.utils.data import fetch

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
        for idx, t in enumerate(tmp_obj["topics"]):
            if "viz_url" in t:
                tmp_obj["topics"][idx] = Story.grab(t["viz_url"])
        section = Section(json.dumps(tmp_obj), self)
        self.topics = section.topics

    @classmethod
    def grab(cls, viz_url):
        junk, needed = viz_url.split("/profile/")
        attr_type, attr_id, section, slug = [x for x in needed.split("/") if x]
        target_dir = join(base_dir, "profile", attr_type)
        allowed = [f for f in os.listdir(target_dir) if isfile(join(target_dir, f))]
        if section + ".yml" in allowed:
            section_file = open(join(target_dir, section + ".yml"))
            section_dict = yaml.load(section_file)
            for t in section_dict['topics']:
                if 'slug' in t and t['slug'] == slug:
                    result = cls.process_viz(attr_id, attr_type, {"topics" : t['viz']})
                    return {"viz": result}

    @classmethod
    def process_viz(cls, attr_id, attr_type, viz_obj):
        profile = Profile(attr_id, attr_type)
        section = Section(json.dumps(viz_obj), profile)
        return section.topics
