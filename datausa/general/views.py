# -*- coding: utf-8 -*-
import json
from random import randint
from flask import Blueprint, g, render_template, request, url_for, redirect, abort
from config import API
from datausa import app
from datausa.consts import AFFIXES, DICTIONARY, PERCENTAGES, PROPORTIONS, SUMLEVELS
from datausa.utils.data import attr_cache
from pagination import Pagination

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 15
    g.affixes = json.dumps(AFFIXES)
    g.dictionary = json.dumps(DICTIONARY)
    g.percentages = json.dumps(PERCENTAGES)
    g.proportions = json.dumps(PROPORTIONS)
    g.api = API

@mod.route("/")
def home():
    g.page_type = "home"
    return render_template("general/home.html")

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
    
    sort_key = name_key if sorting == "name" else "id"
    isreversed = True if ordering == "asc" else False
    attrs = sorted(attrs, key=lambda x: x[sort_key], reverse=isreversed)
    
    count = len(attrs)
    attrs = attrs[offset:(offset+PER_PAGE)]
    if not attrs and page != 1:
        abort(404)
    pagination = Pagination(page, PER_PAGE, count, sorting, ordering)
    # raise Exception(pagination.next_order)

    return render_template("about/attributes.html",
                            attr_type=attr_type,
                            anchor_key=anchor_key,
                            name_key=name_key,
                            sumlevels=sumlevels,
                            pagination=pagination,
                            this_sumlevel=this_sumlevel,
                            attrs=attrs)

@mod.route("/about/usage/")
def usage():
    g.page_type = "about"
    g.page_sub_type = "usage"
    return render_template("about/usage.html")
