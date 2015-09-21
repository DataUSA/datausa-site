# -*- coding: utf-8 -*-
import os

''' Default debugging to True '''
DEBUG = not os.environ.get("DATAUSA_PRODUCTION", False)

''' Base URL used for API calls '''
API = os.environ.get("DATAUSA_API", "http://usa.datawheel.us:5000")

''' Use a filesystem cache '''
basedir = os.path.abspath(os.path.dirname(__file__))
CACHE_TYPE = 'filesystem'
CACHE_DIR = os.path.join(basedir, 'cache_data/')