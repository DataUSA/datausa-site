# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

mod = Blueprint("map", __name__, url_prefix="/map")

@mod.route("/")
def map():
    return render_template("map/index.html")
