# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template

mod = Blueprint("map", __name__, url_prefix="/map")

@mod.route("/")
def map():
    g.page_type = "map"
    return render_template("map/index.html")
