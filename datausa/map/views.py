# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template, request
from datausa.consts import DICTIONARY

mod = Blueprint("map", __name__, url_prefix="/map")

@mod.route("/")
def map():
    g.page_type = "map"

    datalevels = {
        "acs": ["state", "county", "msa", "puma"],
        "chr": ["state", "county"],
        "ipeds": ["state", "county", "msa", "puma"],
        "pums": ["state", "puma"]
    }

    mapdata = {

        "acs": [
            "pop,pop_moe,pop_rank",
            "age,age_moe,age_rank",
            "income,income_moe,income_rank",
            "mean_commute_minutes",
            "non_eng_speakers_pct",
            "median_property_value,median_property_value_moe",
            "owner_occupied_housing_units",
            "us_citizens"
        ],

        "chr": [
            "health_care_costs",
            "adult_obesity",
            "diabetes",
            "sexually_transmitted_infections",
            "hiv_prevalence_rate",
            "alcoholimpaired_driving_deaths",
            "excessive_drinking",
            "adult_smoking",
            "homicide_rate",
            "violent_crime",
            "motor_vehicle_crash_deaths",

            "premature_death",
            "poor_or_fair_health",
            "poor_physical_health_days",
            "poor_mental_health_days",
            "low_birthweight",
            "food_environment_index",
            "physical_inactivity",
            "access_to_exercise_opportunities",
            "teen_births",
            "uninsured",
            "preventable_hospital_stays",
            "diabetic_screening",
            "mammography_screening",
            "high_school_graduation",
            "some_college",
            "children_in_poverty",
            "children_in_singleparent_households",
            "social_associations",
            "injury_deaths",
            "polution_ppm",
            "drinking_water_violations",
            "severe_housing_problems",
            "population_living_in_a_rural_area",
            "premature_ageadjusted_mortality",
            "infant_mortality",
            "child_mortality",
            "food_insecurity",
            "limited_access_to_healthy_foods",
            "drug_poisoning_deaths",
            "uninsured_adults",
            "uninsured_children",
            "could_not_see_doctor_due_to_cost",
            "children_eligible_for_free_lunch",

            "unemployment",
            "income_inequality",
            "driving_alone_to_work",
            "long_commute__driving_alone",
            "population_that_is_not_proficient_in_english",
            "median_household_income"
        ],

        "ipeds": [
            "grads_total",
            "grads_total_growth"
        ],

        "pums": [
            "avg_wage,avg_wage_moe",
            "avg_wage_ft,avg_wage_ft_moe",
            "avg_wage_pt,avg_wage_pt_moe",
            "num_ppl,num_ppl_moe",
            "num_ppl_ft,num_ppl_ft_moe",
            "num_ppl_pt,num_ppl_pt_moe",
            "avg_age,avg_age_moe",
            "avg_age_ft,avg_age_ft_moe",
            "avg_age_pt,avg_age_pt_moe",
            "avg_hrs,avg_hrs_moe",
            "avg_hrs_ft,avg_hrs_ft_moe",
            "avg_hrs_pt,avg_hrs_pt_moe",
            "gini"
        ]

    }

    defaultKey = request.args.get("key", "age,age_moe,age_rank")
    defaultLevel = request.args.get("level", "county")

    datasets = sorted([d for d in mapdata], key=lambda x: DICTIONARY[d])
    sumlevels = ["state", "county", "msa", "puma"]
    keys = []
    mapdataFlat = {}
    for dataset in mapdata:
        if defaultKey in mapdata[dataset]:
            defaultDataset = dataset
        keys += [k for k in mapdata[dataset]]
        for k in mapdata[dataset]:
            mapdataFlat[k] = datalevels[dataset]
    keys = sorted(keys, key=lambda x: DICTIONARY[x.split(",")[0]])
    defaultKey = defaultKey.split(",")[0]

    return render_template("map/index.html", mapdata=mapdataFlat, datasets=datasets, keys=keys, sumlevels=sumlevels,
                                             defaultKey=defaultKey, defaultLevel=defaultLevel, defaultDataset=defaultDataset)
