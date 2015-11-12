# -*- coding: utf-8 -*-
from flask import abort, Blueprint, g, jsonify, render_template, request
from config import CROSSWALKS, PROFILES
from datausa.profile.profile import Profile
from datausa.utils.data import attr_cache, stat

# create the profile Blueprint
mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.before_request
def before_request():
    g.page_type = "profile"

# create a route and function for the education profile that accepts a CIP id
@mod.route("/<attr_type>/<attr_id>/")
def profile(attr_type, attr_id):

    if not attr_type in PROFILES and not attr_type in CROSSWALKS:
        abort(404);

    if attr_type in CROSSWALKS:
        attr = attr_cache[attr_type][attr_id]
        return render_template("profile/redirect.html", attr=attr)

    g.page_class = attr_type

    # pass id and type to Profile class
    p = Profile(attr_id, attr_type)

    # render the profile template and pass the profile to jinja
    return render_template("profile/index.html", profile = p)

@mod.route("/stat/")
def statView():
    args = {k: v for k, v in request.args.iteritems()}
    col = args.pop("col", "name")
    dataset = args.pop("dataset", False)
    if dataset == "False":
        dataset = False
    return jsonify(stat(args, col=col, dataset=dataset))
