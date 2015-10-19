# -*- coding: utf-8 -*-
from flask import Blueprint, g, jsonify, render_template, request
from datausa.profile.profile import Profile
from datausa.utils.data import stat as stat_logic

# create the profile Blueprint
mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.before_request
def before_request():
    g.page_type = "profile"

# create a route and function for the education profile that accepts a CIP id
@mod.route("/<any('cip'):attr_type>/<attr_id>/")
def profile(attr_type, attr_id):

    # pass id and type to Profile class
    p = Profile(attr_id, attr_type)

    # render the profile template and pass the profile to jinja
    return render_template("profile/index.html", profile = p)

@mod.route("/stat/")
def stat():
    args = {k: v for k, v in request.args.iteritems()}
    col = args.pop("col", "name")
    dataset = args.pop("dataset", False)
    if dataset == "False":
        dataset = False
    return jsonify(stat_logic(args, col=col, dataset=dataset))
