import pandas as pd
import os
import datetime as dt

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

            df = df[["Province/State", "Country/Region",
                     "Confirmed", "Deaths", "Recovered"]]
            df = df.rename(columns={"Country/Region": "Geography"})

        else:

            df = df[["Province_State", "Country_Region",
                     "Confirmed", "Deaths", "Recovered"]]
            df = df.rename(columns={"Country_Region": "Geography"})

        df["Date"] = date
        df["Date"] = df["Date"].str[6:10] + "/" + \
            df["Date"].str[0:2] + "/" + df["Date"].str[3:5]
        df = df[df["Geography"] != "US"]
        df["Geography"] = df["Geography"].replace("Mainland China", "China")
        df[["Confirmed", "Deaths", "Recovered"]] = df[[
            "Confirmed", "Deaths", "Recovered"]].astype("Int64")

        data.append(df)
    except Exception as ex:
        print(date, ex)


data = pd.concat(data, sort=False)

data = data.groupby(["Geography", "Date"]).sum().reset_index()
data["ID Geography"] = data["Geography"]

path = os.path.dirname(os.path.abspath("__file__")) + \
    "/static/datacovid19.json"

previous = pd.read_json(path) if os.path.exists(path) else pd.DataFrame([])
if len(data) > len(previous):
    data.to_json(path, orient="records")
