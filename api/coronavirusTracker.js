const axios = require("axios");

module.exports = function(app) {
  app.get("/api/covid19/", async (req, res) => {
    const data = await axios
      .get("https://covidtracking.com/api/states/daily")
      .then(resp => resp.data);

    const states = {
      AL: "Alabama",
      AK: "Alaska",
      AZ: "Arizona",
      AR: "Arkansas",
      AS: "American Samoa",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DC: "District of Columbia",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      GU: "Guam",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Lousiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MP: "Northern Mariana Islands",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      PR: "Puerto Rico",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VI: "U.S. Virgin Islands",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming"
    };

    const stateToDivision = {
      AL: "04000US01",
      AK: "04000US02",
      AZ: "04000US04",
      AR: "04000US05",
      CA: "04000US06",
      CO: "04000US08",
      CT: "04000US09",
      DE: "04000US10",
      DC: "04000US11",
      FL: "04000US12",
      GA: "04000US13",
      HI: "04000US15",
      ID: "04000US16",
      IL: "04000US17",
      IN: "04000US18",
      IA: "04000US19",
      KS: "04000US20",
      KY: "04000US21",
      LA: "04000US22",
      ME: "04000US23",
      MD: "04000US24",
      MA: "04000US25",
      MI: "04000US26",
      MN: "04000US27",
      MS: "04000US28",
      MO: "04000US29",
      MT: "04000US30",
      NE: "04000US31",
      NV: "04000US32",
      NH: "04000US33",
      NJ: "04000US34",
      NM: "04000US35",
      NY: "04000US36",
      NC: "04000US37",
      ND: "04000US38",
      OH: "04000US39",
      OK: "04000US40",
      OR: "04000US41",
      PA: "04000US42",
      RI: "04000US44",
      SC: "04000US45",
      SD: "04000US46",
      TN: "04000US47",
      TX: "04000US48",
      UT: "04000US49",
      VT: "04000US50",
      VA: "04000US51",
      WA: "04000US53",
      WV: "04000US54",
      WI: "04000US55",
      WY: "04000US56",
      AS: "Undefined",
      GU: "Undefined",
      MP: "Undefined",
      PR: "Undefined",
      VI: "Undefined"
    };

    data.forEach(d => {
      d.Date = `${d.date.toString().slice(0, 4)}/${d.date
        .toString()
        .slice(4, 6)}/${d.date.toString().slice(6, 8)}`;

      d["ISO2 Geography"] = d.state;

      const stateName = states[d.state];
      const stateDivision = stateToDivision[d.state];
      d.Geography = stateName;
      d["ID Geography"] = stateDivision;

      delete d.dateChecked;
      delete d.state;
      delete d.date;

      d["Positive Rate"] = d.positive / (d.positive + d.negative);
    });

    res.json(data);
  });
};
