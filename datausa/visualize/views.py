# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

mod = Blueprint("visualize", __name__, url_prefix="/visualize")

@mod.route("/radar/")
def radar():
    return render_template("visualize/tests/radar.html")

@mod.route("/sankey/")
def sankey():
    return render_template("visualize/tests/sankey.html")
