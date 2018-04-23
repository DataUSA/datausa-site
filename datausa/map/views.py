# -*- coding: utf-8 -*-
from flask import Blueprint, g, render_template, request
from datausa.consts import DICTIONARY

mod = Blueprint("map", __name__, url_prefix="/map")

mapdata = {

    "wages": [
        "pums.avg_wage,avg_wage_moe",
        "pums.avg_wage_ft,avg_wage_ft_moe",
        "pums.avg_wage_pt,avg_wage_pt_moe",
        "pums.num_ppl,num_ppl_moe",
        "pums.num_ppl_ft,num_ppl_ft_moe",
        "pums.num_ppl_pt,num_ppl_pt_moe",
        "pums.avg_hrs,avg_hrs_moe",
        "pums.avg_hrs_ft,avg_hrs_ft_moe",
        "pums.avg_hrs_pt,avg_hrs_pt_moe",
        "pums.gini",
        "acs.income_inequality",
        "chr.unemployment",
        "acs.income,income_moe,income_rank",
        "acs.income_below_poverty:pop_poverty_status,income_below_poverty,income_below_poverty_moe,pop_poverty_status,pop_poverty_status_moe",
        "chr.children_in_poverty"
    ],

    "coverage": [
        "chr.uninsured",
        "chr.uninsured_adults",
        "chr.uninsured_children",

        "chr.total_medicare_enrollees",
        "chr.total_reimbursements_b",
        "chr.hospital_reimbursements_b",
        "chr.physician_reimbursements_b",
        "chr.outpatient_reimbursements_b",
        "chr.home_health_reimbursements_b",
        "chr.hospice_reimbursements_b",
        "chr.medical_equip_reimbursements_b",
        "chr.medicare_beneficiaries_total",
        "chr.medicare_beneficiaries_black",
        "chr.medicare_beneficiaries_white",

        "chr.diabetic_medicare_enrollees_65_75_total",
        "chr.diabetic_medicare_enrollees_65_75_black",
        "chr.diabetic_medicare_enrollees_65_75_white",
        "chr.number_of_females_enrolled_67_69_total",
        "chr.number_of_females_enrolled_67_69_black",
        "chr.number_of_females_enrolled_67_69_white",
        "chr.beneficiaries_part_a_eligible_total",
        "chr.beneficiaries_part_a_eligible_black",
        "chr.beneficiaries_part_a_eligible_white"
    ],

    "care": [
        "chr.preventable_hospital_stays",
        "chr.diabetic_screening",
        "chr.mammography_screening",

        "chr.patients_with_one_ambulatory_visit_to_pc_total",
        "chr.patients_with_one_ambulatory_visit_to_pc_black",
        "chr.patients_with_one_ambulatory_visit_to_pc_white",
        "chr.patients_females_67_69_having_mammogram_total",
        "chr.patients_females_67_69_having_mammogram_black",
        "chr.patients_females_67_69_having_mammogram_white",
        "chr.patients_diabetic_medicare_enrollees_65_75_hemoglobin_total",
        "chr.patients_diabetic_medicare_enrollees_65_75_hemoglobin_black",
        "chr.patients_diabetic_medicare_enrollees_65_75_hemoglobin_white",
        "chr.patients_diabetic_medicare_enrollees_65_75_eye_exam_total",
        "chr.patients_diabetic_medicare_enrollees_65_75_eye_exam_black",
        "chr.patients_diabetic_medicare_enrollees_65_75_eye_exam_white",
        "chr.patients_diabetic_medicare_enrollees_65_75_lipid_test_total",
        "chr.patients_diabetic_medicare_enrollees_65_75_lipid_test_black",
        "chr.patients_diabetic_medicare_enrollees_65_75_lipid_test_white",
        "chr.leg_amputations_per_1000_enrollees_total",
        "chr.leg_amputations_per_1000_enrollees_black",
        "chr.leg_amputations_per_1000_enrollees_white",
        "chr.discharges_for_ambulatory_conditions_per_1000_total",
        "chr.discharges_for_ambulatory_conditions_per_1000_black",
        "chr.discharges_for_ambulatory_conditions_per_1000_white"
    ],

    "risks": [
        "chr.adult_obesity",
        "chr.diabetes",
        "chr.sexually_transmitted_infections",
        "chr.hiv_prevalence_rate",
        "chr.alcoholimpaired_driving_deaths",
        "chr.excessive_drinking",
        "chr.adult_smoking",
        "chr.homicide_rate",
        "chr.violent_crime",
        "chr.motor_vehicle_crash_deaths",

        "chr.premature_death",
        "chr.poor_or_fair_health",
        "chr.poor_physical_health_days",
        "chr.poor_mental_health_days",
        "chr.low_birthweight",
        "chr.food_environment_index",
        "chr.physical_inactivity",
        "chr.access_to_exercise_opportunities",
        "chr.teen_births",
        "chr.social_associations",
        "chr.injury_deaths",
        "chr.polution_ppm",
        "chr.premature_ageadjusted_mortality",
        "chr.infant_mortality",
        "chr.child_mortality",
        "chr.food_insecurity",
        "chr.limited_access_to_healthy_foods",
        "chr.drug_overdose_deaths",
        "chr.children_eligible_for_free_lunch",

        "opioids.opioid_overdose_deathrate_ageadjusted",
        "opioids.drug_overdose_ageadjusted",
        "opioids.non_medical_use_of_pain_relievers"
    ],

    "demographics": [
        "acs.pop,pop_moe,pop_rank",
        "acs.age,age_moe,age_rank",
        "acs.non_eng_speakers_pct",
        "acs.us_citizens",
        "pums.avg_age,avg_age_moe",
        "pums.avg_age_ft,avg_age_ft_moe",
        "pums.avg_age_pt,avg_age_pt_moe",
        "chr.population_that_is_not_proficient_in_english",
        "chr.population_living_in_a_rural_area"
    ],

    "education": [
        "ipeds.grads_total",
        "ipeds.grads_total_growth",
        "chr.high_school_graduation",
        "chr.some_college",
        "defaults.default_rate,num_borrowers,num_defaults"
    ],

    "housing": [
        "chr.driving_alone_to_work",
        "acs.long_commute__driving_alone",
        "acs.median_property_value,median_property_value_moe",
        "acs.owner_occupied_housing_units",
        "acs.mean_commute_minutes",
        "chr.children_in_singleparent_households",
        "chr.severe_housing_problems"
    ]

}

@mod.route("/")
def map():
    g.page_type = "map"

    datalevels = {
        "acs": ["state", "county", "msa", "puma"],
        "chr": ["state", "county"],
        "ipeds": ["state", "county", "msa", "puma"],
        "pums": ["state", "puma"],
        "opioids": ["state"],
        "defaults": ["state", "county", "msa"],
    }

    defaultKey = request.args.get("key", "uninsured")
    defaultLevel = request.args.get("level", "county")

    sections = ["wages", "coverage", "care", "risks", "demographics", "education", "housing"]
    sumlevels = ["state", "county", "msa", "puma"]
    keys = []
    formattedData = {}
    for section in mapdata:
        if section in sections:
            keyDepths = {}
            for k in mapdata[section]:
                [dataset, key] = k.split(".")
                keys.append(key)
                if key == defaultKey:
                    defaultSection = section
                keyDepths[key] = datalevels[dataset]
            formattedData[section] = keyDepths
    keys = sorted(keys, key=lambda x: DICTIONARY[x.split(",")[0]])
    defaultKey = defaultKey.split(",")[0]
    title = "{} by {}".format(DICTIONARY[defaultKey.split(":")[0]], DICTIONARY[defaultLevel])

    return render_template("map/index.html", title=title, mapdata=formattedData, datasets=sections, keys=keys, sumlevels=sumlevels,
                                             defaultKey=defaultKey, defaultLevel=defaultLevel, defaultDataset=defaultSection)
