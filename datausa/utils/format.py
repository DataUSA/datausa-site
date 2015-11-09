import math

dictionary = {
    "acs_ind": "ACS Industry",
    "acs_occ": "ACS Occupation",
    "adult_obesity": "Adult Obesity",
    "adult_smoking": "Adult Smoking",
    "alcoholimpaired_driving_deaths": "Alcohol-Impaired Driving Deaths",
    "avg_wage": "Average Wage",
    "wwii": "WWII",
    "korea": "Korea",
    "vietnam": "Vietnam",
    "gulf90s": "Gulf (1990s)",
    "gulf01": "Gulf (2001-)",
    "district_tuition": "District Tuition",
    "foreign": "Foreign Born",
    "excessive_drinking": "Excessive Drinking",
    "geo": "Location Name",

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
    "mean_commute_minutes": "Average Travel Time",
    "median_property_value": "Median Property Value",
    "med_earnings": "Median Earnings",
    "men": "Men",
    "mental_health_providers": "Mental Health Providers",
    "motor_vehicle_crash_deaths": "Motor Vehicle Crash Deaths",
    "num_emp": "Number of Employees",
    "num_emp_rca": "Number of Employees (RCA)",
    "num_ppl": "Number of People",
    "num_ppl_rca": "Number of People (RCA)",
    "num_speakers": "Number of Speakers",
    "num_speakers_rca": "Number of Speakers (RCA)",
    "oos_tuition": "Out of State Tuition",
    "other_primary_care_providers": "Other PCPs",
    "owner_occupied_housing_units": "Homeowners",
    "pct_total": "Percentage of Degrees Awarded",

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
    "sexually_transmitted_infections": "Sexually Transmitted Infections",
    "state_tuition": "In State Tuition",

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

    "us": "Native Born",
    "us_citizens": "Citizenship",
    "violent_crime": "Violent Crime",
    "women": "Women"
}

affixes = {
    "state_tuition": ["$", ""],
    "oos_tuition": ["$", ""],
    "district_tuition": ["$", ""],
    "avg_wage": ["$", ""],
    "income": ["$", ""],
    "med_earnings": ["$", ""],
    "median_property_value": ["$", ""],
    "property_val": ["$", ""],
    "health_care_costs": ["$", ""]
}

percentages = [
    "non_eng_speakers_pct",
    "owner_occupied_housing_units",
    "pct_total",
    "us_citizens"
]

def num_format(number, key=None, labels=True):

    if key:

        if key == "year":
            return number

        if "_rank" in key:

            ordinals = ('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th')

            n = int(number)

            if n % 100 in (11, 12, 13):
                return u"{}{}".format("{:,}".format(n), ordinals[0])
            return u"{}{}".format("{:,}".format(n), ordinals[n % 10])

    # Converts the number to a float.
    n = float(number)

    if key and key in percentages:
        n = n * 100

    # Determines which index of "groups" to move the decimal point to.
    groups = ["", "k", "M", "B", "T"]
    m = max(0,min(len(groups)-1, int(math.floor(math.log10(abs(n))/3))))

    # Moves the decimal point and rounds the new number to specific decimals.
    n = n/10**(3*m)
    if key and key == "eci":
        n = round(n, 2)
    elif n > 99:
        n = int(n)
    elif n > 9:
        n = round(n, 1)
    elif n > 1:
        n = round(n, 2)
    else:
        n = round(n, 3)

    # Initializes the number suffix based on the group.
    n = u"{}{}".format(n, groups[m])

    if key and key in percentages:
        n = u"{}%".format(n)

    if key and labels:
        affix = affixes[key] if key in affixes else None
        if affix:
            return u"{}{}{}".format(unicode(affix[0]), n, unicode(affix[1]))

    return n
