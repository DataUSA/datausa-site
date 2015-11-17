# -*- coding: utf-8 -*-
import os
from os.path import isfile, join
from flask import Blueprint, g, render_template, abort
from datausa.story.models import Story, StoryPreview, STORIES_DIR
from datausa import base_dir
mod = Blueprint("story", __name__, url_prefix="/story")


@mod.route("/")
def index():
    g.page_type = "story"
    to_feature = ["11-19-2015_testing"]
    stories, featured_stories = StoryPreview.generate_list(to_feature=to_feature)
    return render_template("story/index.html", stories=stories, featured_stories=featured_stories)

@mod.route("/<story_id>/")
def story_page(story_id):
    g.page_class = 'story'
    allowed = [f for f in os.listdir(STORIES_DIR) if isfile(join(STORIES_DIR, f))]

    if story_id + ".yml" not in allowed:
        return abort(404)

    story = Story(story_id, STORIES_DIR)
    return render_template("story/article.html", story=story)
