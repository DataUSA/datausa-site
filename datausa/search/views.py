# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template
from datausa.utils.data import profile_anchors

mod = Blueprint("search", __name__, url_prefix="/search")

@mod.route("/")
def index():
    g.page_type = "search"
    return render_template("search/index.html", anchors = profile_anchors)
