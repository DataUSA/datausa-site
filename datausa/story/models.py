import yaml
import json
import re

from datausa.profile.section import Section
from datausa.profile.profile import Profile
from datausa import base_dir

from os.path import join, isfile
import os
from datausa.utils.format import num_format
from datausa.utils.data import fetch
from dateutil import parser

STORIES_DIR = join(base_dir, "story", "stories")

def date_from_filename(filename):
    date_pattern = re.match("(\d+-\d+-\d+)", filename)
    if date_pattern:
        return date_pattern.group(0)

class StoryPreview(object):
    def __init__(self, filename, path):
        self.story_id = filename[:-4]
        story_conf = yaml.load(open(path))
        self.title = story_conf['title'] if 'title' in story_conf else ''
        self.description = story_conf['description'] if 'description' in story_conf else ''
        self.date = story_conf['date'] if 'date' in story_conf else ''
        if not self.date:
            self.date = date_from_filename(filename)
        self._date_obj = parser.parse(self.date)
        self.date = self._date_obj.strftime("%B %-d, %Y")
        self.authors = story_conf['authors'] if 'authors' in story_conf else []
        self.background_image = story_conf['background_image'] if 'background_image' in story_conf else None

    @classmethod
    def generate_list(cls, to_feature=[]):
        available = [(f, join(STORIES_DIR, f)) for f in os.listdir(STORIES_DIR) if isfile(join(STORIES_DIR, f)) and not "-draft" in f and not "DS_Store" in f]
        stories = [StoryPreview(filename, path) for filename, path in available]
        stories.sort(key = lambda x: x._date_obj, reverse=True)
        featured_stories = []
        if to_feature:
            tmp_stories = []
            featured_stories = []
            for story in stories:
                if story.story_id in to_feature:
                    featured_stories.append(story)
                else:
                    tmp_stories.append(story)
            stories = tmp_stories
        return stories, featured_stories


class Story(Profile):

    def __init__(self, attr_id, attr_type):
        self._id = attr_id
        self.attr_type = attr_type
        self.attr = {"id": "01000US", "name": "United States"}

        # read and update
        file_obj = self.open_file(attr_id)
        story_conf = yaml.load(file_obj)
        self.title = story_conf['title'] if 'title' in story_conf else ''
        self.description = story_conf['description'] if 'description' in story_conf else ''
        self.footnotes = story_conf['footnotes'] if 'footnotes' in story_conf else None
        self.date = story_conf['date'] if 'date' in story_conf else ''
        if not self.date:
            self.date = date_from_filename(attr_id)
        self._date_obj = parser.parse(self.date)
        self.date = self._date_obj.strftime("%B %-d, %Y")
        self.authors = story_conf['authors'] if 'authors' in story_conf else []
        self.background_image = story_conf['background_image'] if 'background_image' in story_conf else None

        if self.background_image and "splash" in self.background_image:
            image_array = self.background_image.split("/")
            attr_type = image_array[4]
            attr_id = image_array[5].split(".")[0]
            attr = fetch(attr_id, attr_type)
            self.attr = fetch(attr_id, attr_type)

        tmp_obj = {"topics": story_conf['topics']}
        for i, t in enumerate(tmp_obj["topics"]):
            if "viz_url" in t:
                t["viz"] = Story.grab(t["viz_url"])
            if "topic_url" in t:
                tmp_obj["topics"][i] = Story.grab(t["topic_url"], True)
        section = Section(self.load_yaml(tmp_obj), self)
        self.topics = section.topics

    def id(self, **kwargs):
        return self._id

    @classmethod
    def grab(cls, viz_url, whole_topic=False):
        junk, needed = viz_url.split("/profile/")
        attr_type, attr_id, section, slug = [x for x in needed.split("/") if x]
        target_dir = join(base_dir, "profile", attr_type)
        allowed = [f for f in os.listdir(target_dir) if isfile(join(target_dir, f))]
        if section + ".yml" in allowed:
            section_file = open(join(target_dir, section + ".yml"))
            section_dict = yaml.load(section_file)
            for t in section_dict['topics']:
                if 'slug' in t and t['slug'] == slug:
                    if whole_topic:
                        topic = t
                        viz_data = topic["viz"]
                        viz_data = [viz_data] if not isinstance(viz_data, list) else viz_data
                        del topic["viz"]
                        ret_obj = cls.process_viz(attr_id, attr_type, {"topics" : [t]})[0]
                        ret_obj["viz"] = cls.process_viz(attr_id, attr_type, {"topics" : viz_data})
                        return ret_obj
                    viz_data = t['viz']
                    viz_data = [viz_data] if not isinstance(viz_data, list) else viz_data
                    result = cls.process_viz(attr_id, attr_type, {"topics" : viz_data})
                    return result

    @classmethod
    def process_viz(cls, attr_id, attr_type, viz_obj):
        profile = Profile(attr_id, attr_type)
        section = Section(profile.load_yaml(viz_obj), profile)
        return section.topics
