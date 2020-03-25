#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
import datetime as dt
import simplejson as json

today = dt.date.today()
start_day = dt.date(2020, 1, 22)
diff = today - start_day
days = diff.days
dates = pd.date_range("2020-01-22", periods=days+1, freq="D").strftime('%m-%d-%Y')
dates = pd.Series(dates).astype(str)

data = []
for date in dates:

    date_ = pd.to_datetime(date)

    try:
        if date_ <= pd.to_datetime("2020-02-29"):

            url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{}.csv".format(date)
            df = pd.read_csv(url, sep=",")
            df = df.rename(columns={"Country/Region":"Geography"})

        elif (date_ >= pd.to_datetime("2020-03-01")) & (date_ <= pd.to_datetime("2020-03-21")):

            url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{}.csv".format(date)
            df = pd.read_csv(url, sep=",")
            df = df[["Province/State", "Country/Region", "Confirmed", "Deaths", "Recovered"]]
            df = df.rename(columns={"Country/Region":"Geography"})

        else:

            url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{}.csv".format(date)
            df = pd.read_csv(url, sep=",")
            df = df[["Province_State", "Country_Region", "Confirmed", "Deaths", "Recovered"]]
            df = df.rename(columns={"Country_Region":"Geography"})

        df["Date"] = date
        df["Date"] = df["Date"].str[6:10] + "/" + df["Date"].str[0:2] + "/" + df["Date"].str[3:5]
        df = df[df["Geography"]!="US"]
        df["Geography"] = df["Geography"].replace("Mainland China", "China")
        df[["Confirmed", "Deaths", "Recovered"]] = df[["Confirmed", "Deaths", "Recovered"]].astype(int)

        data.append(df)

    except:
        pass

data = pd.concat(data, sort=False)

data = data.groupby(["Geography", "Date"]).sum().reset_index()
data["Geography ID"] = data["Geography"]

output = {
    "data": data.to_dict(orient="records")
}

with open("static/datacovid19.json", "w") as outfile:
    json.dump(output, outfile, ignore_nan=True)
