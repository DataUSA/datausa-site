# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template
from datausa.profile.education.education import EduProfile

# create the profile Blueprint
mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.before_request
def before_request():
    g.page_type = "profile"

# create a route and function for the education profile that accepts a CIP id
@mod.route("/education/<attr_id>/")
def education(attr_id):

    # pass CIP id to the EduProfile class
    p = EduProfile(attr_id)

    # render the profile template and pass the profile to jinja
    return render_template("profile/index.html", profile = p)
