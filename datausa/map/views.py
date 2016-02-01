# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template, request
from datausa.consts import DICTIONARY

mod = Blueprint("map", __name__, url_prefix="/map")

@mod.route("/")
def map():
    g.page_type = "map"

    mapdata = {

        # ACS
        "pop,pop_moe,pop_rank": ["state", "county", "msa", "puma"],
        "age,age_moe,age_rank": ["state", "county", "msa", "puma"],
        "income,income_moe,income_rank": ["state", "county", "msa", "puma"],
        "non_us_citizens": ["state", "county", "msa", "puma"],
        "mean_commute_minutes": ["state", "county", "msa", "puma"],
        # "non_eng_speakers_pct": ["state", "county", "msa", "puma"],
        "median_property_value,median_property_value_moe": ["state", "county", "msa", "puma"],
        "owner_occupied_housing_units": ["state", "county", "msa", "puma"],
        "us_citizens": ["state", "county", "msa", "puma"],

        # CHR
        "alcoholimpaired_driving_deaths": ["state", "county"],
        "excessive_drinking": ["state", "county"],
        "adult_smoking": ["state", "county"],
        "homicide_rate": ["state", "county"],
        "violent_crime": ["state", "county"],
        "motor_vehicle_crash_deaths": ["state", "county"],

        #IPEDS
        "grads_total": ["state", "county", "msa", "puma"],
        "grads_total_growth": ["state", "county", "msa", "puma"],

        #PUMS
        "avg_wage,avg_wage_moe": ["state", "puma"],
        "num_ppl,num_ppl_moe": ["state", "puma"],

    }

    sumlevels = ["state", "county", "msa", "puma"]
    keys = sorted([k for k in mapdata], key=lambda x: DICTIONARY[x.split(",")[0]])

    defaultKey = request.args.get("key", "pop").split(",")[0]
    defaultLevel = request.args.get("level", "state")

    return render_template("map/index.html", mapdata=mapdata, keys=keys, sumlevels=sumlevels,
                                             defaultKey=defaultKey, defaultLevel=defaultLevel)
