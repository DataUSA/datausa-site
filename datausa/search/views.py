# -*- coding: utf-8 -*-
import json
from flask import Blueprint, g, render_template, request, send_from_directory
from datausa.utils.data import profile_cache
from datausa.utils.data import fetch, get_parents
from config import SPLASH_IMG_DIR


mod = Blueprint("search", __name__, url_prefix="/search")

@mod.route("/")
def index():
    g.page_type = "search"
    return render_template("search/index.html", anchors=json.dumps(profile_cache))

@mod.route("/<attr_kind>/<attr_id>/img/")
def get_img(attr_kind, attr_id):
    gobj = fetch(attr_id, attr_kind)
    my_id = gobj['id']
    if 'image_link' not in gobj or not gobj['image_link']:
        parents = get_parents(attr_id, attr_kind)
        # raise Exception("raa", parents)
        for p in reversed(parents):
            p = fetch(p["id"], attr_kind)
            if "image_link" in p and p['image_link']:
                my_id = p['id']
    mode = "thumb" if request.args.get("thumb", True) else "splash"
    my_str = SPLASH_IMG_DIR.format("thumb", attr_kind)
    print my_str.format(mode, attr_kind)
    return send_from_directory(my_str.format(mode, attr_kind),
                               "{}.jpg".format(my_id))
