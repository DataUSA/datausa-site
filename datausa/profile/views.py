# -*- coding: utf-8 -*-
from flask import Blueprint, render_template
from datausa.profile.education.profile import EduProfile

mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.route("/education/<attr_id>/")
def education(attr_id):
    p = EduProfile(attr_id)
    return render_template("profile/index.html", profile = p)
