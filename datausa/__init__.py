# -*- coding: utf-8 -*-
import os

# general flask library
from flask import Flask

# Base directory of where the site is held
base_dir = os.path.abspath(os.path.dirname(__file__))

# Initialize app
app = Flask(__name__, template_folder=os.path.join(base_dir, "html"))

# Load default configuration from config.py
app.config.from_object("config")

# Load and register the the profile module
from datausa.profile.views import mod as profile_module
app.register_blueprint(profile_module)
