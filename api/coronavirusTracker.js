const axios = require("axios");
const {unique} = require("d3plus-common");
const csv = require("csvtojson");

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
  LA: "Louisiana",
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
  AS: "04000US60",
  GU: "04000US66",
  MP: "04000US69",
  PR: "04000US72",
  VI: "04000US78"
};

const world = {"Afghanistan": 35530081, "Albania": 2873457, "Algeria": 41318142, "American Samoa": 55641, "Andorra": 76965, "Angola": 29784193, "Antigua and Barbuda": 102012, "Argentina": 44271041, "Armenia": 2930450, "Aruba": 105264, "Australia": 24598933, "Austria": 8809212, "Azerbaijan": 9862429, "Bahamas": 395361, "Bahrain": 1492584, "Bangladesh": 164669751, "Barbados": 285719, "Belarus": 9507875, "Belgium": 11372068, "Belize": 374681, "Benin": 11175692, "Bermuda": 65441, "Bhutan": 807610, "Bolivia": 11051600, "Bosnia and Herzegovina": 3507017, "Botswana": 2291661, "Brazil": 209288278, "British Virgin Islands": 31196, "Brunei": 428697, "Bulgaria": 7075991, "Burkina Faso": 19193382, "Burma": 53370609, "Burundi": 10864245, "Cambodia": 16005373, "Cameroon": 24053727, "Canada": 36708083, "Cape Verde": 546388, "Caribbean": 7284294, "Cayman Islands": 61559, "Central African Republic": 4659080, "Chad": 14899994, "Channel Islands": 165314, "Chile": 18054726, "China": 1386395000, "Colombia": 49065615, "Comoros": 813912, "Costa Rica": 4905769, "Cote d'Ivoire": 24294750, "Croatia": 4125700, "Cuba": 11484636, "Curaçao": 161014, "Cyprus": 1179551, "Czechia": 10591323, "Democratic Republic of the Congo": 81339988, "Denmark": 5769603, "Djibouti": 956985, "Dominica": 73925, "Dominican Republic": 10766998, "Ecuador": 16624858, "Egypt": 97553151, "El Salvador": 6377853, "Equatorial Guinea": 1267689, "Estonia": 1315480, "Eswatini": 1367254, "Ethiopia": 104957438, "Faroe Islands": 49290, "Fiji": 905502, "Finland": 5511303, "France": 67118648, "French Polynesia": 283007, "Gabon": 2025137, "Gambia": 2100568, "Georgia": 3717100, "Germany": 82695000, "Ghana": 28833629, "Gibraltar": 34571, "Greece": 10760421, "Greenland": 56171, "Grenada": 107825, "Guam": 164229, "Guatemala": 16913503, "Guinea-Bissau": 1861283, "Guinea": 12717176, "Guyana": 777859, "Haiti": 10981229, "Honduras": 9265067, "Hong Kong": 7391700, "Hungary": 9781127, "Iceland": 341284, "India": 1339180127, "Indonesia": 263991379, "Iran": 81162788, "Iraq": 38274618, "Ireland": 4813608, "Isle of Man": 84287, "Israel": 8712400, "Italy": 60551416, "Jamaica": 2890299, "Japan": 126785797, "Jordan": 9702353, "Kazakhstan": 18037646, "Kenya": 49699862, "Kiribati": 116398, "Kosovo": 1830700, "Kuwait": 4136528, "Kyrgyzstan": 6201500, "Laos": 6858160, "Latvia": 1940740, "Lebanon": 6082357, "Lesotho": 2233339, "Liberia": 4731906, "Libya": 6374616, "Liechtenstein": 37922, "Lithuania": 2827721, "Luxembourg": 599449, "Macau": 622567, "Madagascar": 25570895, "Malawi": 18622104, "Malaysia": 31624264, "Maldives": 436330, "Mali": 18541980, "Malta": 465292, "Marshall Islands": 53127, "Mauritania": 4420184, "Mauritius": 1264613, "Mexico": 129163276, "Micronesia": 105544, "Moldova": 3549750, "Monaco": 38695, "Mongolia": 3075647, "Montenegro": 622471, "Morocco": 35739580, "Mozambique": 29668834, "Namibia": 2533794, "Nauru": 13649, "Nepal": 29304998, "Netherlands": 17132854, "New Caledonia": 280460, "New Zealand": 4793900, "Nicaragua": 6217581, "Niger": 21477348, "Nigeria": 190886311, "North Korea": 25490965, "North Macedonia": 2083160, "Northern Mariana Islands": 55144, "Norway": 5282223, "Oman": 4636262, "Pakistan": 197015955, "Palau": 21729, "Palestine": 4684777, "Panama": 4098587, "Papua New Guinea": 8251162, "Paraguay": 6811297, "Peru": 32165485, "Philippines": 104918090, "Poland": 37975841, "Portugal": 10293718, "Puerto Rico": 3337177, "Qatar": 2639211, "Republic of the Congo": 5260750, "Romania": 19586539, "Russia": 144495044, "Rwanda": 12208407, "Saint Kitts and Nevis": 55345, "Saint Lucia": 178844, "Saint Martin": 73234, "Saint Vincent and the Grenadines": 109897, "Samoa": 196440, "San Marino": 33400, "Sao Tome and Principe": 204327, "Saudi Arabia": 32938213, "Senegal": 15850567, "Serbia": 7022268, "Seychelles": 95843, "Sierra Leone": 7557212, "Singapore": 5612253, "Slovakia": 5439892, "Slovenia": 2066748, "Solomon Islands": 611343, "Somalia": 14742523, "South Africa": 56717156, "South Korea": 51466201, "South Sudan": 12575714, "Spain": 46572028, "Sri Lanka": 21444000, "Sudan": 40533330, "Suriname": 563402, "Sweden": 10067744, "Switzerland": 8466017, "Syria": 18269868, "Tajikistan": 8921343, "Tanzania": 57310019, "Thailand": 69037513, "Timor-Leste": 1296311, "Togo": 7797694, "Tonga": 108020, "Trinidad and Tobago": 1369125, "Tunisia": 11532127, "Turkey": 80745020, "Turkmenistan": 5758075, "Turks and Caicos Islands": 35446, "Tuvalu": 11192, "Uganda": 42862958, "Ukraine": 44831159, "United Arab Emirates": 9400145, "United Kingdom": 66022273, "United States": 325719178, "Uruguay": 3456750, "Uzbekistan": 32387200, "Vanuatu": 276244, "Venezuela": 31977065, "Vietnam": 95540800, "Virgin Islands": 107268, "Yemen": 28250420, "Zambia": 17094130, "Zimbabwe": 16529904};

const merge = (left, right, leftOn, rightOn) => left.reduce((all, d) => {
  const s = right.find(h => h[rightOn] === d[leftOn]);
  const item = s ? Object.assign(d, s) : d;
  all.push(item);
  return all;
}, []);

const csvToJson = data => {
  const csv = data.split("\r\n").map(d => d.split(","));
  const csvHeader = csv[0];
  return csv.slice(1).reduce((all, d) => {
    const item = {};
    csvHeader.forEach((h, i) => {
      const value = isFinite(d[i]) ? d[i] * 1 : d[i];
      item[h] = value;
    });
    all.push(item);
    return all;
  }, []);
};

module.exports = function(app) {
  app.get("/api/covid19/employment/(:level/)", async(req, res) => {
    const {level} = req.params;
    const fullData = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?gid=134214696&single=true&output=csv";
    const lastYearData = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?gid=618839723&single=true&output=csv";
    const fullUrl = level === "all" ? fullData : lastYearData;
    const respData = await axios(fullUrl)
      .then(resp => resp.data);

    const data = csvToJson(respData);

    res.json({
      data,
      source: [{
        annotations: {
          dataset_link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?output=csv",
          dataset_name: "Unemployment insurance weekly claims by state",
          source_link: "https://oui.doleta.gov/unemploy/claims.asp",
          source_name: "DOL Unemployment Insurance Weekly Claims Data"
        }
      }]
    });
  });

  app.get("/api/covid19/country", async(req, res) => {
    const origin = `${ req.protocol }://${ req.headers.host }`;
    const data = await axios(`${origin}/datacovid19.json`).then(resp => resp.data.data || resp.data);
    const dataDomain = unique(data.map(d => new Date(d.Date).getTime())).sort((a, b) => a - b);
    const domain = dataDomain.slice();
    const lastDate = domain[domain.length - 1];
    const dataCut = data.filter(d => new Date(d.Date).getTime() === lastDate);
    dataCut.sort((a, b) => b.Confirmed - a.Confirmed);
    const topCountries = dataCut.slice(0, 5).map(d => d["ID Geography"]);
    const filteredData = data.filter(d => topCountries.includes(d["ID Geography"]));
    res.json(filteredData);
  });

  app.get("/api/covid19/states", async(req, res) => {
    const data = await axios
      .get("https://covidtracking.com/api/v1/states/daily.json")
      .then(resp => resp.data);

    const origin = `${ req.protocol }://${ req.headers.host }`;
    const popData = await axios
      .get(`${origin}/api/data?measures=Population&drilldowns=State&year=latest`)
      .then(resp => resp.data.data);

    data.sort((a, b) => a.state > b.state ? 1 : a.state === b.state
      ? new Date(a.date) - new Date(b.date) : -1);

    let growth = null;
    let state = data[0].state;
    data.forEach((d, i) => {
      const date = d.date.toString();
      d.Date = `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`;
      // d.hospitalized = d.hospitalizedIncrease;

      if (state !== d.state) {
        growth = null;
        state = d.state;
      }
      else if (i) {
        const prev = data[i - 1];
        if (d.positive < prev.Confirmed) d.positive = prev.Confirmed;
        if (d.death < prev.Deaths) d.death = prev.Deaths;
        if (d.total < prev.total) d.total = prev.total;
        if (d.hospitalized < prev.hospitalized) d.hospitalized = prev.hospitalized;
      }
      d.Confirmed = d.positive;

      d.ConfirmedGrowth = !growth ? null : d.positive - growth;
      growth = d.positive;

      d["ISO2 Geography"] = d.state;

      const stateName = states[d.state];
      const stateDivision = stateToDivision[d.state];
      d.Geography = stateName;
      d["ID Geography"] = stateDivision;
      d.Deaths = d.death;
      d.Negative = d.negative;
      d.Positive = d.positive;

      for (const s of ["dateChecked", "state", "date", "death", "negative", "positive"]) {
        delete d[s];
      }

      d.PositivePC = d.Negative
        ? d.Positive / (d.Positive + d.Negative)
        : null;

    });

    const output = merge(data, popData, "ID Geography", "ID State");
    output.forEach(d => {
      d.ConfirmedPC = d.Confirmed ? d.Confirmed * 100000 / d.Population : null;
      d.DeathsPC = d.Deaths ? d.Deaths * 100000 / d.Population : null;
      [
        "hospitalizedCurrently", "hospitalizedCumulative", "inIcuCurrently", "inIcuCumulative",
        "onVentilatorCurrently", "onVentilatorCumulative", "recovered", "hash",
        "totalTestResults", "posNeg", "fips", "deathIncrease", "hospitalizedIncrease",
        "negativeIncrease", "positiveIncrease", "totalTestResultsIncrease",
        "Slug State", "pending", "Year", "ID Year"
      ].forEach(h => delete d[h]);
    });
    res.json({
      data: output,
      source: [{
        annotations: {
          dataset_link: "https://docs.google.com/spreadsheets/u/2/d/e/2PACX-1vRwAqp96T9sYYq2-i7Tj0pvTf6XVHjDSMIKBdZHXiCGGdNC0ypEU9NbngS8mxea55JuCFuua1MUeOj5/pubhtml",
          dataset_name: "Coronavirus numbers by state",
          source_link: "https://covidtracking.com/",
          source_name: "The COVID Tracking Project"
        }
      }]
    });
  });
};
