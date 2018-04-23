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

    attr = fetch(attr_id, attr_kind)

    def formatImage(attr, attr_type):
        url = "/static/img/splash/{}/".format(attr_type)
        image_attr = False
        if "image_link" in attr and attr["image_link"]:
            image_attr = attr
        else:
            parents = [fetch(p["id"], attr_type) for p in get_parents(attr["id"], attr_type)]
            for p in reversed(parents):
                if "image_link" in p and p["image_link"]:
                    image_attr = p
                    break
        if image_attr:
            return image_attr["id"]

    if attr_kind == "university" and attr["image_link"] == None:
        if "msa" in attr and attr["msa"] != None:
            my_id = formatImage(fetch(attr["msa"], "geo"), "geo")
            attr_kind = "geo"
        else:
            my_id = formatImage(fetch("250000", "soc"), "soc")
            attr_kind = "soc"
    else:
        my_id = formatImage(attr, attr_kind)


    static_root_url = SPLASH_IMG_DIR.format(mode, attr_kind)
    img_url = static_root_url.format(mode, attr_kind) + "{}.jpg".format(my_id)

    return redirect(img_url)
