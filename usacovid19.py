
import pandas as pd
import datetime as dt
import numpy as np
import os

stateToDivision = {"AL": "04000US01", "AK": "04000US02", "AZ": "04000US04", "AR": "04000US05", "CA": "04000US06",
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

today = dt.date.today()
start_day = dt.date(2020, 1, 22)
diff = today - start_day
days = diff.days
dates = pd.date_range("2020-01-22", periods=days+1,
                      freq="D").strftime('%m-%d-%Y')
dates = pd.Series(dates).astype(str)

data = []
for date in dates:

    date_ = pd.to_datetime(date)

    try:

        url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{}.csv".format(
            date)
        df = pd.read_csv(url, sep=",")

        if date_ <= pd.to_datetime("2020-03-21"):

            for coordinate in ["Latitude", "Longitude"]:
                if coordinate not in list(df):
                    df[coordinate] = np.nan

            df = df[["Province/State", "Country/Region", "Confirmed",
                     "Deaths", "Recovered", "Latitude", "Longitude"]]
            df = df.rename(
                columns={"Country/Region": "Geography", "Province/State": "State"})

        else:

            df = df[["Province_State", "Country_Region",
                     "Confirmed", "Deaths", "Recovered", "Lat", "Long_"]]
            df = df.rename(columns={"Country_Region": "Geography",
                                    "Province_State": "State", "Lat": "Latitude", "Long_": "Longitude"})

        df["Date"] = date
        df["Date"] = df["Date"].str[6:10] + "/" + \
            df["Date"].str[0:2] + "/" + df["Date"].str[3:5]
        df = df[df["Geography"] == "US"]
        df[["Confirmed", "Deaths", "Recovered"]] = df[[
            "Confirmed", "Deaths", "Recovered"]].astype("Int64")
        df["Geography"] = df["Geography"].replace("US", "United States")

        data.append(df)

    except Exception as ex:
        print(date, ex)

data = pd.concat(data, sort=False)

# To get some states Id's
new = data["State"].str.split(",", n=1, expand=True)
data["Place"] = new[0]
data["State_id"] = new[1]

data["Place"] = data["Place"].replace(states)

data["State_id"].fillna(value=pd.np.nan, inplace=True)
data["State_id"] = data["State_id"].fillna(0)

data["ID Geography"] = data.apply(
    lambda x: x["Place"] if x["State_id"] == 0 else x["State_id"], axis=1)
data["ID Geography"] = data["ID Geography"].str.strip()
data["ID Geography"] = data.apply(
    lambda x: x["ID Geography"].replace(" (From Diamond Princess)", ""), axis=1)
data["ID Geography"] = data["ID Geography"].str.replace("D.C.", "WA")

data = data.loc[~data["ID Geography"].isin(["Unassigned Location", "Grand Princess Cruise Ship", "Diamond Princess",
                                            "U.S.", "Virgin Islands", "United States Virgin Islands", "Wuhan Evacuee",
                                            "Recovered", "Grand Princess", "Puerto Rico", "Guam", "US", "American Samoa",
                                            "Northern Mariana Islands"])]

data = data.drop(columns={"State", "Place", "State_id"})

data["ID Geography"] = data["ID Geography"].replace(stateToDivision)


path = os.path.dirname(os.path.abspath("__file__")) + "/static/usacovid19.json"

previous = pd.read_json(path) if os.path.exists(path) else pd.DataFrame([])
if len(data) > len(previous):
    data.to_json(path, orient="records")
