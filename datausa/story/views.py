# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

mod = Blueprint("story", __name__, url_prefix="/story")

@mod.route("/")
def index():
    return render_template("story/index.html")
