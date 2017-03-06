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
            "desc": "Includes all 50 US states as well as Washington D.C. and Puerto Rico. Click for more info.",
            "link": "/about/glossary/#state",
        },
        "050": {
            "sumlevel": "county",
            "label": "county",
            "children": "140",
            "desc": "Most or all county subdivisions are legal entities, known to the Census Bureau as minor civil divisions. Click for more info.",
            "link": "/about/glossary/#county",
        },
        "310": {
            "sumlevel": "msa",
            "label": "metropolitan statistical area",
            "shortlabel": "metro area",
            "children": "050",
            "desc": "A Metropolitan Statistical Area (MSA) is an official designation of one or more counties around a core urban area which is the primary focus of economic activity for those counties. Click for more info.",
            "link": "/about/glossary/#msa",
        },
        "160": {
            "sumlevel": "place",
            "label": "census place",
            "shortlabel": "place",
            "children": "140",
            "desc": "The United States Census Bureau defines a place as a concentration of population which has a name, is locally recognized, and is not part of any other place. Click for more info.",
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
            "desc": "A Public Use Microdata Area (PUMAs), are geographic units containing at least 100,000 people used by the US Census for providing statistical and demographic information. Click for more info.",
            "link": "/about/glossary/#puma",
        },
        "140": {
            "sumlevel": "tract",
            "label": "census tract",
            "shortlabel": "tract",
            "desc": "Census tracts are small, relatively permanent statistical subdivisions of a county or equivalent entity that are updated by local participants prior to each decennial census. Click for more info.",
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
            "label": "Major Group",
            "shortlabel": "major_group"
        },
        "1": {
            "label": "Minor Group",
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
            "label": "Sector",
            "shortlabel": "sector"
        },
        "1": {
            "label": "Sub Sector",
            "shortlabel": "sub_sector"
        },
        "2": {
            "label": "Group",
            "shortlabel": "group"
        }
    }
}

TEXTCOMPARATORS = {
    "age": ("older than", "younger than", "approximately the same age as"),
    "fastslow": ("faster than", "slower than", "approximately the same as"),
    "highlow": ("higher than", "lower than", "approximately the same as"),
    "longshort": ("longer", "shorter", "approximately equal"),
    "moreless": ("more than", "less than", "approximately the same as"),
    "moreless2": ("more", "less", "approximately the same")
}

DICTIONARY = {

    "acs": "American Community Survey",
    "chr": "County Health Records",
    "ipeds": "IPEDS",
    "pums": "ACS PUMS",

    "msa": "MSA",
    "puma": "PUMA",

    "gini": "GINI",

    "geo": "Location",
    "cip": "College Degree",
    "naics": "Industry",
    "soc": "Occupation",
    "acs_ind": "ACS Industry",
    "acs_occ": "ACS Occupation",

    "age": "Median Age",
    "avg_wage": "Average Salary",
    "avg_wage_ft": "Average Full-Time Salary",
    "avg_wage_pt": "Average Part-Time Salary",
    "avg_age": "Average Age",
    "avg_age_ft": "Average Full-Time Age",
    "avg_age_pt": "Average Part-Time Age",
    "avg_hrs": "Average Work Hours",
    "avg_hrs_ft": "Average Full-Time Work Hours",
    "avg_hrs_pt": "Average Part-Time Work Hours",
    "wwii": "WWII",
    "korea": "Korea",
    "vietnam": "Vietnam",
    "gulf90s": "Gulf (1990s)",
    "gulf01": "Gulf (2001-)",
    "district_tuition": "District Tuition",
    "foreign": "Foreign Born",
    "emp_thousands": "Total Employees",

    "grads_asian": "Asian",
    "grads_asian_men": "Asian Men",
    "grads_asian_women": "Asian Women",
    "grads_black": "Black",
    "grads_black_men": "Black Men",
    "grads_black_women": "Black Women",
    "grads_hispanic": "Hispanic",
    "grads_hispanic_men": "Hispanic Men",
    "grads_hispanic_women": "Hispanic Women",
    "grads_hawaiian": "Hawaiian",
    "grads_hawaiian_men": "Hawaiian Men",
    "grads_hawaiian_women": "Hawaiian Women",
    "grads_men": "Men",
    "grads_multi": "Multi",
    "grads_multi_men": "Multi Men",
    "grads_multi_women": "Multi Women",
    "grads_native": "Native",
    "grads_native_men": "Native Men",
    "grads_native_women": "Native Women",
    "grads_total": "Degrees Awarded",
    "grads_total_growth": "Graduate Growth",
    "grads_white": "White",
    "grads_white_men": "White Men",
    "grads_white_women": "White Women",
    "grads_women": "Women",
    "grads_unknown": "Unknown",
    "grads_unknown_men": "Unknown Men",
    "grads_unknown_women": "Unknown Women",
    "asian": "Asian",
    "asian_men": "Asian Men",
    "asian_women": "Asian Women",
    "black": "Black",
    "black_men": "Black Men",
    "black_women": "Black Women",
    "hispanic": "Hispanic",
    "hispanic_men": "Hispanic Men",
    "hispanic_women": "Hispanic Women",
    "hawaiian": "Hawaiian",
    "hawaiian_men": "Hawaiian Men",
    "hawaiian_women": "Hawaiian Women",
    "multi": "Multi",
    "multi_men": "Multi Men",
    "multi_women": "Multi Women",
    "native": "Native",
    "native_men": "Native Men",
    "native_women": "Native Women",
    "total": "Degrees Awarded",
    "total_growth": "Graduate Growth",
    "white": "White",
    "white_men": "White Men",
    "white_women": "White Women",
    "unknown": "Unknown",
    "unknown_men": "Unknown Men",
    "unknown_women": "Unknown Women",

    "income": "Yearly Income",
    "income_white": "Yearly Income (White)",
    "income_black": "Yearly Income (Black)",
    "income_asian": "Yearly Income (Asian)",
    "income_hispanic": "Yearly Income (Hispanic)",
    "income_native": "Yearly Income (Native)",
    "income_hawaiian": "Yearly Income (Hawaiian)",
    "income_2ormore": "Yearly Income (Multi)",
    "income_whitenonhispanic": "Yearly Income (White Non-Hispanic)",
    "income_other": "Yearly Income (Other)",
    "mean_commute_minutes": "Average Travel Time",
    "median_property_value": "Median Property Value",
    "med_earnings": "Median Yearly Earnings",
    "men": "Men",

    "sexually_transmitted_infections": "Chlamydia Diagnoses",
    "violent_crime": "Violent Crimes",
    "adult_obesity": "Obesity Prevalence",
    "adult_smoking": "Adult Smoking Prevalence",
    "alcoholimpaired_driving_deaths": "Percentage of Driving Deaths Involving Alcohol",
    "diabetes": "Diabetes Prevalence",
    "health_care_costs": "Medicare Reimbursements per Enrollee",
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
    "teen_births": "Teen Births",
    "uninsured": "Uninsured",
    "preventable_hospital_stays": "Preventable Hospital Stays",
    "diabetic_screening": "Diabetic Monitoring",
    "mammography_screening": "Mammography Screening",
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
    "premature_ageadjusted_mortality": "Years of Potential Life Lost (Age-Adjusted)",
    "infant_mortality": "Infant Mortality",
    "child_mortality": "Child Mortality",
    "food_insecurity": "Food Insecurity",
    "limited_access_to_healthy_foods": "Limited Access to Healthy Foods",
    "drug_poisoning_deaths": "Drug Overdose Deaths",
    "uninsured_adults": "Uninsured Adults",
    "uninsured_children": "Uninsured Children",
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
    "pop_2ormore": "2+",
    "pop_asian": "Asian",
    "pop_black": "Black",
    "pop_hawaiian": "Hawaiian",
    "pop_latino": "Hispanic",
    "pop_native": "Native",
    "pop_other": "Other",
    "pop_white": "White",
    "2ormore": "2+",
    "asian": "Asian",
    "black": "Black",
    "hawaiian": "Hawaiian",
    "latino": "Hispanic",
    "native": "Native",
    "other": "Other",
    "white": "White",

    "population_estimate": "Population Estimate",

    "income_below_poverty": "Population in Poverty",
    "pop_poverty_status": "Overall Population",
    "poverty_2ormore": "2+",
    "poverty_asian": "Asian",
    "poverty_black": "Black",
    "poverty_hawaiian": "Hawaiian",
    "poverty_hispanic": "Hispanic",
    "poverty_native": "Native",
    "poverty_other": "Other",
    "poverty_white": "White",
    "2ormore": "2+",
    "asian": "Asian",
    "black": "Black",
    "hawaiian": "Hawaiian",
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
    "us": "Native Born",
    "us_citizens": "Citizenship",
    "value_millions": "Value",
    "vehicles": "Vehicles",
    "wage_bin": "Wage Bin",
    "women": "Women"
}

AFFIXES = {
    "state_tuition": ["$", ""],
    "oos_tuition": ["$", ""],
    "district_tuition": ["$", ""],
    "avg_wage": ["$", ""],
    "avg_wage_ft": ["$", ""],
    "avg_wage_pt": ["$", ""],
    "income": ["$", ""],
    "med_earnings": ["$", ""],
    "median_property_value": ["$", ""],
    "median_household_income": ["$", ""],
    "output": ["$", ""],
    "polution_ppm": ["", u"\u00B5g/m\u00B3"],
    "property_tax": ["$", ""],
    "property_val": ["$", ""],
    "health_care_costs": ["$", ""],
    "value_millions": ["$", ""]
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
    "could_not_see_doctor_due_to_cost"
]

PERCENTAGES = [
    "emp_carc_2014_2024",
    "output_carc_2014_2024",
    "pct_change",
    "share"
]

PER1000 = [
    "infant_mortality",
    "teen_births",
    "preventable_hospital_stays"
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
    "drug_poisoning_deaths",
    "injury_deaths"
]

NEVERCONDENSE = [
    "avg_wage",
    "avg_wage_ft",
    "avg_wage_pt",
    "income",
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
    "Most Specialized": {
        "def": "The RCA calculation compares the share in a given constraint versus the national share. Click for more info.",
        "link": "/about/glossary/#rca",
        "alts": ["relatively high", "High Relative", "Revealed Comparative Advantage", "revealed comparative advantage"]
    },
    "Wage GINI": {
        "def": "The GINI coefficient is a measure of statistical dispersion intended to represent the equality of a distribution, and is the most commonly used measure of inequality. Values range from 0 to 1, with 0 being perfect equality. Click for more info.",
        "link": "/about/glossary/#gini",
        "alts": ["wage GINI"]
    }
}
