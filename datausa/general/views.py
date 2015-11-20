# -*- coding: utf-8 -*-
import json
from random import randint
from flask import Blueprint, g, render_template
from config import API
from datausa import app
from datausa.utils.format import affixes, dictionary, percentages, proportions

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 8
    g.affixes = json.dumps(affixes)
    g.dictionary = json.dumps(dictionary)
    g.percentages = json.dumps(percentages)
    g.proportions = json.dumps(proportions)
    g.api = API

@mod.route("/")
def home():
    g.page_type = "home"
    bg_imgs = randint(1,7)
    return render_template("general/home.html", bg_imgs = bg_imgs)
