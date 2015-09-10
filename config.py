# -*- coding: utf-8 -*-
import os

''' Default debugging to True '''
DEBUG = not os.environ.get("DATAUSA_PRODUCTION", False)

''' Base URL used for API calls '''
API = os.environ.get("DATAUSA_API", "http://usa.datawheel.us:5000")
