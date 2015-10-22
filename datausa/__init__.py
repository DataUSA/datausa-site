# -*- coding: utf-8 -*-
import os

# general flask library
from flask import Flask

from config import DEBUG
from flask.ext.cache import Cache

# Base directory of where the site is held
base_dir = os.path.abspath(os.path.dirname(__file__))

# Initialize app
app = Flask(__name__, template_folder=os.path.join(base_dir, "html"))

# Set Jinja2 Config
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True
app.jinja_env.add_extension("jinja2.ext.do")

# Load default configuration from config.py
app.config.from_object("config")

# Setup caching
cache = Cache(app)

# Run SCSS compilers if DEBUG
if DEBUG:

    from flask.ext.scss import Scss
    Scss(app)

# Run JS compiler
from flask.ext.assets import Environment, Bundle
assets = Environment(app)
assets.load_path.append(os.path.join(base_dir, "assets/js/"))
js = Bundle(
    "base.js",
    "plugins/*.js",
    "helpers/*.js",
    "viz/*.js",
    "viz/configs/*.js",
    "viz/data/*.js",
    output="js/site.js"
)
assets.register("js", js)

# Load and register the modules for each different section of the site
for view in ["general", "map", "profile", "story", "visualize"]:
    mod = __import__("datausa.{}.views".format(view), fromlist=["mod"])
    mod = getattr(mod, "mod")
    app.register_blueprint(mod)
