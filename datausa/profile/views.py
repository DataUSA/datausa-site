# -*- coding: utf-8 -*-
from flask import abort, Blueprint, g, jsonify, render_template, request, redirect, url_for
from config import CROSSWALKS, PROFILES
from datausa.profile.profile import Profile
from datausa.utils.data import attr_cache, acs_crosswalk
from datausa.utils.manip import stat
from datausa.search.views import get_img
from random import randint

# create the profile Blueprint
mod = Blueprint("profile", __name__, url_prefix="/profile")

@mod.before_request
def before_request():
    g.page_type = "profile"

# create a route and function for the education profile that accepts a CIP id
@mod.route("/")
def profiles():
    g.page_type = "home"
    bg_imgs = randint(1,4)
    return render_template("general/home.html", bg_imgs = bg_imgs)

# create a route and function for the education profile that accepts a CIP id
@mod.route("/<attr_type>/<attr_id>/")
def profile(attr_type, attr_id):

    if "_iocode" in attr_type:
        attr_type = "iocode"

    allowed_type = attr_type in PROFILES or attr_type in CROSSWALKS
    allowed_id = attr_type in attr_cache and attr_id in attr_cache[attr_type]
    if not allowed_type or not allowed_id:
        abort(404);
    if attr_type in CROSSWALKS:
        attr = attr_cache[attr_type][attr_id]

        crosswalks = acs_crosswalk(attr_type, attr_id)
        crosswalk_map = {"acs_occ": "soc", "acs_ind": "naics", "iocode": "naics"}
        crosswalk_labels = {"acs_occ": "ACS Occupation Code", "acs_ind": "ACS Industry Code", "iocode": "BEA I/O Code"}
        if len(crosswalks) > 1:
            g.page_type = "redirect"
            attr["type"] = crosswalk_labels[attr_type]
            return render_template("profile/redirect.html", attr=attr, crosswalks=crosswalks, crosswalk_type=crosswalk_map[attr_type])
        return redirect(url_for('.profile', attr_type=crosswalk_map[attr_type], attr_id=crosswalks[0]["id"]))

    g.page_class = attr_type


    # pass id and type to Profile class
    attr_data = attr_cache[attr_type][attr_id]
    p = Profile(attr_data["id"], attr_type)

    # render the profile template and pass the profile to jinja
    return render_template("profile/index.html", profile = p)

# create a route and function for the education profile that accepts a CIP id
@mod.route("/dataloca/<attr_type>/<attr_id>/")
def profile_dataloca(attr_type, attr_id):
    return render_template("profile/dataloca.html")

@mod.route("/stat/")
def statView():
    args = {k: v for k, v in request.args.iteritems()}
    col = args.pop("col", "name")
    moe = args.pop("moe", False)
    truncate = int(args.pop("truncate", 0))
    if moe == "False":
        moe = False
    dataset = args.pop("dataset", False)
    if dataset == "False":
        dataset = False
    return jsonify(stat(args, col=col, dataset=dataset, moe=moe, truncate=truncate))

@mod.route("/<attr_kind>/<attr_id>/img/")
def splash_img(attr_kind, attr_id, mode="thumb"):
    return get_img(attr_kind, attr_id, "splash")

@mod.route("/<attr_type>/<attr_id>/<section>/<topic>/")
def embed_view(attr_type, attr_id, section, topic):
    viz_only = request.args.get("viz", False)
    if not attr_type in PROFILES:
        abort(404);

    g.page_class = "{} embed".format(attr_type)

    topics = topic.split(",")
    required_namespaces = Profile.compute_namespaces(attr_type, section, topics)
    p = Profile(attr_id, attr_type, required_namespaces)
    section = p.section_by_topic(section, topics)

    if not section or not section.topics:
        abort(404)

    for t in section.topics:
        if viz_only:
            if "description" in t:
                del t["description"]
            if "stat" in t:
                del t["stat"]
        if "category" in t:
            del t["category"]

    return render_template("profile/embed.html", profile = p, section = section)
