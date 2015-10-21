# -*- coding: utf-8 -*-
import json
from flask import Blueprint, g, render_template
from config import API
from datausa import app
from datausa.utils.format import dictionary

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 2
    g.dictionary = json.dumps(dictionary)
    g.api = API

@mod.route("/")
def home():
    g.page_type = "home"
    return render_template("general/home.html")
