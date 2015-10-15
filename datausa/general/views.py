# -*- coding: utf-8 -*-
import json
from flask import Blueprint, g, render_template
from datausa import app
from datausa.utils.format import dictionary

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 1
    g.dictionary = json.dumps(dictionary)

@mod.route("/")
def home():
    return render_template("general/home.html")
