# -*- coding: utf-8 -*-
import os

''' Default debugging to True '''
DEBUG = not os.environ.get("DATAUSA_PRODUCTION", False)

''' Base URL used for API calls '''
API = os.environ.get("DATAUSA_API", "https://api.datausa.io")
PROFILES = ["cip", "soc", "naics", "geo", "university"]
CROSSWALKS = ["acs_ind", "acs_occ", "commodity_iocode", "industry_iocode", "iocode"]

''' Use a filesystem cache '''
basedir = os.path.abspath(os.path.dirname(__file__))
CACHE_TYPE = 'filesystem'
CACHE_DIR = os.path.join(basedir, 'cache_data/')
CACHE_DEFAULT_TIMEOUT = int(os.environ.get("CACHE_DEFAULT_TIMEOUT", 60 * 60 * 24 * 7 * 4)) # 28 days
CACHE_THRESHOLD = 3000000
SPLASH_IMG_DIR = "/static/img/{}/{}/"
