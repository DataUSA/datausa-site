SUMLEVELS = {
    "geo": {
        "010": {
            "sumlevel": "nation",
            "label": "nation",
            "children": "040"
        },
        "040": {
            "sumlevel": "state",
            "label": "state",
            "children": "050",
            "desc": "Includes all 50 US states as well as Washington D.C. and Puerto Rico.",
            "link": "/about/glossary/#state",
        },
        "050": {
            "sumlevel": "county",
            "label": "county",
            "children": "140",
            "desc": "Most or all county subdivisions are legal entities, known to the Census Bureau as minor civil divisions.",
            "link": "/about/glossary/#county",
        },
        "310": {
            "sumlevel": "msa",
            "label": "metropolitan statistical area",
            "shortlabel": "metro area",
            "children": "050",
            "desc": "A Metropolitan Statistical Area is an official designation of one or more counties around a core urban area which is the primary focus of economic activity for those counties.",
            "link": "/about/glossary/#msa",
        },
        "160": {
            "sumlevel": "place",
            "label": "census place",
            "shortlabel": "place",
            "children": "140",
            "desc": "The United States Census Bureau defines a place as a concentration of population which has a name, is locally recognized, and is not part of any other place.",
            "link": "/about/glossary/#place",
        },
        "860": {
            "sumlevel": "zip",
            "label": "zip code",
        },
        "795": {
            "sumlevel": "puma",
            "label": "public use microdata area",
            "shortlabel": "PUMA",
            "desc": "Public Use Microdata Areas are geographic units containing at least 100,000 people used by the US Census for providing statistical and demographic information.",
            "link": "/about/glossary/#puma",
        },
        "140": {
            "sumlevel": "tract",
            "label": "census tract",
            "shortlabel": "tract",
            "desc": "Census tracts are small, relatively permanent statistical subdivisions of a county or equivalent entity that are updated by local participants prior to each decennial census.",
            "link": "/about/glossary/#tract"
        }
    },
    "cip": {
        "2": {
            "label": "2 Digit Course",
            "shortlabel": "2_digit_course"
        },
        "4": {
            "label": "4 Digit Course",
            "shortlabel": "4_digit_course"
        },
        "6": {
            "label": "6 Digit Course",
            "shortlabel": "6_digit_course"
        }
    },
    "soc": {
        "0": {
            "label": "Major Occupation Group",
            "shortlabel": "major_group"
        },
        "1": {
            "label": "Minor Occupation Group",
            "shortlabel": "minor_group"
        },
        "2": {
            "label": "Broad Occupation",
            "shortlabel": "broad_occupation"
        },
        "3": {
            "label": "Detailed Occupation",
            "shortlabel": "detailed_occupation"
        }
    },
    "naics": {
        "0": {
            "label": "Industry Sector",
            "shortlabel": "sector"
        },
        "1": {
            "label": "Industry Sub-Sector",
            "shortlabel": "sub_sector"
        },
        "2": {
            "label": "Industry Group",
            "shortlabel": "group"
        }
    }
}

TEXTCOMPARATORS = {
    "age": ("older than", "younger than", "approximately the same age as"),
    "age2": ("getting older", "getting younger", "staying the same age"),
    "fastslow": ("faster than", "slower than", "approximately the same as"),
    "growth": ("growing", "declining", "maintaining"),
    "growth2": ("growth", "decline", "change"),
    "grew": ("grew to", "declined to", "stayed at"),
    "grew2": ("grew", "declined", "stayed"),
    "highlow": ("higher than", "lower than", "approximately the same as"),
    "highlowsame": ("a higher", "a lower", "the same"),
    "increase": ("increase", "decrease", "change"),
    "increased": ("increased", "decreased", "changed"),
    "larger": ("larger", "smaller", "larger"),
    "longshort": ("longer", "shorter", "approximately equal"),
    "moreless": ("more than", "less than", "approximately the same as"),
    "moreless2": ("more", "less", "approximately the same"),
    "mostleast": ("most", "least", "same"),
    "towards": ("towards", "away from", "equally towards")
}

DICTIONARY = {

    "income_range": "Income Range",
    "income_range_name": "Income Range",
    "pct_with_grant_aid": "Percent of Undergraduates Receiving Grant Aid",
    "pct_fed_loads": "Percent of Undergraduate Federal Loans",
    "avg_gos_award": "Average Financial Aid",
    "avg_netprice_fedaid": "Average Net Price",
    "avg_netprice_gos_aid": "Average Net Price",

    "yield_total": "Enrollment Yield",
    "yield_men": "Male Enrollment Yield",
    "yield_women": "Female Enrollment Yield",

    "applicants_total": "Applicants",
    "applicants_men": "Male Applicants",
    "applicants_women": "Female Applicants",

    "admissions_total": "Admissions",
    "admissions_men": "Male Admissions",
    "admissions_women": "Female Admissions",

    "sat_score": "Average Score",
    "cr": "Critical Reading",
    "25": "25th Percentile",
    "75": "75th Percentile",

    "oos_tuit": "Out-of-State Tuition",
    "state_tuit": "In-State Tuition",
    "tuition_cost": "Tuition Cost",

    "oos_f": "Out-of-State Fees",
    "state_f": "In-State Fees",
    "fee_cost": "Student Fees",

    "grad_rate": "Graduation Rate",
    "num_finishers": "Number of Students",
    "num_enrolled": "Enrolled Students",
    "enrollment_status": "Enrollment Status",
    "ipeds_race": "Race",

    "retention_rate_ft": "Full-Time Retention Rate",
    "retention_rate_pt": "Part-Time Retention Rate",

    "endowment_value_fiscal_year_end": "Endowment",
    "endowment_quintile": "Quintile",
    "endowment_quintile_value": "Endowment",

    "investment_income": "Investment Income",

    "federal_grants_and_contracts": "Federal Grants & Contracts",
    "state_grants_and_contracts": "State Grants & Contracts",
    "local_grants_and_contracts": "Local Grants & Contracts",
    "grants_and_contracts": "Grants & Contracts",

    "benefits_expense": "Benefits Expenditure",
    "dep_expense": "Departmental Expenditure",
    "interest_expense": "Interest Expenditure",
    "ops_expense": "Operations Expenditure",
    "other_expense": "Other Expenditure",
    "salaries_expense": "Salary Expenditure",
    "benefits": "Benefits Expenditure",
    "dep": "Departmental Expenditure",
    "interest": "Interest Expenditure",
    "ops": "Operations Expenditure",
    "other": "Other Expenditure",
    "salaries": "Salary Expenditure",
    "expense_value": "Expenditure",

    "outlays_instructional_staff": "Staff Salaries",
    "num_instructional_staff": "Number of Employees",
    "total_salaries": "Total Salaries",

    "num_instructional_staff": "Number of Employees",
    "num_noninstructional_staff": "Number of Employees",
    "academic_rank_name": "Academic Rank",

    "economy": "Economy",
    "wages": "Income & Employment",

    "health": "Health & Safety",
    "coverage": "Health Care Costs & Coverage",
    "care": "Hospital Care",
    "risks": "Health Risks",

    "demographics": "Demographics",
    "education": "Education",
    "housing": "Housing & Living",

    "acs": "American Community Survey",
    "chr": "County Health Records",
    "ipeds": "IPEDS",
    "pums": "ACS PUMS",

    "msa": "MSA",
    "puma": "PUMA",
    "state": "State",
    "county": "County",

    "gini": "GINI",

    "geo": "Location",
    "cip": "College Degree",
    "naics": "Industry",
    "soc": "Occupation",
    "acs_ind": "ACS Industry",
    "acs_occ": "ACS Occupation",
    "commodity_iocode": "Commodity",
    "industry_iocode": "Industry",

    "nativity_us": "Native Born",
    "nativity_foreign": "Foreign Born",
    "us": "Native Born",
    "foreign": "Foreign Born",

    "age": "Age",
    "avg_wage": "Average Salary",
    "avg_wage_ft": "Average Salary (Full-Time Employees)",
    "avg_wage_pt": "Average Salary (Part-Time Employees)",
    "avg_age": "Average Age",
    "avg_age_ft": "Average Age (Full-Time Employees)",
    "avg_age_pt": "Average Age (Part-Time Employees)",
    "avg_hrs": "Average Work Hours",
    "avg_hrs_ft": "Average Work Hours (Full-Time Employees)",
    "avg_hrs_pt": "Average Work Hours (Part-Time Employees)",
    "district_tuition": "District Tuition",
    "emp_thousands": "Total Employees",

    "grads_asian": "Asian",
    "grads_asian_men": "Men (Asian)",
    "grads_asian_women": "Women (Asian)",
    "grads_black": "Black",
    "grads_black_men": "Men (Black)",
    "grads_black_women": "Women (Black)",
    "grads_hispanic": "Hispanic",
    "grads_hispanic_men": "Men (Hispanic)",
    "grads_hispanic_women": "Women (Hispanic)",
    "grads_hawaiian": "Islander",
    "grads_hawaiian_men": "Men (Islander)",
    "grads_hawaiian_women": "Women (Islander)",
    "grads_men": "Men",
    "grads_multi": "Multiracial",
    "grads_multi_men": "Men (Multiracial)",
    "grads_multi_women": "Women (Multiracial)",
    "grads_native": "Native",
    "grads_native_men": "Men (Native)",
    "grads_native_women": "Women (Native)",
    "grads_total": "Degrees Awarded",
    "grads_total_growth": "Graduate Growth",
    "grads_white": "White",
    "grads_white_men": "Men (White)",
    "grads_white_women": "Women (White)",
    "grads_women": "Women",
    "grads_unknown": "Unknown",
    "grads_unknown_men": "Men (Unknown)",
    "grads_unknown_women": "Women (Unknown)",
    "asian": "Asian",
    "asian_men": "Men (Asian)",
    "asian_women": "Women (Asian)",
    "black": "Black",
    "black_men": "Men (Black)",
    "black_women": "Women (Black)",
    "hispanic": "Hispanic",
    "hispanic_men": "Men (Hispanic)",
    "hispanic_women": "Women (Hispanic)",
    "hawaiian": "Islander",
    "hawaiian_men": "Men (Islander)",
    "hawaiian_women": "Women (Islander)",
    "multi": "Multiracial",
    "multi_men": "Men (Multiracial)",
    "multi_women": "Women (Multiracial)",
    "native": "Native",
    "native_men": "Men (Native)",
    "native_women": "Women (Native)",
    "total": "Degrees Awarded",
    "total_growth": "Graduate Growth",
    "white": "White",
    "white_men": "Men (White)",
    "white_women": "Women (White)",
    "unknown": "Unknown",
    "unknown_men": "Men (Unknown)",
    "unknown_women": "Women (Unknown)",

    "income": "Median Household Income",
    "income_white": "Median Household Income (White)",
    "income_black": "Median Household Income (Black)",
    "income_asian": "Median Household Income (Asian)",
    "income_hispanic": "Median Household Income (Hispanic)",
    "income_native": "Median Household Income (Native)",
    "income_hawaiian": "Median Household Income (Islander)",
    "income_2ormore": "Median Household Income (Multiracial)",
    "income_whitenonhispanic": "Median Household Income (White Non-Hispanic)",
    "income_other": "Median Household Income (Other)",
    "mean_commute_minutes": "Average Travel Time",
    "median_property_value": "Median Property Value",
    "med_earnings": "Median Yearly Earnings",
    "men": "Men",

    "sexually_transmitted_infections": "Chlamydia Diagnoses",
    "violent_crime": "Violent Crimes",
    "adult_obesity": "Obesity Prevalence",
    "adult_smoking": "Adult Smoking Prevalence",
    "alcoholimpaired_driving_deaths": "Driving Deaths Involving Alcohol",
    "diabetes": "Diabetes Prevalence",
    "health_care_costs": "Reimbursements per Medicare Enrollee",
    "hiv_prevalence_rate": "HIV Diagnoses",
    "homicide_rate": "Homicide Deaths",
    "motor_vehicle_crash_deaths": "Motor Vehicle Crash Deaths",
    "excessive_drinking": "Excessive Drinking Prevalence",

    "primary_care_physicians": "Primary Care Physicians",
    "dentists": "Dentists",
    "mental_health_providers": "Mental Health Providers",
    "other_primary_care_providers": "Other PCPs",

    "premature_death": "Years of Potential Life Lost",
    "poor_or_fair_health": "Poor to Fair Health",
    "poor_physical_health_days": "Physically Unhealthy Days per Month",
    "poor_mental_health_days": "Mentally Unhealthy Days per Month",
    "low_birthweight": "Low Birthweight",
    "food_environment_index": "Food Environment Index",
    "physical_inactivity": "Physical Inactivity",
    "access_to_exercise_opportunities": "Access to Exercise Opportunities",
    "teen_births": "Teen Births (Age 15-19)",
    "uninsured": "Percent Uninsured",
    "preventable_hospital_stays": "Preventable Hospital Stays",
    "diabetic_screening": "Diabetic Screening Rate",
    "mammography_screening": "Mammography Screening Rate",
    "high_school_graduation": "High School Graduation",
    "some_college": "Some College",
    "children_in_poverty": "Children in Poverty",
    "children_in_singleparent_households": "Children in Single-Parent Households",
    "social_associations": "Social Associations",
    "injury_deaths": "Injury Deaths",
    "polution_ppm": "Air Pollution",
    "drinking_water_violations": "Drinking Water Violations",
    "severe_housing_problems": "Severe Housing Problems",
    "population_living_in_a_rural_area": "Rural Population",
    "premature_ageadjusted_mortality": "Premature Age-Adjusted Mortality",
    "infant_mortality": "Infant Mortality Rate",
    "child_mortality": "Child Mortality",
    "food_insecurity": "Food Insecurity",
    "limited_access_to_healthy_foods": "Limited Access to Healthy Foods",
    "drug_overdose_deaths": "Drug Overdose Deaths",
    "uninsured_adults": "Percent Uninsured (Adults)",
    "uninsured_children": "Percent Uninsured (Children)",
    "could_not_see_doctor_due_to_cost": "Could Not See Doctor Due to Cost",
    "children_eligible_for_free_lunch": "Children Eligible for Free Lunch",

    "unemployment": "Unemployment",
    "income_inequality": "Income Inequality",
    "driving_alone_to_work": "Commuting Alone",
    "long_commute__driving_alone": "Commuting Alone over 30 Minutes",
    "population_that_is_not_proficient_in_english": "Population not Proficient in English",
    "population_estimate": "Resident Population",
    "median_household_income": "Median Household Income",

    "non_eng_speakers_pct": "Non English Speakers",
    "non_us_citizens": "Non US Citizens",
    "num_emp": "Total Employees",
    "num_emp_rca": "Total Employees (RCA)",
    "num_households": "Households",
    "num_over5": "Population 5 Years and Older",
    "num_over5_rca": "Population 5 Years and Older (RCA)",
    "num_ppl": "People in Workforce",
    "num_ppl_ft": "Full-Time People in Workforce",
    "num_ppl_pt": "Part-Time People in Workforce",
    "num_ppl_rca": "People in Workforce (RCA)",
    "num_speakers": "Speakers",
    "num_speakers_rca": "Speakers (RCA)",
    "oos_tuition": "Out of State Tuition",
    "owner_occupied_housing_units": "Homeowners",
    "pct_total": "Percentage of Degrees Awarded",
    "people": "People",

    "pop": "Population",
    "pop_2ormore": "Multiracial",
    "pop_asian": "Asian",
    "pop_black": "Black",
    "pop_hawaiian": "Islander",
    "pop_latino": "Hispanic",
    "pop_native": "Native",
    "pop_other": "Other",
    "pop_white": "White",
    "2ormore": "Multiracial",
    "asian": "Asian",
    "black": "Black",
    "hawaiian": "Islander",
    "latino": "Hispanic",
    "native": "Native",
    "other": "Other",
    "white": "White",

    "population_estimate": "Population Estimate",

    "income_below_poverty": "Population in Poverty",
    "pop_poverty_status": "Overall Population",
    "income_below_poverty:pop_poverty_status": "Poverty Rate",
    "poverty_male": "Male Population in Poverty",
    "poverty_female": "Female Population in Poverty",
    "poverty_2ormore": "Multiracial",
    "poverty_asian": "Asian",
    "poverty_black": "Black",
    "poverty_hawaiian": "Islander",
    "poverty_hispanic": "Hispanic",
    "poverty_native": "Native",
    "poverty_other": "Other",
    "poverty_white": "White",
    "2ormore": "Multiracial",
    "asian": "Asian",
    "black": "Black",
    "hawaiian": "Islander",
    "hispanic": "Hispanic",
    "native": "Native",
    "other": "Other",
    "white": "White",

    "property_tax": "Property Taxes",
    "propertytax": "Property Taxes",
    "property_val": "Property Value",
    "propertyval": "Property Value",
    "race": "Race or Ethnicity",
    "sex": "Gender",
    "state_tuition": "In State Tuition",

    "total_owner_occupied_housing_units": "Total Households",

    "transport": "Method of Travel",
    "transport_drove": "Drove Alone",
    "transport_carpooled": "Carpooled",
    "transport_publictrans": "Public Transit",
    "transport_bicycle": "Bicycle",
    "transport_walked": "Walked",
    "transport_other": "Other",
    "transport_home": "Work at Home",
    "transport_motorcycle": "Motorcycle",
    "transport_taxi": "Taxi",
    "drove": "Drove Alone",
    "carpooled": "Carpooled",
    "publictrans": "Public Transit",
    "bicycle": "Bicycle",
    "walked": "Walked",
    "other": "Other",
    "home": "Work at Home",
    "motorcycle": "Motorcycle",
    "taxi": "Taxi",

    "travel": "Travel Time",
    "us_citizens": "Citizenship",
    "value_millions": "Value",
    "vehicles": "Vehicles",
    "wage_bin": "Wage Bin",
    "women": "Women",

    "insurance": "Insurance",
    "total_medicare_enrollees": "Medicare Enrollees",
    "total_reimbursements_b": "Reimbursements per Medicare Enrollee",
    "hospital_reimbursements_b": "Hospital Reimbursements per Medicare Enrollee",
    "physician_reimbursements_b": "Physician Reimbursements per Medicare Enrollee",
    "outpatient_reimbursements_b": "Outpatient Reimbursements per Medicare Enrollee",
    "home_health_reimbursements_b": "Home Health Reimbursements per Medicare Enrollee",
    "hospice_reimbursements_b": "Hospice Reimbursements per Medicare Enrollee",
    "medical_equip_reimbursements_b": "Medical Equipment Reimbursements per Medicare Enrollee",
    "average_annual_contact_days": "Average Annual Contact Days",

    "medicare_beneficiaries_total": "Medicare Beneficiaries",
    "medicare_beneficiaries_white": "Medicare Beneficiaries (Non-Black)",
    "medicare_beneficiaries_black": "Medicare Beneficiaries (Black)",
    "patients_with_one_ambulatory_visit_to_pc_total": "Patients w/ Ambulatory Visits",
    "patients_with_one_ambulatory_visit_to_pc_black": "Patients w/ Ambulatory Visits (Black)",
    "patients_with_one_ambulatory_visit_to_pc_white": "Patients w/ Ambulatory Visits (Non-Black)",
    "diabetic_medicare_enrollees_65_75_total": "Diabetic Medicare Enrollees Age 65-75",
    "diabetic_medicare_enrollees_65_75_black": "Diabetic Medicare Enrollees Age 65-75 (Black)",
    "diabetic_medicare_enrollees_65_75_white": "Diabetic Medicare Enrollees Age 65-75 (Non-Black)",
    "patients_diabetic_medicare_enrollees_65_75_hemoglobin_total": "Diabetic Hemoglobin Tests Age 65-75",
    "patients_diabetic_medicare_enrollees_65_75_hemoglobin_black": "Diabetic Hemoglobin Tests Age 65-75 (Black)",
    "patients_diabetic_medicare_enrollees_65_75_hemoglobin_white": "Diabetic Hemoglobin Tests Age 65-75 (Non-Black)",
    "patients_diabetic_medicare_enrollees_65_75_eye_exam_total": "Diabetic Eye Tests Age 65-75",
    "patients_diabetic_medicare_enrollees_65_75_eye_exam_black": "Diabetic Eye Tests Age 65-75 (Black)",
    "patients_diabetic_medicare_enrollees_65_75_eye_exam_white": "Diabetic Eye Tests Age 65-75 (Non-Black)",
    "patients_diabetic_medicare_enrollees_65_75_lipid_test_total": "Diabetic Lipid Tests Age 65-75",
    "patients_diabetic_medicare_enrollees_65_75_lipid_test_black": "Diabetic Lipid Tests Age 65-75 (Black)",
    "patients_diabetic_medicare_enrollees_65_75_lipid_test_white": "Diabetic Lipid Tests Age 65-75 (Non-Black)",
    "number_of_females_enrolled_67_69_total": "Female Medicare Enrolles Age 65-75",
    "number_of_females_enrolled_67_69_black": "Female Medicare Enrolles Age 65-75 (Black)",
    "number_of_females_enrolled_67_69_white": "Female Medicare Enrolles Age 65-75 (Non-Black)",
    "patients_females_67_69_having_mammogram_total": "Mammograms Age 65-75",
    "patients_females_67_69_having_mammogram_black": "Mammograms Age 65-75 (Black)",
    "patients_females_67_69_having_mammogram_white": "Mammograms Age 65-75 (Non-Black)",
    "beneficiaries_part_a_eligible_total": "Medicare Part A Elibigle Beneficiaries",
    "beneficiaries_part_a_eligible_black": "Medicare Part A Elibigle Beneficiaries (Black)",
    "beneficiaries_part_a_eligible_white": "Medicare Part A Elibigle Beneficiaries (Non-Black)",
    "discharges_for_ambulatory_conditions_per_1000_total": "Ambulatory Discharges",
    "discharges_for_ambulatory_conditions_per_1000_black": "Ambulatory Discharges (Black)",
    "discharges_for_ambulatory_conditions_per_1000_white": "Ambulatory Discharges (Non-Black)",
    "leg_amputations_per_1000_enrollees_total": "Leg Amputations",
    "leg_amputations_per_1000_enrollees_white": "Leg Amputations (Non-Black)",
    "leg_amputations_per_1000_enrollees_black": "Leg Amputations (Black)",

    "patients_in_cohort": "Total Patients",
    "patients_readmitted_within_30_days_of_discharge": "Readmittance within 30 Days",
    "patients_seeing_a_primary_care_physician_within_14_days": "PCP Visits within 14 Days",
    "patients_having_an_ambulatory_visit_within_14_days": "Ambulatory Visits within 14 Days",
    "patients_having_an_emergency_room_visit_within_30_days": "ER Visits within 30 Days",

    "eye_exam": "Eye Exams",
    "hemoglobin": "Hemoglobin Tests",
    "lipid_test": "Lipid Tests",
    "mammogram_tests": "Mammograms",

    "hc_pop": "Population",
    "hc_pop_rca": "Population (RCA)",

    "wwii": "WWII",
    "korea": "Korea",
    "vietnam": "Vietnam",
    "gulf90s": "Gulf (1990s)",
    "gulf01": "Gulf (2001-)",
    "conflict_wwii": "WWII",
    "conflict_korea": "Korea",
    "conflict_vietnam": "Vietnam",
    "conflict_gulf90s": "Gulf (1990s)",
    "conflict_gulf01": "Gulf (2001-)",
    "conflict_total": "Total Veterans"

}

AFFIXES = {
    "state_tuition": ["$", ""],
    "oos_tuition": ["$", ""],
    "district_tuition": ["$", ""],
    "tuition_cost": ["$", ""],
    "state_fee": ["$", ""],
    "oos_fee": ["$", ""],
    "district_fee": ["$", ""],
    "fee_cost": ["$", ""],
    "avg_wage": ["$", ""],
    "avg_wage_ft": ["$", ""],
    "avg_wage_pt": ["$", ""],
    "income": ["$", ""],
    "income_white": ["$", ""],
    "income_black": ["$", ""],
    "income_asian": ["$", ""],
    "income_hispanic": ["$", ""],
    "income_native": ["$", ""],
    "income_hawaiian": ["$", ""],
    "income_2ormore": ["$", ""],
    "income_whitenonhispanic": ["$", ""],
    "income_other": ["$", ""],
    "med_earnings": ["$", ""],
    "median_property_value": ["$", ""],
    "median_household_income": ["$", ""],
    "output": ["$", ""],
    "y2_output": ["$", ""],
    "polution_ppm": ["", u"\u00B5g/m\u00B3"],
    "property_tax": ["$", ""],
    "property_val": ["$", ""],
    "health_care_costs": ["$", ""],
    "total_reimbursements_b": ["$", ""],
    "hospital_reimbursements_b": ["$", ""],
    "physician_reimbursements_b": ["$", ""],
    "outpatient_reimbursements_b": ["$", ""],
    "home_health_reimbursements_b": ["$", ""],
    "hospice_reimbursements_b": ["$", ""],
    "medical_equip_reimbursements_b": ["$", ""],
    "value_millions": ["$", ""],
    "avg_netprice_gos_aid": ["$", ""],
    "avg_gos_award": ["$", ""],
    "avg_netprice_fedaid": ["$", ""],
    "endowment_value_fiscal_year_end": ["$", ""],
    "endowment_quintile_value": ["$", ""],
    "investment_income": ["$", ""],
    "federal_grants_and_contracts": ["$", ""],
    "state_grants_and_contracts": ["$", ""],
    "local_grants_and_contracts": ["$", ""],
    "grants_and_contracts": ["$", ""],
    "benefits_expense": ["$", ""],
    "dep_expense": ["$", ""],
    "interest_expense": ["$", ""],
    "ops_expense": ["$", ""],
    "other_expense": ["$", ""],
    "salaries_expense": ["$", ""],
    "expense_value": ["$", ""],
    "outlays_instructional_staff": ["$", ""],
    "total_salaries": ["$", ""]
}

PROPORTIONS = [
    "non_eng_speakers_pct",
    "owner_occupied_housing_units",
    "pct_total",
    "us_citizens",
    "grads_total_growth",
    "diabetes",
    "adult_obesity",
    "adult_smoking",
    "excessive_drinking",
    "alcoholimpaired_driving_deaths",
    "physical_inactivity",
    "access_to_exercise_opportunities",
    "food_insecurity",
    "limited_access_to_healthy_foods",
    "uninsured",
    "uninsured_children",
    "diabetic_screening",
    "uninsured_adults",
    "mammography_screening",
    "high_school_graduation",
    "some_college",
    "unemployment",
    "children_in_singleparent_households",
    "children_in_poverty",
    "children_eligible_for_free_lunch",
    "drinking_water_violations",
    "severe_housing_problems",
    "driving_alone_to_work",
    "long_commute__driving_alone",
    "population_that_is_not_proficient_in_english",
    "population_living_in_a_rural_area",
    "poor_or_fair_health",
    "low_birthweight",
    "could_not_see_doctor_due_to_cost",
    "income_below_poverty:pop_poverty_status",
    "growth",
    "yield_total",
    "yield_men",
    "yield_women",
    "grad_rate",
    "endowment_quintile"
]

PERCENTAGES = [
    "emp_carc_2014_2024",
    "output_carc_2014_2024",
    "pct_change",
    "share",
    "pct_fed_loans",
    "pct_with_grant_aid",
    "sub_sat_scores_pct",
    "retention_rate_ft",
    "retention_rate_pt"
]

PER1000 = [
    "infant_mortality",
    "teen_births",
    "preventable_hospital_stays",
    "leg_amputations_per_1000_enrollees_total",
    "leg_amputations_per_1000_enrollees_white",
    "leg_amputations_per_1000_enrollees_black",
    "discharges_for_ambulatory_conditions_per_1000_total",
    "discharges_for_ambulatory_conditions_per_1000_white",
    "discharges_for_ambulatory_conditions_per_1000_black"
]

PER10000 = [
    "social_associations"
]

PER100000 = [
    "hiv_prevalence_rate",
    "homicide_rate",
    "motor_vehicle_crash_deaths",
    "sexually_transmitted_infections",
    "violent_crime",
    "premature_death",
    "premature_ageadjusted_mortality",
    "child_mortality",
    "drug_overdose_deaths",
    "injury_deaths"
]

NEVERCONDENSE = [
    "avg_wage",
    "avg_wage_ft",
    "avg_wage_pt",
    "income",
    "income_white",
    "income_black",
    "income_asian",
    "income_hispanic",
    "income_native",
    "income_hawaiian",
    "income_2ormore",
    "income_whitenonhispanic",
    "income_other",
    "med_earnings"
]

COLMAP = {
    "sex": {
        "men": "1",
        "women": "2",
        "male": "1",
        "female": "2"
    },
    "race": {
        "white": "1",
        "black": "2",
        "native": "3",
        "asian": "6",
        "hispanic": "11",
        "latino": "11",
        "hawaiian": "7",
        "multi": "9",
        "2ormore": "9",
        "unknown": "8",
        "other": "8"
    },
    "age_bucket": {
        "under_6": "&lt; 6",
        "6to17": "6-17",
        "18to24": "18-24",
        "25to34": "25-34",
        "35to44": "35-44",
        "45to54": "45-54",
        "55to64": "55-64",
        "65to74": "65-74",
        "75plus": "75+"
    },
    "ageBucket": {
        "under5": "&lt; 5",
        "5": "5",
        "6to11": "6-11",
        "12to14": "12-14",
        "15": "15",
        "16to17": "16-17",
        "18to24": "18-24",
        "25to34": "25-34",
        "35to44": "35-44",
        "45to54": "45-54",
        "55to64": "55-64",
        "65to74": "65-74",
        "75over": "75+"
    },
    "incomeBucket": {
        "under10": "&lt; $10k",
        "10to15": "$10-$15k",
        "15to20": "$15-$20k",
        "20to25": "$20-$25k",
        "25to30": "$25-$30k",
        "30to35": "$30-$35k",
        "35to40": "$35-$40k",
        "40to45": "$40-$45k",
        "45to50": "$45-$50k",
        "50to60": "$50-$60k",
        "60to75": "$60-$75k",
        "75to100": "$75-$100k",
        "100to125": "$100-$125k",
        "125to150": "$125-$150k",
        "150to200": "$150-$200k",
        "200over": "$200k+"
    },
    "income_range": {
        "1": "$0 - $30,000",
        "2": "$30,001 - $48,000",
        "3": "$48,001 - $75,000",
        "4": "$75,001 - $110,000",
        "5": "$110,000+"
    },
    "propertyvalBucket": {
        "less10k": "&lt; $10k",
        "10kto15k": "$10k-$15k",
        "15kto20k": "$15k-$20k",
        "20kto25k": "$20k-$25k",
        "25kto30k": "$25k-$30k",
        "30kto35k": "$30k-$35k",
        "35kto40k": "$35k-$40k",
        "40kto50k": "$40k-$50k",
        "50kto60k": "$50k-$60k",
        "60kto70k": "$60k-$70k",
        "80kto90k": "$80k-$90k",
        "90kto100k": "$90k-$100k",
        "100kto125k": "$100k-$125k",
        "150kto175k": "$150k-$175k",
        "175kto200k": "$175k-$200k",
        "200kto250k": "$200k-$250k",
        "250kto300k": "$250k-$300k",
        "300kto400k": "$300k-$400k",
        "400kto500k": "$400k-$500k",
        "500kto750k": "$500k-$750k",
        "750kto1M": "$750k-$1M",
        "1Mover": "$1M+"
    },
    "propertytaxBucket": {
        "none": "$0",
        "less800": "&lt; $800",
        "800to1500": "$800-$1.5k",
        "1500to2000": "$1.5k-$2k",
        "2000to3000": "$2k-$3k",
        "3000over": "$3k+"
    },
    "conflict": {
        "wwii": "1",
        "korea": "2",
        "vietnam": "3",
        "gulf90s": "4",
        "gulf01": "5"
    },
    "vehicles": {
        "none": "0",
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5over": "5+"
    },
    "transport": {
        "drove": "Drove Alone",
        "carpooled": "Carpooled",
        "cartruckorvan": "Truck or Van",
        "publictrans": "Public Transit",
        "bicycle": "Bicycle",
        "walked": "Walked",
        "other": "Other",
        "home": "Work at Home",
        "motorcycle": "Motorcycle",
        "taxi": "Taxi"
    },
    "travel": {
        "less5": "&lt; 5 minutes",
        "5to9": "5-9 minutes",
        "10to14": "10-14 minutes",
        "15to19": "15-19 minutes",
        "20to24": "20-24 minutes",
        "25to29": "25-29 minutes",
        "30to34": "30-34 minutes",
        "35to39": "35-39 minutes",
        "40to44": "40-44 minutes",
        "45to59": "45-59 minutes",
        "60to89": "60-89 minutes",
        "90over": "90+ minutes"
    }
}
COLMAP["acs_race"] = COLMAP["race"]
COLMAP["pums_race"] = COLMAP["race"]
COLMAP["propertyval"] = COLMAP["propertyvalBucket"]
COLMAP["propertytax"] = COLMAP["propertytaxBucket"]

GLOSSARY = {
    "RCA": {
        "def": "The RCA calculation compares the share in a given constraint versus the national share.",
        "link": "/about/glossary/#rca",
        "alts": ["Most Specialized", "relatively high", "High Relative", "Revealed Comparative Advantage", "revealed comparative advantage"]
    },
    "GINI": {
        "def": "The GINI coefficient is a measure of statistical dispersion intended to represent the equality of a distribution, and is the most commonly used measure of inequality. Values range from 0 to 1, with 0 being perfect equality.",
        "link": "/about/glossary/#gini",
        "alts": ["Wage GINI", "wage GINI"]
    },
    "non-black": {
        "def": "Data from the Dartmouth Atlas reports only two racial categories: black and non-black.",
        "link": "/about/glossary/#dartmouth",
        "alts": ["Non-black", "Non-Black", "medicare_beneficiaries_white", "medicare_beneficiaries_black", "patients_with_one_ambulatory_visit_to_pc_black", "patients_with_one_ambulatory_visit_to_pc_white", "diabetic_medicare_enrollees_65_75_black", "diabetic_medicare_enrollees_65_75_white", "patients_diabetic_medicare_enrollees_65_75_hemoglobin_black", "patients_diabetic_medicare_enrollees_65_75_hemoglobin_white", "patients_diabetic_medicare_enrollees_65_75_eye_exam_black", "patients_diabetic_medicare_enrollees_65_75_eye_exam_white", "patients_diabetic_medicare_enrollees_65_75_lipid_test_black", "patients_diabetic_medicare_enrollees_65_75_lipid_test_white", "number_of_females_enrolled_67_69_black", "number_of_females_enrolled_67_69_white", "patients_females_67_69_having_mammogram_black", "patients_females_67_69_having_mammogram_white", "beneficiaries_part_a_eligible_black", "beneficiaries_part_a_eligible_white", "discharges_for_ambulatory_conditions_per_1000_black", "discharges_for_ambulatory_conditions_per_1000_white", "leg_amputations_per_1000_enrollees_white", "leg_amputations_per_1000_enrollees_black"]
    },
    "mental_health_providers": {
        "def": "The ratio of the population to the total number of mental health providers including psychiatrists, psychologists, licensed clinical social workers, counselors, marriage and family therapists and advanced practice nurses specializing in mental health care."
    },
    "other_primary_care_providers": {
        "def": "The ratio of the population to the total number of other primary care provders, which include nurse practitioners, physician assistants, and clinical nurse specialists."
    },
    "adult_smoking": {
        "def": "The percentage of adults that reported currently smoking."
    },
    "adult_obesity": {
        "def": "The percentage of adults that report a BMI greater than or equal to 30."
    },
    "excessive_drinking": {
        "def": "The percentage of adults that report excessive drinking."
    },
    "motor_vehicle_crash_deaths": {
        "def": "The amount of motor vehicle crash deaths per 100,000 population."
    },
    "homicide_rate": {
        "def": "The number or deaths due to homicide per 100,000 population."
    },
    "sexually_transmitted_infections": {
        "def": "Mumber of newly diagnosed chlamydia cases per 100,000 population."
    },
    "health_care_costs": {
        "def": "The amount of price-adjusted Medicare reimbursements per enrollee."
    },
    "diabetes": {
        "def": "The percentage of adults aged 20 and above with diagnosed diabetes."
    },
    "hiv_prevalence_rate": {
        "def": "The number of persons living with a diagnosis of human immunodeficiency virus (HIV) infection per 100,000 population."
    },
    "violent_crime": {
        "def": "The number of reported violent crime offenses per 100,000 population."
    },
    "alcoholimpaired_driving_deaths": {
        "def": "The percentage of driving deaths with alcohol involvement."
    },
    "premature_death": {
        "def": "Every death occurring before the age of 75. It is presented as a rate per 100,000 population and is age-adjusted to the 2000 US population."
    },
    "poor_or_fair_health": {
        "def": "The percentage of adults reporting fair or poor health (age-adjusted)."
    },
    "poor_physical_health_days": {
        "def": "Average number of physically unhealthy days reported in the past 30 days (age-adjusted)."
    },
    "poor_mental_health_days": {
        "def": "Average number of mentally unhealthy days reported in the past 30 days (age-adjusted)."
    },
    "low_birthweight": {
        "def": "The percentage of live births with a birthweight less than 2500 grams."
    },
    "food_environment_index": {
        "def": "An index which factors in both income and physical proximity to healthy foods."
    },
    "physical_inactivity": {
        "def": "The percentage of adults aged 20 and over reporting no leisure-time physical activity."
    },
    "access_to_exercise_opportunities": {
        "def": "The percentage of individuals who live reasonably close to a location for physical activity."
    },
    "teen_births": {
        "def": "The number of births per 1,000 female population, ages 15-19."
    },
    "uninsured": {
        "def": "The percentage of the population under age 65 that has no health insurance coverage."
    },
    "preventable_hospital_stays": {
        "def": "The hospital discharge rate for ambulatory care-sensitive conditions per 1,000 fee-for-service Medicare enrollees."
    },
    "diabetic_screening": {
        "def": "The percentage of diabetic fee-for-service Medicare patients ages 65-75 whose blood sugar control was monitored in the past year using a test of their glycated hemoglobin (HbA1c) levels."
    },
    "mammography_screening": {
        "def": "The percentage of female fee-for-service Medicare enrollees age 67-69 that had at least one mammogram over a two-year period."
    },
    "high_school_graduation": {
        "def": "The percentage of the ninth-grade cohort in public schools that graduates from high school in four years."
    },
    "some_college": {
        "def": "The percentage of the population ages 25-44 with some post-secondary education, such as enrollment in vocational/technical schools, junior colleges, or four-year colleges, including individuals who pursued education following high school but did not receive a degree."
    },
    "children_in_poverty": {
        "def": "The percentage of children under age 18 living in poverty."
    },
    "children_in_singleparent_households": {
        "def": "The percentage of children in family households that live in a household headed by a single parent (male or female head of household with no spouse present)."
    },
    "social_associations": {
        "def": "The number of social associations per 10,000 population, including membership organizations such as civic organizations, bowling centers, golf clubs, fitness centers, sports organizations, religious organizations, political organizations, labor organizations, business organizations, and professional organizations."
    },
    "injury_deaths": {
        "def": "The number of deaths due to injury per 100,000 population."
    },
    "polution_ppm": {
        "def": "The average daily density of fine particulate matter in micrograms per cubic meter (PM2.5)."
    },
    "drinking_water_violations": {
        "def": "The percentage of population being served by community water systems with health-based drinking water violations."
    },
    "severe_housing_problems": {
        "def": "The percentage of households with at least 1 or more of the following housing problems: housing unit lacks complete kitchen facilities, housing unit lacks complete plumbing facilities, household is severely overcrowded, and/or household is severely cost burdened."
    },
    "population_living_in_a_rural_area": {
        "def": "The percentage of population living in a rural area."
    },
    "premature_ageadjusted_mortality": {
        "def": "The number of deaths among residents under the age of 75 per 100,000 population."
    },
    "infant_mortality": {
        "def": "The number of deaths among children less than one year of age per 1,000 live births."
    },
    "child_mortality": {
        "def": "The number of deaths among children under age 18 per 100,000 population."
    },
    "food_insecurity": {
        "def": "The percentage of the population who did not have access to a reliable source of food during the past year."
    },
    "limited_access_to_healthy_foods": {
        "def": "The percentage of the population who are low income and do not live close to a grocery store."
    },
    "drug_poisoning_deaths": {
        "def": "The number of deaths due to drug poisoning per 100,000 population."
    },
    "uninsured_adults": {
        "def": "The percentage of the population ages 18 to 65 that has no health insurance coverage."
    },
    "uninsured_children": {
        "def": "The percentage of children under age 19 without health insurance."
    },
    "could_not_see_doctor_due_to_cost": {
        "def": "The percentage of adults who could not see a doctor in the past 12 months because of cost."
    },
    "children_eligible_for_free_lunch": {
        "def": "The percentage of children enrolled in public schools eligible for free lunch."
    },
    "unemployment": {
        "def": "The percentage of the civilian labor force, age 16 and older, that is unemployed but seeking work."
    },
    "income_inequality": {
        "def": "The ratio of household income at the 80th percentile to that at the 20th percentile."
    },
    "driving_along_to_work": {
        "def": "The percentage of the workforce that usually drives alone to work."
    },
    "long_commute__driving_alone": {
        "def": "The percentage of commuters, among those who commute to work by car, truck, or van alone, who drive longer than 30 minutes to work each day."
    },
    "population_that_is_not_proficient_in_english": {
        "def": "The percentage of population that is not proficient in English."
    }
}

for term in GLOSSARY:
    if term in DICTIONARY:
        if "alt" not in GLOSSARY[term]:
            GLOSSARY[term]["alt"] = []
        GLOSSARY[term]["alt"].append(DICTIONARY[term])

# for prefix in SUMLEVELS["geo"]:
#     sumlevel = SUMLEVELS["geo"][prefix]
#     if "desc" in sumlevel:
#         label = sumlevel["label"]
#         obj = {
#             "def": sumlevel["desc"],
#             "alts": ["{}ies".format(label[:-1]) if label.endswith("y") else "{}s".format(label)]
#         }
#         if "link" in sumlevel:
#             obj["link"] = sumlevel["link"]
#         if "shortlabel" in sumlevel:
#             short = sumlevel["shortlabel"]
#             obj["alts"].append(short)
#             obj["alts"].append("{}ies".format(short[:-1]) if short.endswith("y") else "{}s".format(short))
#         GLOSSARY[sumlevel["label"]] = obj

COLLECTIONYEARS = {
    "children_in_poverty": {
        "2015": "2013",
        "2016": "2014",
        "2017": "2015"
    },
    "uninsured": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "uninsured_adults": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "uninsured_children": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "preventable_hospital_stays": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "diabetic_screening": {
        "2015": "2012",
        "2016": "2013"
    },
    "mammography_screening": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "adult_obesity": {
        "2015": "2011",
        "2016": "2012",
        "2017": "2013"
    },
    "diabetes": {
        "2015": "2011",
        "2016": "2012",
        "2017": "2013"
    },
    "sexually_transmitted_infections": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "hiv_prevalence_rate": {
        "2015": "2010",
        "2016": "2012",
        "2017": "2013"
    },
    "alcoholimpaired_driving_deaths": {
        "2015": "2009-2013",
        "2016": "2010-2014",
        "2017": "2011-2015"
    },
    "excessive_drinking": {
        "2015": "2006-2012",
        "2016": "2014",
        "2017": "2015"
    },
    "adult_smoking": {
        "2015": "2006-2012",
        "2016": "2014",
        "2017": "2015"
    },
    "homicide_rate": {
        "2015": "2006-2012",
        "2016": "2007-2013",
        "2017": "2009-2015"
    },
    "violent_crime": {
        "2015": "2010-2012",
        "2016": "2010-2012",
        "2017": "2012-2014"
    },
    "motor_vehicle_crash_deaths": {
        "2015": "2006-2012",
        "2016": "2007-2013",
        "2017": "2009-2015"
    },
    "premature_death": {
        "2015": "2010-2012",
        "2016": "2011-2013",
        "2017": "2012-2014"
    },
    "poor_or_fair_health": {
        "2015": "2006-2012",
        "2016": "2014",
        "2017": "2015"
    },
    "poor_physical_health_days": {
        "2015": "2006-2012",
        "2016": "2014",
        "2017": "2015"
    },
    "poor_mental_health_days": {
        "2015": "2006-2012",
        "2016": "2014",
        "2017": "2015"
    },
    "low_birthweight": {
        "2015": "2006-2012",
        "2016": "2007-2013",
        "2017": "2008-2014"
    },
    "food_environment_index": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "physical_inactivity": {
        "2015": "2011",
        "2016": "2012",
        "2017": "2013"
    },
    "access_to_exercise_opportunities": {
        "2015": "2010 & 2013",
        "2016": "2010 & 2014",
        "2017": "2010 & 2014"
    },
    "teen_births": {
        "2015": "2006-2012",
        "2016": "2007-2013",
        "2017": "2008-2014"
    },
    "social_associations": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "injury_deaths": {
        "2015": "2008-2012",
        "2016": "2009-2013",
        "2017": "2011-2015"
    },
    "polution_ppm": {
        "2015": "2011",
        "2016": "2011",
        "2017": "2012"
    },
    "premature_ageadjusted_mortality": {
        "2015": "2010-2012",
        "2016": "2011-2013",
        "2017": "2013-2015"
    },
    "infant_mortality": {
        "2015": "2004-2010",
        "2016": "2006-2012",
        "2017": "2007-2013"
    },
    "child_mortality": {
        "2015": "2009-2012",
        "2016": "2010-2013",
        "2017": "2012-2015"
    },
    "food_insecurity": {
        "2015": "2012",
        "2016": "2013",
        "2017": "2014"
    },
    "limited_access_to_healthy_foods": {
        "2015": "2010",
        "2016": "2010",
        "2017": "2010"
    },
    "drug_overdose_deaths": {
        "2015": "2006-2012",
        "2016": "2012-2014",
        "2017": "2013-2015"
    },
    "children_eligible_for_free_lunch": {
        "2015": "2012",
        "2016": "2012-2013",
        "2017": "2014-2015"
    },
    "population_that_is_not_proficient_in_english": {
        "2015": "2009-2013",
        "2017": "2011-2015"
    },
    "population_living_in_a_rural_area": {
        "2015": "2010",
        "2017": "2010"
    },
    "high_school_graduation": {
        "2015": "2011-2012",
        "2016": "2012-2013",
        "2017": "2014-2015"
    },
    "some_college": {
        "2015": "2009-2013",
        "2016": "2010-2014",
        "2017": "2011-2015"
    },
    "driving_alone_to_work": {
        "2015": "2009-2013",
        "2016": "2010-2014",
        "2017": "2011-2015"
    },
    "children_in_singleparent_households": {
        "2015": "2009-2013",
        "2016": "2010-2014",
        "2017": "2011-2015"
    },
    "severe_housing_problems": {
        "2015": "2007-2011",
        "2016": "2008-2012",
        "2017": "2009-2013"
    }
}
