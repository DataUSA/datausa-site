# -*- coding: utf-8 -*-
import os

# general flask library
from flask import Flask

from config import DEBUG
from datausa.utils.format import jinja_formatter, url_for_other_page
from flask.ext.cache import Cache
import logging

# Base directory of where the site is held
base_dir = os.path.abspath(os.path.dirname(__file__))

# Initialize app
app = Flask(__name__, template_folder=os.path.join(base_dir, "html"))

if not DEBUG:
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(logging.DEBUG)

# Set Jinja2 Config
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True
app.jinja_env.add_extension("jinja2.ext.do")
app.jinja_env.filters['format'] = jinja_formatter
app.jinja_env.globals['url_for_other_page'] = url_for_other_page

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
    "libs/first/*.js",
    "libs/second/*.js",
    "base.js",
    "plugins/*.js",
    "helpers/*.js",
    "styles/*.js",
    "viz/*.js",
    "viz/configs/*.js",
    "viz/data/*.js",
    "viz/geo/*.js",
    output="js/site.js"
)
assets.register("js", js)

# Load and register the modules for each different section of the site
for view in ["cart", "general", "map", "profile", "search", "story", "visualize"]:
    mod = __import__("datausa.{}.views".format(view), fromlist=["mod"])
    mod = getattr(mod, "mod")
    app.register_blueprint(mod)
