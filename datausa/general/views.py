# -*- coding: utf-8 -*-
import copy, json
from random import randint
from flask import Blueprint, g, render_template, request, url_for, redirect, abort
from config import API
from datausa import app
from datausa.consts import AFFIXES, DICTIONARY, PERCENTAGES, PROPORTIONS, SUMLEVELS
from datausa.utils.data import attr_cache, fetch, profile_cache, story_cache
from pagination import Pagination

from .home import HOMEFEED, TYPEMAP

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 18
    g.affixes = json.dumps(AFFIXES)
    g.dictionary = json.dumps(DICTIONARY)
    g.percentages = json.dumps(PERCENTAGES)
    g.proportions = json.dumps(PROPORTIONS)
    g.api = API

@mod.route("/")
def home():
    g.page_type = "home"

    feed = [copy.copy(f) for f in HOMEFEED]
    for box in feed:
        if "featured" not in box:
            box["featured"] = False
        if "/profile/" in box["link"]:
            attr_type = box["link"].split("/")[2]
            attr_id = box["link"].split("/")[3]
            attr = fetch(attr_id, attr_type)
            box["title"] = attr["display_name"] if "display_name" in attr else attr["name"]
            section = [s for s in profile_cache[attr_type]["sections"] if s["anchor"] == box["section"]][0]
            box["section"] = {
                "title": section["title"],
                "icon": "/static/img/icons/{}.svg".format(box["section"])
            }
            sumlevel = attr["sumlevel"] if "sumlevel" in attr else attr["level"]
            if attr_type == "cip":
                sumlevel = (sumlevel + 1) * 2
            sumlevel = str(sumlevel)
            sumlevel = SUMLEVELS[attr_type][sumlevel]
            sumlevel = sumlevel["shortlabel"] if "shortlabel" in sumlevel else sumlevel["label"]
            box["type"] = {
                "icon": "/static/img/icons/{}.svg".format(attr_type),
                "title": "Profile",
                "type": TYPEMAP[attr_type],
                "depth": sumlevel.replace("_"," ")
            }
            box["image"] = "/static/img/thumb/{}".format(attr["image_path"])
        elif "/story/" in box["link"]:
            box["type"] = {
                "icon": "/static/img/icons/about.svg",
                "title": TYPEMAP["story"],
                "type": "story"
            }
            story = [s for s in story_cache if s["story_id"] == box["link"].split("/")[2]][0]
            box["image"] = story["background_image"]
            box["title"] = story["title"]
            box["subtitle"] = story["description"]
            box["author"] = "By {}".format(story["authors"][0]["name"])
        elif "/map/" in box["link"]:
            box["type"] = {
                "icon": "/static/img/icons/demographics.svg",
                "title": TYPEMAP["map"],
                "type": "map"
            }
            box["viz"] = "geo_map"

    return render_template("general/home.html", feed=feed)

@mod.route("/about/")
def about():
    g.page_type = "about"
    g.page_sub_type = "index"
    return render_template("about/index.html")

@mod.route("/about/datasets/")
def datasets():
    g.page_type = "about"
    g.page_sub_type = "datasets"
    return render_template("about/datasets.html")

@mod.route("/about/glossary/")
def glossary():
    g.page_type = "about"
    g.page_sub_type = "glossary"
    return render_template("about/glossary.html")

@mod.route("/about/api/")
def api():
    g.page_type = "about"
    g.page_sub_type = "api"
    return render_template("about/api.html")

@mod.route("/about/attributes/")
@mod.route("/about/attributes/<attr_type>/")
@mod.route("/about/attributes/<attr_type>/<sumlevel>/")
def attributes_redir(attr_type="geo", sumlevel=None):
    sumlevel_key = 'sumlevel' if attr_type == "geo" else 'shortlabel'
    sumlevels = {sv[sumlevel_key]:dict(sv.items() + [('id',sk)]) for sk, sv in SUMLEVELS[attr_type].items() if sk != "140" and sk != "860"}
    this_sumlevel = sumlevel or sumlevels.keys()[0]
    return redirect(url_for('.attributes', attr_type=attr_type, sumlevel=this_sumlevel, page=1))

@mod.route("/about/attributes/<attr_type>/<sumlevel>/<int:page>/")
def attributes(attr_type, sumlevel, page):
    args = request.view_args.copy()
    g.page_type = "about"
    g.page_sub_type = "attributes"
    sumlevel_key = 'sumlevel' if attr_type == "geo" else 'shortlabel'
    sorting = request.args.get("sort")
    ordering = request.args.get("order", '')
    PER_PAGE = 100
    offset = PER_PAGE * (page - 1)

    sumlevels = {sv[sumlevel_key]:dict(sv.items() + [('id',sk)]) for sk, sv in SUMLEVELS[attr_type].items() if sk != "140" and sk != "860"}
    this_sumlevel = sumlevel or sumlevels.keys()[0]
    this_sumlevel = sumlevels[this_sumlevel]

    if attr_type == "geo":
        attrs = [a for a in attr_cache[attr_type].values() if a['sumlevel'] == this_sumlevel['id'] and 'pretty' in a]
        anchor_key = "url_name"
        name_key = "display_name"
    elif attr_type == "cip":
        attrs = [a for a in attr_cache[attr_type].values() if len(a['id']) == int(this_sumlevel['id'])]
        anchor_key = "id"
        name_key = "name"
    else:
        attrs = [a for a in attr_cache[attr_type].values() if str(a['level']) == this_sumlevel['id']]
        anchor_key = "id"
        name_key = "name"

    headers = [{"name":"ID", "id":"id", "key":"id"}, {"name":"Name", "id":"name", "key":name_key, "anchor_key":anchor_key}]

    # fetch parent State for PUMAs, Places and Counties
    if this_sumlevel["id"] in ['795', '160', '050']:
        headers = headers[:1] + [{"name":"State", "id":"state_name", "key":"state_name", "anchor_key":"state_anchor"},] + headers[1:]
        states = {a["id"][7:9]:a for a in attr_cache[attr_type].values() if a['sumlevel'] == "040" and 'pretty' in a}
        for a in attrs:
            state_id = a["id"][7:9]
            a["state_name"] = states[state_id]["name"]
            a["state_anchor"] = states[state_id]["url_name"]

    sort_key = name_key if sorting == "name" else sorting
    sort_key = sort_key or "id"
    isreversed = True if ordering == "asc" else False
    attrs = sorted(attrs, key=lambda x: x[sort_key], reverse=isreversed)

    count = len(attrs)
    attrs = attrs[offset:(offset+PER_PAGE)]
    if not attrs and page != 1:
        abort(404)

    pagination = Pagination(page, PER_PAGE, count, sorting, ordering)

    return render_template("about/attributes.html",
                            attr_type=attr_type,
                            anchor_key=anchor_key,
                            name_key=name_key,
                            sumlevels=sumlevels,
                            pagination=pagination,
                            this_sumlevel=this_sumlevel,
                            headers=headers,
                            attrs=attrs)

@mod.route("/about/usage/")
def usage():
    g.page_type = "about"
    g.page_sub_type = "usage"
    return render_template("about/usage.html")
