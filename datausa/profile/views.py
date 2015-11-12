# -*- coding: utf-8 -*-
from flask import abort, Blueprint, g, jsonify, render_template, request
from config import PROFILES
from datausa.profile.profile import Profile
from datausa.utils.data import stat as stat_logic
from datausa.search.views import get_img


# create the profile Blueprint
mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.before_request
def before_request():
    g.page_type = "profile"

# create a route and function for the education profile that accepts a CIP id
@mod.route("/<attr_type>/<attr_id>/")
def profile(attr_type, attr_id):

    if not attr_type in PROFILES:
        abort(404);

    g.page_class = attr_type

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

@mod.route("/<attr_kind>/<attr_id>/img/")
def splash_img(attr_kind, attr_id, mode="thumb"):
    return get_img(attr_kind, attr_id, "splash")
