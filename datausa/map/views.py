# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template, request
from datausa.consts import DICTIONARY

mod = Blueprint("map", __name__, url_prefix="/map")

@mod.route("/")
def map():
    g.page_type = "map"

    mapdata = {

        "acs": {
            "pop,pop_moe,pop_rank": ["state", "county", "msa", "puma"],
            "age,age_moe,age_rank": ["state", "county", "msa", "puma"],
            "income,income_moe,income_rank": ["state", "county", "msa", "puma"],
            "mean_commute_minutes": ["state", "county", "msa", "puma"],
            "non_eng_speakers_pct": ["state", "county", "msa", "puma"],
            "median_property_value,median_property_value_moe": ["state", "county", "msa", "puma"],
            "owner_occupied_housing_units": ["state", "county", "msa", "puma"],
            "us_citizens": ["state", "county", "msa", "puma"]
        },

        "chr": {
            "health_care_costs": ["state", "county"],
            "adult_obesity": ["state", "county"],
            "diabetes": ["state", "county"],
            "sexually_transmitted_infections": ["state", "county"],
            "hiv_prevalence_rate": ["state", "county"],
            "alcoholimpaired_driving_deaths": ["state", "county"],
            "excessive_drinking": ["state", "county"],
            "adult_smoking": ["state", "county"],
            "homicide_rate": ["state", "county"],
            "violent_crime": ["state", "county"],
            "motor_vehicle_crash_deaths": ["state", "county"]
        },

        "ipeds": {
            "grads_total": ["state", "county", "msa", "puma"],
            "grads_total_growth": ["state", "county", "msa", "puma"]
        },

        "pums": {
            "avg_wage,avg_wage_moe": ["state", "puma"],
            "avg_wage_ft,avg_wage_ft_moe": ["state", "puma"],
            "avg_wage_pt,avg_wage_pt_moe": ["state", "puma"],
            "num_ppl,num_ppl_moe": ["state", "puma"],
            "num_ppl_ft,num_ppl_ft_moe": ["state", "puma"],
            "num_ppl_pt,num_ppl_pt_moe": ["state", "puma"],
            "avg_age,avg_age_moe": ["state", "puma"],
            "avg_age_ft,avg_age_ft_moe": ["state", "puma"],
            "avg_age_pt,avg_age_pt_moe": ["state", "puma"],
            "avg_hrs,avg_hrs_moe": ["state", "puma"],
            "avg_hrs_ft,avg_hrs_ft_moe": ["state", "puma"],
            "avg_hrs_pt,avg_hrs_pt_moe": ["state", "puma"],
            "gini": ["state", "puma"]
        }

    }

    defaultKey = request.args.get("key", "age,age_moe,age_rank")
    defaultLevel = request.args.get("level", "county")

    datasets = sorted([d for d in mapdata], key=lambda x: DICTIONARY[d])
    sumlevels = ["state", "county", "msa", "puma"]
    keys = []
    for d in mapdata:
        if defaultKey in mapdata[d]:
            defaultDataset = d
        keys += [k for k in mapdata[d]]
    keys = sorted(keys, key=lambda x: DICTIONARY[x.split(",")[0]])
    defaultKey = defaultKey.split(",")[0]

    return render_template("map/index.html", mapdata=mapdata, datasets=datasets, keys=keys, sumlevels=sumlevels,
                                             defaultKey=defaultKey, defaultLevel=defaultLevel, defaultDataset=defaultDataset)
