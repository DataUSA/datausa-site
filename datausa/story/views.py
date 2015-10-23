# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template

mod = Blueprint("story", __name__, url_prefix="/story")

@mod.route("/")
def index():
	g.page_type = "story"
	return render_template("story/index.html")
