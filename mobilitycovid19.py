import pandas as pd
import os

stateToFips = {"AL": "04000US01", "AK": "04000US02", "AZ": "04000US04", "AR": "04000US05", "CA": "04000US06",
                   "CO": "04000US08", "CT": "04000US09", "DE": "04000US10", "DC": "04000US11", "FL": "04000US12",
                   "GA": "04000US13", "HI": "04000US15", "ID": "04000US16", "IL": "04000US17", "IN": "04000US18",
                   "IA": "04000US19", "KS": "04000US20", "KY": "04000US21", "LA": "04000US22", "ME": "04000US23",
                   "MD": "04000US24", "MA": "04000US25", "MI": "04000US26", "MN": "04000US27", "MS": "04000US28",
                   "MO": "04000US29", "MT": "04000US30", "NE": "04000US31", "NV": "04000US32", "NH": "04000US33",
                   "NJ": "04000US34", "NM": "04000US35", "NY": "04000US36", "NC": "04000US37", "ND": "04000US38",
                   "OH": "04000US39", "OK": "04000US40", "OR": "04000US41", "PA": "04000US42", "RI": "04000US44",
                   "SC": "04000US45", "SD": "04000US46", "TN": "04000US47", "TX": "04000US48", "UT": "04000US49",
                   "VT": "04000US50", "VA": "04000US51", "WA": "04000US53", "WV": "04000US54", "WI": "04000US55",
                   "WY": "04000US56"}

states = {"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO",
          "Connecticut": "CT", "District of Columbia": "DC", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
          "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
          "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
          "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
          "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
          "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
          "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX",
          "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
          "Wisconsin": "WI", "Wyoming": "WY", "Chicago": "IL"}

df_google = pd.read_csv("https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv", low_memory=False)

df_google = df_google[df_google["country_region_code"] == "US"]
df_google = df_google[(~df_google["sub_region_1"].isna()) & (df_google["sub_region_2"].isna())]

df_google = df_google.melt(
    id_vars=["country_region", "sub_region_1", "date"],
    value_vars=[
        "retail_and_recreation_percent_change_from_baseline",
        "grocery_and_pharmacy_percent_change_from_baseline",
        "parks_percent_change_from_baseline",
        "transit_stations_percent_change_from_baseline",
        "workplaces_percent_change_from_baseline",
        "residential_percent_change_from_baseline"
    ]
)

df_google["variable"] = df_google["variable"].replace({
    "retail_and_recreation_percent_change_from_baseline": "Retail and Recreation",
    "grocery_and_pharmacy_percent_change_from_baseline": "Grocery and Pharmacy",
    "parks_percent_change_from_baseline": "Parks",
    "transit_stations_percent_change_from_baseline": "Transit Stations",
    "workplaces_percent_change_from_baseline": "Workplaces",
    "residential_percent_change_from_baseline": "Residential"
})

df_google = df_google.drop(columns=["country_region"])
df_google = df_google.rename(columns={
    "sub_region_1": "Geography",
    "date": "Date",
    "variable": "Type",
    "value": "Percent Change from Baseline"
})

df_google = df_google[~df_google["Geography"].isna()]
df_google["ID Geography"] = df_google["Geography"].replace(states).replace(stateToFips)
df_google["Date"] = df_google["Date"].str.replace("-", "/")

path = os.path.dirname(os.path.abspath("__file__")) + "/static/mobilitycovid19.json"

previous = pd.read_json(path) if os.path.exists(path) else pd.DataFrame([])
if len(df_google) > len(previous):
    df_google.to_json(path, orient="records")
