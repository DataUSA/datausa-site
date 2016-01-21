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
            "label": "census designated place",
            "shortlabel": "place",
            "children": "140",
            "desc": "Census designated places (CDPs) are Incorporated cities, towns, and villages. Click for more info.",
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
            "shortlabel": "tract"
        }
    },
    "cip": {
        "2": {
            "label": "course group",
            "shortlabel": "group"
        },
        "4": {
            "label": "2nd level course",
            "shortlabel": "course"
        },
        "6": {
            "label": "3rd level course",
            "shortlabel": "course"
        }
    },
    "soc": {
        "0": {
            "label": "occupation group",
            "shortlabel": "group"
        },
        "1": {
            "label": "2nd level occupation",
            "shortlabel": "occupation"
        },
        "2": {
            "label": "3rd level occupation",
            "shortlabel": "occupation"
        },
        "3": {
            "label": "4th level occupation",
            "shortlabel": "occupation"
        }
    },
    "naics": {
        "0": {
            "label": "sector",
            "shortlabel": "group"
        },
        "1": {
            "label": "2nd level industry",
            "shortlabel": "industry"
        },
        "2": {
            "label": "3rd level industry",
            "shortlabel": "industry"
        }
    }
}

TEXTCOMPARATORS = {
    "age": ("older than", "younger than", "the same age as"),
    "highlow": ("higher than", "lower than", "the same as"),
    "longshort": ("longer", "shorter", "equal"),
    "moreless": ("more than", "less than", "the same as"),
    "moreless2": ("more", "less", "the same")
}

DICTIONARY = {

    "geo": "Location Name",
    "cip": "College Degree",
    "naics": "Industry",
    "soc": "Occupation",
    "acs_ind": "ACS Industry",
    "acs_occ": "ACS Occupation",

    "adult_obesity": "Adult Obesity",
    "adult_smoking": "Adult Smoking",
    "alcoholimpaired_driving_deaths": "Alcohol-Impaired Driving Deaths",
    "age": "Age",
    "avg_wage": "Average Salary",
    "avg_wage_ft": "Average Full-Time Salary",
    "avg_wage_pt": "Average Part-Time Salary",
    "wwii": "WWII",
    "korea": "Korea",
    "vietnam": "Vietnam",
    "gulf90s": "Gulf (1990s)",
    "gulf01": "Gulf (2001-)",
    "district_tuition": "District Tuition",
    "foreign": "Foreign Born",
    "emp_thousands": "Total Employees",
    "excessive_drinking": "Excessive Drinking",

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

    "health_care_costs": "Healthcare Cost",
    "hiv_prevalence_rate": "HIV Prevalence Rate",
    "homicide_rate": "Homicide Rate",
    "income": "Yearly Income",
    "mean_commute_minutes": "Average Travel Time",
    "median_property_value": "Median Property Value",
    "med_earnings": "Median Yearly Earnings",
    "men": "Men",
    "mental_health_providers": "Mental Health Providers",
    "motor_vehicle_crash_deaths": "Motor Vehicle Crash Deaths",
    "non_eng_speakers_pct": "Non English Speakers",
    "non_us_citizens": "Non US Citizens",
    "num_emp": "Total Employees",
    "num_emp_rca": "Total Employees (RCA)",
    "num_households": "Households",
    "num_ppl": "People",
    "num_ppl_rca": "People (RCA)",
    "num_speakers": "Speakers",
    "num_speakers_rca": "Speakers (RCA)",
    "oos_tuition": "Out of State Tuition",
    "other_primary_care_providers": "Other PCPs",
    "owner_occupied_housing_units": "Homeowners",
    "pct_total": "Percentage of Degrees Awarded",

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

    "population_estimate_2011": "2011 Population Estimate",

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

    "primary_care_physicians": "Primary Care Physicians",
    "property_tax": "Property Taxes",
    "property_val": "Property Value",
    "race": "Race or Ethnicity",
    "sex": "Gender",
    "sexually_transmitted_infections": "Sexually Transmitted Infections",
    "state_tuition": "In State Tuition",

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
    "violent_crime": "Violent Crime",
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
    "output": ["$", ""],
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
    "grads_total_growth"
]

PERCENTAGES = [
    "emp_carc_2012_2022",
    "output_carc_2012_2022",
    "pct_change",
    "share"
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
        "under5": "< 5",
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
        "under10": "< $10k",
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
        "less10k": "< $10k",
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
        "less800": "< $800",
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
    }
}
COLMAP["acs_race"] = COLMAP["race"]
COLMAP["pums_race"] = COLMAP["race"]
