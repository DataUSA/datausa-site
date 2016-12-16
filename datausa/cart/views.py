# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template

mod = Blueprint("cart", __name__, url_prefix="/cart")

@mod.route("/")
def cart():
    g.page_type = "cart"

    return render_template("cart/index.html")
