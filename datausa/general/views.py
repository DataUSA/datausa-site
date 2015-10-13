# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template

mod = Blueprint("general", __name__)

@mod.before_request
def before_request():
    g.page_type = "profile"
    g.cache_version = 1

@mod.route("/")
def home():
    return render_template("general/home.html")
