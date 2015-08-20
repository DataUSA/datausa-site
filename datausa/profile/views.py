# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.route("/geo/<id>/")
def profile(id):
    return render_template("profile/index.html")
