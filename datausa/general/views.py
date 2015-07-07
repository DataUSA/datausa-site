# -*- coding: utf-8 -*-
from flask import Blueprint, render_template

mod = Blueprint("general", __name__)

@mod.route("/")
def home():
    return render_template("general/home.html")
