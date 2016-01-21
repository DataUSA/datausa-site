# -*- coding: utf-8 -*-
import json
from random import randint
from flask import Blueprint, g, render_template
from config import API
from datausa import app
from datausa.consts import AFFIXES, DICTIONARY, PERCENTAGES, PROPORTIONS

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 13
    g.affixes = json.dumps(AFFIXES)
    g.dictionary = json.dumps(DICTIONARY)
    g.percentages = json.dumps(PERCENTAGES)
    g.proportions = json.dumps(PROPORTIONS)
    g.api = API

@mod.route("/")
def home():
    g.page_type = "home"
    return render_template("general/home.html")

@mod.route("/about/")
def about():
    g.page_type = "about"
    g.page_sub_type = "index"
    return render_template("about/index.html")

@mod.route("/about/datasets/")
def datasets():
    g.page_type = "about"
    g.page_sub_type = "datasets"
    return render_template("about/datasets.html")

@mod.route("/about/glossary/")
def glossary():
    g.page_type = "about"
    g.page_sub_type = "glossary"
    return render_template("about/glossary.html")

@mod.route("/about/api/")
def api():
    g.page_type = "about"
    g.page_sub_type = "api"
    return render_template("about/api.html")

@mod.route("/about/usage/")
def usage():
    g.page_type = "about"
    g.page_sub_type = "usage"
    return render_template("about/usage.html")
