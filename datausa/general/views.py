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
    g.cache_version = 11
    g.affixes = json.dumps(affixes)
    g.dictionary = json.dumps(dictionary)
    g.percentages = json.dumps(percentages)
    g.proportions = json.dumps(proportions)
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
