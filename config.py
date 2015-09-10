# -*- coding: utf-8 -*-
import os

''' Default debugging to False '''
DEBUG = not os.environ.get("DATAUSA_PRODUCTION", True)
