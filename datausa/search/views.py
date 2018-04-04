# -*- coding: utf-8 -*-
import json
from flask import Blueprint, g, render_template, request, redirect
from datausa.utils.data import profile_cache
from datausa.utils.data import fetch, get_parents
from config import SPLASH_IMG_DIR


mod = Blueprint("search", __name__, url_prefix="/search")

@mod.route("/")
def index():
    g.page_type = "search"
    return render_template("search/index.html", anchors=json.dumps(profile_cache))

@mod.route("/<attr_kind>/<attr_id>/img/")
def get_img(attr_kind, attr_id, mode="thumb"):
    gobj = fetch(attr_id, attr_kind)
    my_id = gobj['id']
    if attr_kind == "university" and gobj["image_link"] == None:
        if "msa" in gobj and gobj["msa"] != None:
            gobj = fetch(gobj["msa"], "geo")
            attr_kind = "geo"
        else:
            gobj = fetch("250000", "soc")
            attr_kind = "soc"
        my_id = gobj['id']
    elif 'image_link' not in gobj or not gobj['image_link']:
        parents = get_parents(attr_id, attr_kind)
        for p in reversed(parents):
            p = fetch(p["id"], attr_kind)
            if "image_link" in p and p['image_link']:
                my_id = p['id']
                break
    static_root_url = SPLASH_IMG_DIR.format(mode, attr_kind)
    img_url = static_root_url.format(mode, attr_kind) + "{}.jpg".format(my_id)
    return redirect(img_url)
