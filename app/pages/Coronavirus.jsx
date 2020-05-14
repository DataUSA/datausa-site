import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import axios from "axios";
import {NonIdealState, Slider, Spinner, Button, Checkbox} from "@blueprintjs/core";
import {Helmet} from "react-helmet";
import {AnchorLink} from "@datawheel/canon-core";

import {countries} from "countries-list";

import styles from "style.yml";

const world = {
  "Afghanistan": 35530081,
  "Albania": 2873457,
  "Algeria": 41318142,
  "American Samoa": 55641,
  "Andorra": 76965,
  "Angola": 29784193,
  "Antigua and Barbuda": 102012,
  "Argentina": 44271041,
  "Armenia": 2930450,
  "Aruba": 105264,
  "Australia": 24598933,
  "Austria": 8809212,
  "Azerbaijan": 9862429,
  "Bahamas": 395361,
  "Bahrain": 1492584,
  "Bangladesh": 164669751,
  "Barbados": 285719,
  "Belarus": 9507875,
  "Belgium": 11372068,
  "Belize": 374681,
  "Benin": 11175692,
  "Bermuda": 65441,
  "Bhutan": 807610,
  "Bolivia": 11051600,
  "Bosnia and Herzegovina": 3507017,
  "Botswana": 2291661,
  "Brazil": 209288278,
  "British Virgin Islands": 31196,
  "Brunei": 428697,
  "Bulgaria": 7075991,
  "Burkina Faso": 19193382,
  "Burma": 53370609,
  "Burundi": 10864245,
  "Cambodia": 16005373,
  "Cameroon": 24053727,
  "Canada": 36708083,
  "Cape Verde": 546388,
  "Caribbean": 7284294,
  "Cayman Islands": 61559,
  "Central African Republic": 4659080,
  "Chad": 14899994,
  "Channel Islands": 165314,
  "Chile": 18054726,
  "China": 1386395000,
  "Colombia": 49065615,
  "Comoros": 813912,
  "Costa Rica": 4905769,
  "Cote d'Ivoire": 24294750,
  "Croatia": 4125700,
  "Cuba": 11484636,
  "Curaçao": 161014,
  "Cyprus": 1179551,
  "Czechia": 10591323,
  "Democratic Republic of the Congo": 81339988,
  "Denmark": 5769603,
  "Djibouti": 956985,
  "Dominica": 73925,
  "Dominican Republic": 10766998,
  "Ecuador": 16624858,
  "Egypt": 97553151,
  "El Salvador": 6377853,
  "Equatorial Guinea": 1267689,
  "Estonia": 1315480,
  "Eswatini": 1367254,
  "Ethiopia": 104957438,
  "Faroe Islands": 49290,
  "Fiji": 905502,
  "Finland": 5511303,
  "France": 67118648,
  "French Polynesia": 283007,
  "Gabon": 2025137,
  "Gambia": 2100568,
  "Georgia": 3717100,
  "Germany": 82695000,
  "Ghana": 28833629,
  "Gibraltar": 34571,
  "Greece": 10760421,
  "Greenland": 56171,
  "Grenada": 107825,
  "Guam": 164229,
  "Guatemala": 16913503,
  "Guinea-Bissau": 1861283,
  "Guinea": 12717176,
  "Guyana": 777859,
  "Haiti": 10981229,
  "Honduras": 9265067,
  "Hong Kong": 7391700,
  "Hungary": 9781127,
  "Iceland": 341284,
  "India": 1339180127,
  "Indonesia": 263991379,
  "Iran": 81162788,
  "Iraq": 38274618,
  "Ireland": 4813608,
  "Isle of Man": 84287,
  "Israel": 8712400,
  "Italy": 60551416,
  "Jamaica": 2890299,
  "Japan": 126785797,
  "Jordan": 9702353,
  "Kazakhstan": 18037646,
  "Kenya": 49699862,
  "Kiribati": 116398,
  "Kosovo": 1830700,
  "Kuwait": 4136528,
  "Kyrgyzstan": 6201500,
  "Laos": 6858160,
  "Latvia": 1940740,
  "Lebanon": 6082357,
  "Lesotho": 2233339,
  "Liberia": 4731906,
  "Libya": 6374616,
  "Liechtenstein": 37922,
  "Lithuania": 2827721,
  "Luxembourg": 599449,
  "Macau": 622567,
  "Madagascar": 25570895,
  "Malawi": 18622104,
  "Malaysia": 31624264,
  "Maldives": 436330,
  "Mali": 18541980,
  "Malta": 465292,
  "Marshall Islands": 53127,
  "Mauritania": 4420184,
  "Mauritius": 1264613,
  "Mexico": 129163276,
  "Micronesia": 105544,
  "Moldova": 3549750,
  "Monaco": 38695,
  "Mongolia": 3075647,
  "Montenegro": 622471,
  "Morocco": 35739580,
  "Mozambique": 29668834,
  "Namibia": 2533794,
  "Nauru": 13649,
  "Nepal": 29304998,
  "Netherlands": 17132854,
  "New Caledonia": 280460,
  "New Zealand": 4793900,
  "Nicaragua": 6217581,
  "Niger": 21477348,
  "Nigeria": 190886311,
  "North Korea": 25490965,
  "North Macedonia": 2083160,
  "Northern Mariana Islands": 55144,
  "Norway": 5282223,
  "Oman": 4636262,
  "Pakistan": 197015955,
  "Palau": 21729,
  "Palestine": 4684777,
  "Panama": 4098587,
  "Papua New Guinea": 8251162,
  "Paraguay": 6811297,
  "Peru": 32165485,
  "Philippines": 104918090,
  "Poland": 37975841,
  "Portugal": 10293718,
  "Puerto Rico": 3337177,
  "Qatar": 2639211,
  "Republic of the Congo": 5260750,
  "Romania": 19586539,
  "Russia": 144495044,
  "Rwanda": 12208407,
  "Saint Kitts and Nevis": 55345,
  "Saint Lucia": 178844,
  "Saint Martin": 73234,
  "Saint Vincent and the Grenadines": 109897,
  "Samoa": 196440,
  "San Marino": 33400,
  "Sao Tome and Principe": 204327,
  "Saudi Arabia": 32938213,
  "Senegal": 15850567,
  "Serbia": 7022268,
  "Seychelles": 95843,
  "Sierra Leone": 7557212,
  "Singapore": 5612253,
  "Slovakia": 5439892,
  "Slovenia": 2066748,
  "Solomon Islands": 611343,
  "Somalia": 14742523,
  "South Africa": 56717156,
  "South Korea": 51466201,
  "South Sudan": 12575714,
  "Spain": 46572028,
  "Sri Lanka": 21444000,
  "Sudan": 40533330,
  "Suriname": 563402,
  "Sweden": 10067744,
  "Switzerland": 8466017,
  "Syria": 18269868,
  "Tajikistan": 8921343,
  "Tanzania": 57310019,
  "Thailand": 69037513,
  "Timor-Leste": 1296311,
  "Togo": 7797694,
  "Tonga": 108020,
  "Trinidad and Tobago": 1369125,
  "Tunisia": 11532127,
  "Turkey": 80745020,
  "Turkmenistan": 5758075,
  "Turks and Caicos Islands": 35446,
  "Tuvalu": 11192,
  "Uganda": 42862958,
  "Ukraine": 44831159,
  "United Arab Emirates": 9400145,
  "United Kingdom": 66022273,
  "United States": 325719178,
  "Uruguay": 3456750,
  "Uzbekistan": 32387200,
  "Vanuatu": 276244,
  "Venezuela": 31977065,
  "Vietnam": 95540800,
  "Virgin Islands": 107268,
  "Yemen": 28250420,
  "Zambia": 17094130,
  "Zimbabwe": 16529904
};
const stateAbbreviations = {
  "Arizona": "AZ",
  "Alabama": "AL",
  "Alaska": "AK",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Guam": "GU",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Northern Mariana Islands": "MP",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Puerto Rico": "PR",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "U.S. Virgin Islands": "VI",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};
const countryMeta = Object.keys(countries).reduce((obj, key) => {
  const d = countries[key];
  d.iso = key;
  obj[d.name] = d;
  return obj;
}, {});

import {extent, max, merge, range, sum} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
import {format} from "d3-format";
const commas = format(",");

const suffixes = ["th", "st", "nd", "rd"];

const colorArray = [
  "#f33535",
  "#ffb563",
  "#418e84",
  "#2f1fc1",
  "#bf168e",
  "#5a1d28",
  "#c19a1f",
  "#336a81",
  "#8c567c",
  "#ff8166",
  "#72f5c4",
  "#c0451e"
];

/** */
function suffix(number) {
  const tail = number % 100;
  return suffixes[(tail < 11 || tail > 13) && tail % 10] || suffixes[0];
}
const d3DayFormat = timeFormat("%A, %B %d");

const dayFormat = d =>
  d3DayFormat(d).replace(/[0-9]{2}$/, m => {
    const n = parseFloat(m, 10);
    return `${n}${suffix(n)}`;
  });

const d3WeekFormat = timeFormat("%B %d, %Y");

const weekFormat = d =>
  d3WeekFormat(d).replace(/\s[0-9]{2}\,/, m => {
    const n = parseFloat(m, 10);
    return ` ${n}${suffix(n)},`;
  });
const yearFormat = timeFormat("%Y");

import {colorLegible} from "d3plus-color";
import {assign} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";
import {Geomap, LinePlot} from "d3plus-react";

import {divisions, stateToDivision} from "helpers/stateDivisions";
import colors from "../../static/data/colors.json";
import {updateTitle} from "actions/title";

import SectionIcon from "toCanon/SectionIcon";
import SourceGroup from "toCanon/components/SourceGroup";

import "./Coronavirus.css";

const ctSource = {
  dataset_link:
    "https://docs.google.com/spreadsheets/u/2/d/e/2PACX-1vRwAqp96T9sYYq2-i7Tj0pvTf6XVHjDSMIKBdZHXiCGGdNC0ypEU9NbngS8mxea55JuCFuua1MUeOj5/pubhtml",
  dataset_name: "Coronavirus numbers by state",
  source_link: "https://covidtracking.com/",
  source_name: "The COVID Tracking Project"
};

const googleSource = {
  dataset_link: "https://www.google.com/covid19/mobility/",
  dataset_name: "https://www.google.com/&#8203;covid19/&#8203;mobility/",
  source_name: "Google LLC <em>\"Google COVID-19 Community Mobility Reports\"</em>&nbsp;"
};

// const jhSource = {
//   dataset_link: "https://github.com/CSSEGISandData/COVID-19",
//   dataset_name: "2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository",
//   source_link: "https://systems.jhu.edu/",
//   source_name: "Johns Hopkins CSSE"
// };

const kfSource = {
  dataset_link:
    "https://www.kff.org/other/state-indicator/beds-by-ownership/?currentTimeframe=0&selectedDistributions=total&selectedRows=%7B%22states%22:%7B%22all%22:%7B%7D%7D,%22wrapups%22:%7B%22united-states%22:%7B%7D%7D%7D&sortModel=%7B%22colId%22:%22Location%22,%22sort%22:%22asc%22%7D",
  dataset_name: "State Health Facts",
  source_link: "https://www.kff.org/",
  source_name: "Kaiser Family Foundation"
};

const dolSource = {
  dataset_link:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?output=csv",
  dataset_name: "Unemployment insurance weekly claims by state",
  source_link: "https://oui.doleta.gov/unemploy/claims.asp",
  source_name: "DOL Unemployment Insurance Weekly Claims Data"
};

const ahaSource = {
  dataset_link: "https://www.ahadata.com",
  dataset_name: "Annual Survey Database",
  source_link: "https://www.aha.org/",
  source_name: "The American Hospital Association"
};

const pums1Source = {
  source_name: "Census Bureau",
  source_description:
    "The American Community Survey (ACS) Public Use Microdata Sample (PUMS) files are a set of untabulated records about individual people or housing units. The Census Bureau produces the PUMS files so that data users can create custom tables that are not available through pretabulated (or summary) ACS data products.",
  dataset_name: "ACS PUMS 1-Year Estimate",
  dataset_link:
    "https://census.gov/programs-surveys/acs/technical-documentation/pums.html",
  subtopic: "Demographics",
  table_id: "PUMS",
  topic: "Diversity",
  hidden_measures:
    "ygbpop RCA,ygopop RCA,ygipop RCA,yocpop RCA,yiopop RCA,ycbpop RCA"
};

const acs1Source = {
  source_name: "Census Bureau",
  source_description:
    "Census Bureau conducts surveys of the United States Population, including the American Community Survey",
  dataset_name: "ACS 1-year Estimate",
  dataset_link: "http://www.census.gov/programs-surveys/acs/",
  table_id: "S2701,S2703,S2704",
  topic: "Health",
  subtopic: "Access and Quality"
};

const wbSource = {
  dataset_link:
    "https://datacatalog.worldbank.org/dataset/world-development-indicators",
  dataset_name: "World Development Indicators",
  source_link: "https://www.worldbank.org/",
  source_name: "The World Bank"
};

class UncontrolledSlider extends React.Component {
  state = {value: 0};
  componentWillMount() {
    const {initialValue} = this.props;
    this.setState({
      value: initialValue
    });
  }
  render() {
    const {value} = this.state;
    const {initialValue, ...rest} = this.props;

    return (
      <Slider
        {...{...rest, value}}
        onChange={value => {
          this.setState({value});
        }}
      />
    );
  }
}

/** */
function calculateMonthlyTicks(data, accessor) {
  return extent(data, accessor)
    .reduce((arr, d, i, src) => {
      arr.push(d);
      if (i === 0) {
        const dateObj = new Date(d);
        const month = dateObj.getMonth();
        let year = dateObj.getFullYear();
        let currentMonth = month + 1;
        const date = dateObj.getDate();
        const finalObj = new Date(src[1]);
        const finalMonth = finalObj.getMonth();
        const finalDate = finalObj.getDate();
        if (finalMonth - month < 3 && date < 15) arr.push(`${month + 1}/15/${year}`);
        while (currentMonth <= finalMonth) {
          if (currentMonth === month + 1) {
            if (date < 20) {
              arr.push(new Date(`${currentMonth + 1}/01/${year}`).getTime());
              if (finalMonth - month < 3) arr.push(`${currentMonth + 1}/15/${year}`);
            }
          }
          else if (currentMonth === finalMonth) {
            if (finalDate > 10) arr.push(new Date(`${currentMonth + 1}/01/${year}`).getTime());
          }
          else {
            arr.push(new Date(`${currentMonth + 1}/01/${year}`).getTime());
          }
          currentMonth++;
          if (currentMonth === 12) {
            currentMonth = 0;
            year++;
          }
        }
      }
      return arr;
    }, []);
}

/** */
function calculateDailyTicks(data, accessor) {
  const maximum = max(data, accessor);
  const step = maximum > 100 ? 20 : 10;
  const ticks = range(0, maximum, step);
  if (maximum - ticks[ticks.length - 1] > step * 0.75) ticks.push(maximum);
  else if (maximum - ticks[ticks.length - 1] !== 0) ticks[ticks.length - 1] = maximum;
  ticks.shift();
  return ticks;
}

/** */
function SectionTitle(props) {
  const {slug, title} = props;
  return (
    <h2 className="section-title">
      <AnchorLink to={slug} id={slug} className="anchor">
        {title}
      </AnchorLink>
    </h2>
  );
}

/** */
function TopicTitle(props) {
  const {slug, title} = props;
  return (
    <h3 id={slug} className="topic-title">
      <AnchorLink to={slug} className="anchor">
        {title}
      </AnchorLink>
    </h3>
  );
}

class Coronavirus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      beds: [],
      countryCutoffData: [],
      countryCutoffDeathData: [],
      countryData: [],
      currentCaseSlug: "cases",
      currentCasePC: false,
      currentCaseReach: false,
      currentCaseInternational: false,
      currentStates: [],
      currentStatesHash: {},
      cutoff: 1000,
      cutoffKey: "Confirmed",
      countries: false,
      data: false,
      employmentData: [],
      stateTestData: [],
      date: false,
      icu: [],
      level: "state",
      mobilityData: [],
      mobilityDataLatest: [],
      mobilityLatestDate: "",
      mobilityType: "Workplaces",
      pops: [],
      scale: "log",
      sliderConfig: {
        min: 10,
        max: 1000,
        stepSize: 10,
        labelStepSize: 100
      },
      stateCutoffData: [],
      title: "COVID-19 in the United States"
    };
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  componentDidMount() {
    const {title} = this.state;
    this.props.updateTitle(title);

    axios
      .all([
        axios.get("/api/covid19/states"),
        axios.get("/api/covid19/country"),
        axios.get("/api/covid19/old/state"),
        axios.get("/api/covid19/employment/latest/"),
        axios.get("/api/covid19/mobility/states")
      ])
      .then(
        axios.spread((...resp) => {
          const stateTestData = resp[0].data.data;
          stateTestData.forEach(d => {
            const dID = stateToDivision[d["ID Geography"]];
            let division = divisions.find(x => x["ID Division"] === dID);
            if (!division) {
              division = divisions.find(x => x["ID Region"] === 5);
            }
            d.Date = new Date(d.Date).getTime();
            d = Object.assign(d, division);
          });
          stateTestData.sort((a, b) => a.Date - b.Date);

          const countryCases = resp[1].data.map(d => {
            const pop = world[d.Geography];
            d["ID Geography"] = countryMeta[d.Geography]
              ? countryMeta[d.Geography].iso
              : d.Geography;
            d.Date = new Date(d.Date).getTime();
            d.ConfirmedPC = d.Confirmed / pop * 100000;
            d.RecoveredPC = d.Recovered / pop * 100000;
            d.DeathsPC = d.Deaths / pop * 100000;
            const division = divisions.find(x => x["ID Region"] === 6);
            return Object.assign(d, division);
          });

          const data = resp[2].data;
          const icuData = data.icu;

          const cutoffDate = new Date("2007/01/01").getTime();

          const employmentData = resp[3].data.data
            .map(d => ({
              ...d,
              ...divisions.find(
                x => x["ID Division"] === stateToDivision[d.fips_code]
              ),
              "ID Geography": d.fips_code,
              "Geography": d.state_name,
              "Date": new Date(d.week_ended.replace(/\-/g, "/")).getTime()
            }))
            .filter(d => d.Date > cutoffDate);

          const mobilityData = resp[4].data.data.map(d => ({
            ...d,
            ...divisions.find(
              x => x["ID Division"] === stateToDivision[d["ID Geography"]]
            )
          }));
          const mobilityLatestDate = mobilityData
            .map(d => d.Date)
            .sort((a, b) => b > a ? 1 : -1)[0];
          const mobilityDataLatest = mobilityData.filter(
            d => d.Date === mobilityLatestDate
          );

          this.setState(
            {
              beds: data.beds,
              countryCases,
              icu: icuData,
              mobilityData,
              mobilityDataLatest,
              mobilityLatestDate,
              pops: data.population,
              stateTestData,
              employmentData
            },
            this.prepData.bind(this)
          );
        })
      )
      .catch(() =>
        this.setState({data: "Error loading data, please try again later."})
      );
  }

  changeCutoff(value) {
    this.setState({cutoff: value}, this.prepData.bind(this));
  }

  changeScale(scale) {
    if (scale !== this.state.scale) this.setState({scale});
  }

  changeCaseSlug(e) {
    const currentCaseSlug = e.target.value;    
    const lookup = {
      cases: "Confirmed",
      deaths: "Deaths",
      hospitalizations: "Hospitalized",
      tests: "Tests",
      positive: "Tests",
      daily: "Confirmed"
    };
    const cutoffKey = lookup[currentCaseSlug];
    this.setState({currentCaseSlug, cutoffKey}, this.prepData.bind(this, true));
  }

  prepData(reset) {
    const {stateTestData, countryCases, cutoffKey} = this.state;
    let {cutoff} = this.state;

    const maxPct = .1;
    const dataMax = max(stateTestData, d => d[cutoffKey]);
    const cutoffStepSize = Math.pow(10, String(dataMax).length - 3);
    let cutoffLabelStepSize = cutoffStepSize * 10;
    const cutoffMax = Math.round(dataMax * maxPct / cutoffLabelStepSize) * cutoffLabelStepSize;
    if (cutoffLabelStepSize > cutoffMax / 2) cutoffLabelStepSize /= 5;
    
    if (reset) cutoff = cutoffStepSize;

    const sliderConfig = {
      max: cutoffMax,
      min: 0,
      stepSize: cutoffStepSize,
      labelStepSize: cutoffLabelStepSize,
      renderLabel: label => formatAbbreviate(label)
    };

    const stateCutoffData = merge(
      nest()
        .key(d => d["ID Geography"])
        .entries(stateTestData)
        .map(group => {
          let days = 0;
          return group.values.reduce((arr, d) => {
            if (d[cutoffKey] >= cutoff) {
              days++;
              d.Days = days;
              arr.push(d);
            }
            return arr;
          }, []);
        })
        .sort((a, b) => max(b, d => d[cutoffKey]) - max(a, d => d[cutoffKey]))
    );

    const chinaCutoff = new Date("2020/02/17").getTime();
    const countryData = countryCases.filter(d => {
      if (d.Geography === "China") {
        return d.Date <= chinaCutoff;
      }
      return true;
    });

    const countryCutoffData = merge(
      nest()
        .key(d => d["ID Geography"])
        .entries(countryData.concat(stateTestData))
        .map(group => {
          let days = 0;
          return group.values.reduce((arr, d) => {
            if (d.Confirmed > cutoff) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
        })
        .sort((a, b) => max(b, d => d.Confirmed) - max(a, d => d.Confirmed))
    );

    const countryCutoffDeathData = merge(
      nest()
        .key(d => d["ID Geography"])
        .entries(countryData.concat(stateTestData))
        .map(group => {
          let days = 0;
          return group.values.reduce((arr, d) => {
            if (d.Deaths > cutoff) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
        })
        .sort((a, b) => max(b, d => d.Deaths) - max(a, d => d.Deaths))
    );

    this.setState({
      stateCutoffData,
      countryCutoffData,
      countryCutoffDeathData,
      countryData,
      cutoff,
      sliderConfig
    });
  }

  render() {
    const {
      beds,
      countryCutoffData,
      countryCutoffDeathData,
      cutoff,
      currentCaseSlug,
      currentCasePC,
      currentCaseReach,
      currentCaseInternational,
      currentStates,
      currentStatesHash,
      employmentData,
      mobilityData,
      mobilityDataLatest,
      mobilityType,
      stateTestData,
      // measure,
      icu,
      pops,
      scale,
      sliderConfig,
      stateCutoffData,
      title
    } = this.state;

    const stateFilter = d =>
      currentStates.length > 0
        ? currentStatesHash[d["ID Geography"]] || d.Region === "International"
        : true;
    const stateTestDataFiltered = stateTestData.filter(stateFilter);
    const stateCutoffDataFiltered = stateCutoffData.filter(stateFilter);
    const countryCutoffDataFiltered = countryCutoffData.filter(stateFilter);
    const countryCutoffDeathDataFiltered = countryCutoffDeathData.filter(
      stateFilter
    );

    const mobilityDataFiltered = mobilityData
      .filter(stateFilter)
      .filter(d => d.Type === mobilityType && d["ID Geography"]);
    const mobilityDataTicks = calculateMonthlyTicks(mobilityDataFiltered, d => d.Date);

    // manually forcing small labels on desktop
    const smallLabels = true;
    // const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    // const smallLabels = w < 768;

    const dateFormat = d =>
      timeFormat("%B %d")(d).replace(/[0-9]{2}$/, m => parseFloat(m, 10));
    const daysFormat = d => `${commas(d)} day${d !== 1 ? "s" : ""}`;

    const scaleLabel = scale === "log" ? "Logarithmic" : "Linear";

    const lineColor =
      currentStates.length === 0
        ? d => colors.Region[d["ID Region"]]
        : d => {
          if (d.Region === "International") return "#ccc";
          return colorArray[
            currentStates.indexOf(
              currentStates.find(
                s => s["ID Geography"] === d["ID Geography"]
              )
            ) % colorArray.length
          ];
        };


    const sharedConfig = {
      aggs: {
        "ID Division": arr => arr[0],
        "ID Region": arr => arr[0]
      },
      discrete: "x",
      groupBy: ["ID Region", "ID Geography"],
      height: 500,
      label: smallLabels
        ? d =>
          stateAbbreviations[d.Geography] ||
            (countryMeta[d.Geography] && d.Geography !== "United States"
              ? countryMeta[d.Geography].emoji
              : d.Geography)
        : d =>
          d["ID Region"] === 6
            ? `${countryMeta[d.Geography] ? countryMeta[d.Geography].emoji : ""}${d.Geography}`
            : d.Geography,
      legend: false,
      legendConfig: {
        title: false,
        titleConfig: {
          fontColor: "#484848",
          fontSize: 12
        }
      },
      legendTooltip: {
        tbody: []
      },
      on: {
        mouseenter(d) {
          if (d["ID Geography"] instanceof Array) {
            this.hover(h => (h.data || h)["ID Region"] === d["ID Region"]);
          }
          else this.hover(h => h["ID Geography"] === d["ID Geography"]);
        }
      },
      lineLabels: true,
      shapeConfig: {
        hoverOpacity: 0.25,
        Line: {
          labelConfig: {
            fontColor: d => colorLegible(lineColor(d)),
            fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
            fontSize: () => 12
          },
          sort: a => a["ID Region"] !== 6 ? 1 : -1,
          stroke: lineColor,
          strokeWidth: 2
        }
      },
      tooltipConfig: {
        tbody: d => {
          const arr = [["Date", dateFormat(new Date(d.Date))]];
          if (d.Confirmed !== undefined) {
            arr.push(["Total Cases", commas(d.Confirmed)]);
          }
          if (d.ConfirmedGrowth !== undefined) {
            arr.push(["New Cases", commas(d.ConfirmedGrowth)]);
          }
          if (d.ConfirmedPC !== undefined) {
            arr.push(["Cases per 100,000", formatAbbreviate(d.ConfirmedPC)]);
          }
          if (d.ConfirmedPC !== undefined) {
            arr.push(["% Positive Tests", `${formatAbbreviate(d.PositivePct)}%`]);
          }
          if (d.initial_claims !== undefined) {
            arr.push(["Initial Claims", formatAbbreviate(d.initial_claims)]);
          }
          return arr;
        },
        title: d =>
          d["ID Region"] === 6
            ? `${countryMeta[d.Geography] ? countryMeta[d.Geography].emoji : ""}${d.Geography}`
            : d.Geography
      },
      titleConfig: {
        fontSize: 21
      },
      xConfig: {
        gridConfig: {"stroke-width": 0},
        labelRotation: false,
        shapeConfig: {
          labelBounds: d => {
            const {y, height} = d.labelBounds;
            const w = 100;
            return {width: w, height, y, x: -w / 2};
          }
        }
      },
      y: "Confirmed",
      yConfig: {
        barConfig: {
          stroke: "transparent"
        },
        scale,
        tickFormat: commas
      }
    };

    const mapConfig = {
      titleConfig: {
        fontSize: 21
      },
      zoom: false
    };

    // Geomaps
    const geoStateConfig = {
      colorScalePosition: false,
      zoom: false,
      time: "Date",
      timeline: false,
      groupBy: "ID Geography",
      label: d => d.Geography,
      shapeConfig: {
        Path: {
          stroke: d =>
            currentStatesHash[d["ID Geography"]] ? lineColor(d) : styles.dark,
          strokeWidth: d => currentStatesHash[d["ID Geography"]] ? 3 : 1,
          strokeOpacity: d =>
            currentStatesHash[d["ID Geography"]] ? 0.75 : 0.25
        }
      },
      projection:
        typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
      titleConfig: {
        fontSize: 21
      },
      tooltipConfig: Object.assign({}, sharedConfig.tooltipConfig, {
        footer: d =>
          `Click to ${
            !currentStatesHash[d["ID Geography"]]
              ? `select ${d.Geography}`
              : "clear state selection"
          }`
      }),
      on: {
        click: d => {
          if (currentStatesHash[d["ID Geography"]]) {
            const newCurrentStates = currentStates.filter(
              o => o["ID Geography"] !== d["ID Geography"]
            );
            const newCurrentStatesHash = newCurrentStates.reduce(
              (acc, d) => ({[d["ID Geography"]]: true, ...acc}),
              {}
            );
            this.setState({
              currentStates: newCurrentStates,
              currentStatesHash: newCurrentStatesHash
            });
          }
          else {
            const newCurrentStates = currentStates.concat(d);
            const newCurrentStatesHash = newCurrentStates.reduce(
              (acc, d) => ({[d["ID Geography"]]: true, ...acc}),
              {}
            );
            this.setState({
              currentStates: newCurrentStates,
              currentStatesHash: newCurrentStatesHash
            });
          }
        }
      },
      topojson: "/topojson/State.json"
    };

    const deathTooltip = {
      tbody: d => {
        const arr = [
          ["Date", dateFormat(new Date(d.Date))],
          ["Total Deaths", commas(d.Deaths)]
        ];
        if (d.DeathsPC !== undefined) {
          arr.push(["Deaths per 100,000", formatAbbreviate(d.DeathsPC)]);
        }
        return arr;
      }
    };

    const nationDivision = divisions.find(x => x["ID Region"] === 5);
    const employmentDataFiltered = currentStates.length
      ? employmentData.filter(stateFilter)
      : nest()
        .key(d => d.Date)
        .entries(employmentData)
        .map(group => {
          const d = Object.assign({}, group.values[0], nationDivision);
          d.Geography = "United States";
          d["ID Geography"] = "01000US";
          [
            "initial_claims",
            "continued_claims",
            "covered_employment"
          ].forEach(key => {
            d[key] = sum(group.values, d => d[key]);
          });
          return d;
        });

    const latestEmployment = max(employmentDataFiltered, d => d.Date);
    const latestEmploymentData = employmentData.filter(
      d => d.Date === latestEmployment
    );
    const employmentDate = new Date("03/21/2020");
    const employmentStat = sum(
      employmentData.filter(d => d.Date >= employmentDate),
      d => d.initial_claims
    );
    const employmentStatStates = sum(
      employmentDataFiltered.filter(d => d.Date >= employmentDate),
      d => d.initial_claims
    );

    const StateSelector = () =>
      currentStates.length
        ? <Button
          className="pt-fill"
          iconName="cross"
          onClick={() =>
            this.setState({currentStates: [], currentStatesHash: {}})
          }
        >
          {`Click to Clear State Selection${
            currentStates.length > 1 ? "s" : ""
          }`}
        </Button>
        : <div className="topic-subtitle">
          Use the map to select individual states.
        </div>
      ;

    const AxisToggle = () =>
      <div>
        <label className="pt-label pt-inline">
          Y-Axis Scale
          <div className="pt-button-group pt-fill">
            <Button className={scale === "linear" ? "pt-active pt-fill" : "pt-fill"} onClick={this.changeScale.bind(this, "linear")}>Linear</Button>
            <Button className={scale === "log" ? "pt-active pt-fill" : "pt-fill"} onClick={this.changeScale.bind(this, "log")}>Logarithmic</Button>
          </div>
        </label>
        <div className="SourceGroup">
          For more information about the difference between linear and
          logarithmic scale,{" "}
          <AnchorLink to="faqs-growth">click here</AnchorLink>.
        </div>
      </div>
    ;

    const CutoffToggle = () =>
      <div className="cutoff-slider">
        <UncontrolledSlider
          initialValue={cutoff}
          onRelease={this.changeCutoff.bind(this)}
          {...sliderConfig}
        />
      </div>
    ;

    const tooltipConfigTracker = {
      tbody: d => {
        const arr = [
          ["Date", dateFormat(d.Date)]
        ];
        if (d.Tests) {
          arr.push(["Total Tests", commas(d.Tests)]);
        }
        if (d.PositivePct) {
          arr.push([
            "Percentage of tests yielding positive results",
            `${formatAbbreviate(d.PositivePct)}%`
          ]);
        }
        if (d.Hospitalized) {
          arr.push(["Hospitalized patients", commas(d.Hospitalized)]);
        }
        if (d.HospitalizedPC) {
          arr.push(["Hospitalized patients per Capita", formatAbbreviate(d.HospitalizedPC)]);
        }

        return arr;
      }
    };

    // stats helpers
    const today = max(stateTestData, d => d.Date);
    const latest = stateTestData.filter(d => d.Date === today);
    const show = stateTestData.length > 0;

    const list = d => {
      if (d.length > 3) return `the ${d.length} selected states`;
      else return this.context.formatters.list(d);
    };

    // top-level stats
    const stats = {};
    const totalCases = sum(latest, d => d.Confirmed);
    stats.totalCases = commas(totalCases);
    const totalPopulation = sum(latest, d => d.Population);
    stats.totalPC = formatAbbreviate(totalCases / totalPopulation * 100000);
    const totalDeaths = sum(latest, d => d.Deaths);
    stats.totalDeaths = commas(totalDeaths);
    stats.totalDeathsPC = formatAbbreviate(
      totalDeaths / totalPopulation * 100000
    );
    stats.totalHospitalizations = commas(sum(latest, d => d.Hospitalized));
    const totalTests = sum(latest, d => d.Tests);
    stats.totalTests = commas(totalTests);
    const totalPositive = sum(latest, d => d.Confirmed);
    stats.totalPositivePercent = `${formatAbbreviate(
      totalPositive / totalTests * 100
    )}% Tested Positive`;

    // topic stats
    const topicStats = {};
    const latestFiltered = latest.filter(d =>
      currentStates.length > 0 ? currentStatesHash[d["ID Geography"]] : true
    );
    const totalCasesFiltered = sum(latestFiltered, d => d.Confirmed);
    topicStats.totalCases = commas(totalCasesFiltered);
    const totalPopulationFiltered = sum(latestFiltered, d => d.Population);
    topicStats.totalPC = formatAbbreviate(
      totalCasesFiltered / totalPopulationFiltered * 100000
    );
    const totalDeathsFiltered = sum(latestFiltered, d => d.Deaths);
    topicStats.totalDeaths = commas(totalDeathsFiltered);
    topicStats.totalDeathsPC = formatAbbreviate(
      totalDeathsFiltered / totalPopulationFiltered * 100000
    );
    const totalHospitalizationsFiltered = sum(latestFiltered, d => d.Hospitalized);
    topicStats.totalHospitalizations = commas(totalHospitalizationsFiltered);
    topicStats.totalHospitalizationsPC = formatAbbreviate(
      totalHospitalizationsFiltered / totalPopulationFiltered * 100000
    );
    const totalTestsFiltered = sum(latestFiltered, d => d.Tests);
    topicStats.totalTests = commas(totalTestsFiltered);
    topicStats.totalTestsPC = formatAbbreviate(
      totalTestsFiltered / totalPopulationFiltered * 100000
    );
    const totalPositiveFiltered = sum(latestFiltered, d => d.Confirmed);
    topicStats.totalPositivePercent = `${formatAbbreviate(
      totalPositiveFiltered / totalTestsFiltered * 100
    )}%`;
    topicStats.totalPositive = `${formatAbbreviate(
      totalCasesFiltered / totalTestsFiltered * 100
    )}%`;

    const pctCutoffDate = new Date(today - 12096e5);
    const cutoffFormatted = formatAbbreviate(cutoff);
    const example = `${formatAbbreviate(sliderConfig.stepSize)}, ${formatAbbreviate(sliderConfig.stepSize * 2)}, or ${formatAbbreviate(sliderConfig.stepSize * 10)}`;

    const caseSections = {
      cases: {
        showCharts: currentCaseInternational
          ? countryCutoffData.length > 0
          : currentCaseReach
            ? stateCutoffData.length > 0
            : stateTestData.length > 0,
        title: currentCaseInternational
          ? "International Comparison (Cases)"
          : currentCasePC
            ? "Total Confirmed Cases per Capita"
            : currentCaseReach
              ? `Total Confirmed Cases Since Reaching ${cutoffFormatted} Cases`
              : "Total Confirmed Cases By Date",
        stat: currentCaseInternational || currentCaseReach
          ? false
          : {
            value: show
              ? currentCasePC
                ? topicStats.totalPC
                : topicStats.totalCases
              : <Spinner />,
            title: `${currentCasePC ? "Cases per 100k" : "Total Cases"} in ${currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseInternational
          ? ["To get a sense of how the COVID-19 trajectory in the U.S. states compares to that in other countries, we compare the per capita number of cases for each state that has reported more than 50 cases, with that of the five countries that have reported most cases. We shift all time starting points to the day each place reported a total of 50 cases or more."]
          : currentCaseReach
            ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} cases.`]
            : currentCasePC
              ? ["This chart normalizes the number of confirmed COVID-19 cases by the population of each state. It gives an idea of the \"density\" of COVID-19 infections in each state."]
              : ["This chart shows the number of confirmed COVID-19 cases in each U.S. state by date. It is the simplest of all charts, which does not control for the size of a state, or the time the epidemic began in that state."],
        sources: currentCaseInternational
          ? [ctSource, acs1Source, wbSource]
          : currentCasePC
            ? [ctSource, acs1Source]
            : [ctSource],
        option: "Confirmed Cases",
        lineConfig: {
          data: currentCaseInternational
            ? countryCutoffDataFiltered
            : currentCaseReach
              ? currentCasePC
                ? stateCutoffDataFiltered.filter(d => d.ConfirmedPC)
                : stateCutoffDataFiltered.filter(d => d.Confirmed)
              : currentCasePC
                ? stateTestDataFiltered.filter(d => d.ConfirmedPC)
                : stateTestDataFiltered.filter(d => d.Confirmed),
          title: currentCaseInternational || currentCasePC
            ? `Confirmed Cases per 100,000 (${scaleLabel})`
            : `Confirmed Cases (${scaleLabel})`,
          time: "Date",
          timeline: false,
          x: currentCaseInternational || currentCaseReach
            ? "Days"
            : "Date",
          xConfig: {
            title: currentCaseInternational
              ? "Days Since 50 Confirmed Cases"
              : currentCaseReach
                ? `Days Since ${cutoffFormatted} Confirmed Cases`
                : "",
            labels: currentCaseInternational
              ? calculateDailyTicks(countryCutoffDataFiltered, d => d.Days)
              : currentCaseReach
                ? currentCasePC
                  ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedPC), d => d.Days)
                  : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Confirmed), d => d.Days)
                : currentCasePC
                  ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedPC), d => d.Date)
                  : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Confirmed), d => d.Date),
            ticks: currentCaseInternational
              ? calculateDailyTicks(countryCutoffDataFiltered, d => d.Days)
              : currentCaseReach
                ? currentCasePC
                  ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedPC), d => d.Days)
                  : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Confirmed), d => d.Days)
                : currentCasePC
                  ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedPC), d => d.Date)
                  : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Confirmed), d => d.Date),
            tickFormat: currentCaseInternational || currentCaseReach
              ? daysFormat
              : dateFormat
          },
          y: currentCaseInternational || currentCasePC
            ? "ConfirmedPC"
            : "Confirmed",
          yConfig: currentCaseReach
            ? {
              barConfig: {"stroke": "#ccc", "stroke-width": 1},
              tickSize: 0
            }
            : {}
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: currentCasePC ? "ConfirmedPC" : "Confirmed",
          data: currentCasePC ? latest.filter(d => d.ConfirmedPC) : latest.filter(d => d.Confirmed)
        }
      },
      deaths: {
        title: currentCaseInternational
          ? "International Comparison (Deaths)"
          : currentCasePC
            ? "Deaths per Capita"
            : currentCaseReach
              ? `Total Deaths Since Reaching ${cutoffFormatted} Deaths`
              : "Total Deaths by State",
        showCharts: currentCaseInternational
          ? countryCutoffDeathData.length > 0
          : stateTestData.length > 0,
        stat: currentCaseInternational || currentCaseReach
          ? false
          : {
            value: show
              ? currentCasePC
                ? topicStats.totalDeathsPC
                : topicStats.totalDeaths
              : <Spinner />,
            title: `${currentCasePC ? "Deaths per 100k" : "Total Deaths"} in ${currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseInternational
          ? ["Here we compare the per capita number of deaths attributed to COVID-19 in each state that has reported more than 10 deaths with that of the five countries that have reported the most deaths. We shift all time starting points to the day each place reported its tenth death."]
          : currentCaseReach
            ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} deaths.`]
            : currentCasePC
              ? ["This chart normalizes the number of confirmed COVID-19 deaths by the population of each state. It gives an idea of the impact of COVID-19 infections in each state."]
              : ["This chart shows the number of deaths attributed to COVID-19 cases in each U.S. state."],
        sources: currentCaseInternational
          ? [ctSource, acs1Source, wbSource]
          : currentCasePC
            ? [ctSource, acs1Source]
            : [ctSource],
        option: "Deaths",
        lineConfig: {
          data: currentCaseInternational
            ? countryCutoffDeathDataFiltered
            : currentCaseReach
              ? currentCasePC
                ? stateCutoffDataFiltered.filter(d => d.DeathsPC)
                : stateCutoffDataFiltered.filter(d => d.Deaths)
              : currentCasePC
                ? stateTestDataFiltered.filter(d => d.DeathsPC)
                : stateTestDataFiltered.filter(d => d.Deaths),
          title: `${currentCasePC || currentCaseInternational ? "Deaths per 100,000" : "Deaths"} (${scaleLabel})`,
          tooltipConfig: deathTooltip,
          time: "Date",
          timeline: false,
          x: currentCaseInternational || currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseInternational
              ? currentCaseReach
                ? `Days Since ${cutoffFormatted} Deaths`
                : "Days Since 10 Deaths"
              : currentCaseReach
                ? `Days Since ${cutoffFormatted} Deaths`
                : "",
            labels: currentCaseInternational
              ? calculateDailyTicks(countryCutoffDeathDataFiltered, d => d.Days)
              : currentCaseReach
                ? currentCasePC
                  ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.DeathsPC), d => d.Days)
                  : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Deaths), d => d.Days)
                : currentCasePC
                  ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.DeathsPC), d => d.Date)
                  : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Deaths), d => d.Date),
            ticks: currentCaseInternational
              ? calculateDailyTicks(countryCutoffDeathDataFiltered, d => d.Days)
              : currentCaseReach
                ? currentCasePC
                  ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.DeathsPC), d => d.Days)
                  : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Deaths), d => d.Days)
                : currentCasePC
                  ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.DeathsPC), d => d.Date)
                  : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Deaths), d => d.Date),
            tickFormat: currentCaseInternational || currentCaseReach ? daysFormat : dateFormat
          },
          y: currentCasePC || currentCaseInternational ? "DeathsPC" : "Deaths"
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: currentCasePC || currentCaseInternational ? "DeathsPC" : "Deaths",
          data: currentCasePC || currentCaseInternational ? latest.filter(d => d.DeathsPC) : latest.filter(d => d.Deaths),
          tooltipConfig: deathTooltip
        }
      },
      hospitalizations: {
        showCharts: stateTestData.length > 0,
        title: currentCasePC
          ? "Hospitalizations per Capita" 
          : currentCaseReach
            ? `Total Hospitalizations Since Reaching ${cutoffFormatted} Hospitalizations`
            : "Total Hospitalizations by State",
        subtitle: "Hospitalization data for some states may be delayed or not reported.",
        stat: currentCaseReach
          ? false
          : {
            value: show
              ? currentCasePC
                ? topicStats.totalHospitalizationsPC
                : topicStats.totalHospitalizations
              : <Spinner />,
            title: `${currentCasePC ? "Hospitalizations per 100k" : "Hospitalizations"} in ${currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} hospitalizations.`]
          : [
            "Hospitalizations are a statistic that, unlike cases, doesn't grow mechanically with increased testing. Hospitalizations also speak about the burden of COVID-19 in the healthcare system.",
            "This chart shows hospitalizations for all states that have registered at least 50 hospitalizations."
          ],
        sources: [ctSource],
        option: "Hospitalizations",
        lineConfig: {
          data: currentCaseReach
            ? currentCasePC
              ? stateCutoffDataFiltered.filter(d => d.HospitalizedPC)
              : stateCutoffDataFiltered.filter(d => d.Hospitalized)
            : currentCasePC
              ? stateTestDataFiltered.filter(d => d.HospitalizedPC)
              : stateTestDataFiltered.filter(d => d.Hospitalized),
          title: `Hospitalized Patients ${currentCasePC ? "per 100k" : ""} (${scaleLabel})`,
          tooltipConfig: tooltipConfigTracker,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? `Days Since ${cutoffFormatted} Hospitalizations`
              : "",
            labels: currentCaseReach
              ? currentCasePC
                ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.HospitalizedPC), d => d.Days)
                : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Hospitalized), d => d.Days)
              : currentCasePC
                ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.HospitalizedPC), d => d.Date)
                : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Hospitalized), d => d.Date),
            ticks: currentCaseReach
              ? currentCasePC
                ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.HospitalizedPC), d => d.Days)
                : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Hospitalized), d => d.Days)
              : currentCasePC
                ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.HospitalizedPC), d => d.Date)
                : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Hospitalized), d => d.Date),
            tickFormat: currentCaseReach ? daysFormat : dateFormat
          },
          y: currentCasePC ? "HospitalizedPC" : "Hospitalized"
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: currentCasePC ? "HospitalizedPC" : "Hospitalized",
          data: currentCasePC ? latest.filter(d => d.HospitalizedPC) : latest.filter(d => d.Hospitalized),
          tooltipConfig: tooltipConfigTracker
        }
      },
      tests: {
        title: currentCasePC
          ? "Tests per Capita" 
          : currentCaseReach
            ? `Total Tests Since Reaching ${cutoffFormatted} Tests`
            : "Total Tests by State",
        showCharts: stateTestData.length > 0,
        stat: currentCaseReach
          ? false
          : {
            value: show
              ? currentCasePC
                ? topicStats.totalTestsPC
                : topicStats.totalTests
              : <Spinner />,
            title: `${currentCasePC ? "Tests per 100k" : "Total Tests"} in ${currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} tests.`]
          : ["Testing is central in the fight against a pandemic such as COVID-19."],
        sources: [ctSource],
        option: "Tests",
        lineConfig: {
          data: currentCaseReach
            ? currentCasePC
              ? stateCutoffDataFiltered.filter(d => d.TestsPC)
              : stateCutoffDataFiltered.filter(d => d.Tests)
            : currentCasePC
              ? stateTestDataFiltered.filter(d => d.TestsPC)
              : stateTestDataFiltered.filter(d => d.Tests),
          title: `Number of Tests ${currentCasePC ? "per 100k" : ""} (${scaleLabel})`,
          tooltipConfig: tooltipConfigTracker,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? `Days Since ${cutoffFormatted} Tests`
              : "",
            labels: currentCaseReach
              ? currentCasePC
                ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.TestsPC), d => d.Days)
                : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Tests), d => d.Days)
              : currentCasePC
                ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.TestsPC), d => d.Date)
                : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Tests), d => d.Date),
            ticks: currentCaseReach
              ? currentCasePC
                ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.TestsPC), d => d.Days)
                : calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.Tests), d => d.Days)
              : currentCasePC
                ? calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.TestsPC), d => d.Date)
                : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.Tests), d => d.Date),
            tickFormat: currentCaseReach ? daysFormat : dateFormat
          },
          y: currentCasePC ? "TestsPC" : "Tests"
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: currentCasePC ? "TestsPC" : "Tests",
          data: currentCasePC ? latest.filter(d => d.TestsPC) : latest.filter(d => d.Tests),
          tooltipConfig: tooltipConfigTracker
        }
      },
      positive: {
        title: currentCaseReach
          ? `Percentage of Positive Test Results Since Reaching ${cutoffFormatted} Tests`
          : "Percentage of Positive Test Results",
        showCharts: stateTestData.length > 0,
        stat: currentCaseReach
          ? false
          : {
            value: show ? topicStats.totalPositive : <Spinner />,
            title: `Positive Test Results in ${currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} tests.`]
          : ["This chart shows the percentage of positive test results in each U.S. state by date."],
        sources: [ctSource],
        option: "% Positive Tests",
        lineConfig: {
          data: currentCaseReach
            ? stateCutoffDataFiltered.filter(d => d.PositivePct)
            : stateTestDataFiltered.filter(d => d.PositivePct && new Date(d.Date) >= pctCutoffDate),
          title: `Positive Tests (${scaleLabel})`,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? `Days Since ${cutoffFormatted} Tests`
              : "",
            labels: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.PositivePct), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.PositivePct && new Date(d.Date) >= pctCutoffDate), d => d.Date),
            ticks: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.PositivePct), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.PositivePct && new Date(d.Date) >= pctCutoffDate), d => d.Date),
            tickFormat: currentCaseReach ? daysFormat : dateFormat
          },
          y: "PositivePct",
          yConfig: {
            tickFormat: d => `${formatAbbreviate(d)}%`
          }
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: "PositivePct",
          data: latest.filter(d => d.PositivePct)
        }
      },
      daily: {
        title: currentCaseReach
          ? `Daily New Cases Since Reaching ${cutoffFormatted} Confirmed Cases`
          : "Daily New Cases",
        showCharts: stateTestData.length > 0,
        subtitle: currentStates.length ? null : "Use the map to select individual states.",
        // no stat!
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} cases.`]
          : [
            "Because of the exponential nature of early epidemic spreading, it is important to track not only the total number of COVID-19 cases, but their growth.",
            "This chart presents the number of new cases reported daily by each U.S. state."
          ],
        option: "Daily New Cases",
        sources: [ctSource],
        lineConfig: {
          data: currentCaseReach
            ? stateCutoffDataFiltered.filter(d => d.ConfirmedGrowth)
            : stateTestDataFiltered.filter(d => d.ConfirmedGrowth),
          time: "Date",
          timeline: false,
          title: `Daily Confirmed Cases (${scaleLabel})`,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? `Days Since ${cutoffFormatted} Confirmed Cases`
              : "",
            labels: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Date),
            ticks: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Date),
            tickFormat: currentCaseReach ? daysFormat : dateFormat
          },
          y: "ConfirmedGrowth"
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: "ConfirmedGrowth",
          data: latest.filter(d => d.ConfirmedGrowth)
        }
      }
    };

    const CaseSelector = () =>
      <div>
        <label className="pt-label pt-inline">
          Indicator
          <div className="pt-select">
            <select value={currentCaseSlug} onChange={this.changeCaseSlug.bind(this)}>
              {Object.keys(caseSections).map(d => <option key={d} value={d}>{caseSections[d].option}</option>)}
            </select>
          </div>
        </label>
      </div>;

    const isCases = currentCaseSlug === "cases";
    const isDeaths = currentCaseSlug === "deaths";
    const isTests = currentCaseSlug === "tests";
    const isHospitalizations = currentCaseSlug === "hospitalizations";
    const allowPC = isCases || isDeaths || isTests || isHospitalizations;

    const currentSection = caseSections[currentCaseSlug];

    if (currentCaseInternational || currentCaseReach) {
      delete currentSection.lineConfig.time;
      delete currentSection.lineConfig.timeline;
    }

    return (
      <div id="Coronavirus">
        <Helmet title={title}>
          <meta property="og:title" content={`${title} | Data USA`} />
        </Helmet>

        <div id="Splash" className="splash-coronavirus">
          {/* <div className="image-container">
          <div className="image" style={{backgroundImage: "url('')"}}></div>
        </div> */}
          <div className="content-container">
            <h1 className="profile-title">{title}</h1>
          </div>
          <div className="content-container">
            {today &&
              <div className="profile-subtitle">
                Latest Data from {dayFormat(today)}
              </div>
            }
          </div>
          <div className="content-container sponsors">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www2.deloitte.com/us/en.html"
            >
              <img id="deloitte" src="/images/home/logos/deloitte.png" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.datawheel.us/"
            >
              <img id="datawheel" src="/images/home/logos/datawheel.png" />
            </a>
          </div>
          <div className="content-container">
            <div className="profile-stats">
              <div className="Stat large-text">
                <div className="stat-title">Total Cases</div>
                <div className="stat-value">
                  {show ? stats.totalCases : <Spinner />}
                </div>
                <div className="stat-subtitle">in the USA</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Total Deaths</div>
                <div className="stat-value">
                  {show ? stats.totalDeaths : <Spinner />}
                </div>
                <div className="stat-subtitle">in the USA</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Total Hospitalizations</div>
                <div className="stat-value">
                  {show ? stats.totalHospitalizations : <Spinner />}
                </div>
                <div className="stat-subtitle">in the USA</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Cases per Capita</div>
                <div className="stat-value">
                  {show ? stats.totalPC : <Spinner />}
                </div>
                <div className="stat-subtitle">per 100,000</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Deaths per Capita</div>
                <div className="stat-value">
                  {show ? stats.totalDeathsPC : <Spinner />}
                </div>
                <div className="stat-subtitle">per 100,000</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Total Tests</div>
                <div className="stat-value">
                  {show ? stats.totalTests : <Spinner />}
                </div>
                <div className="stat-subtitle">
                  {show ? stats.totalPositivePercent : "Tested Positive"}
                </div>
              </div>
            </div>
          </div>
          <div className="splash-columns">
            <p>
              Based on publicly available data, how is COVID-19 (also known as
              Coronavirus) spreading in the United States? How fast is it
              growing in each state? And how prepared may different states be to
              cope with the spread of this global pandemic?
            </p>
            <p>
              At Data USA, our mission is to visualize and distribute open
              source data of U.S. public interest. To track the evolution and
              trajectory of COVID-19, we have created a series of interactive
              graphics. These visualizations are designed to put the spread of
              COVID-19 in context.
            </p>
          </div>
          <div className="profile-sections">
            <SectionIcon slug="cases" title="Confirmed Cases by State" />
            <SectionIcon slug="mobility" title="Mobility" />
            <SectionIcon slug="economy" title="Economic Impact" />
            <SectionIcon slug="risks" title="Risks and Readiness" />
            <SectionIcon slug="faqs" title="FAQs" />
          </div>
        </div>

        <div id="coronavirus-main">
          {/* Confirmed Cases by states */}
          <div className="Section coronavirus-section">
            <SectionTitle slug="cases" title="Confirmed Cases by State" />
            <div className="section-topics">
              <div className="topic TextViz">
                <div className="topic-content">
                  <TopicTitle
                    slug="cases-total"
                    title={currentSection.title}
                  />
                  <StateSelector />
                  <AxisToggle />
                  <CaseSelector />
                  <Checkbox disabled={!allowPC || currentCaseInternational} label="Per Capita" checked={currentCaseInternational || currentCasePC && allowPC} onChange={e => this.setState({currentCasePC: e.target.checked})}/>
                  <Checkbox label="Shift Time Axis" checked={currentCaseReach} onChange={e => this.setState({currentCaseReach: e.target.checked})}/>
                  <Checkbox disabled={!(isCases || isDeaths)} label="International Comparison" checked={currentCaseInternational} onChange={e => this.setState({currentCaseInternational: e.target.checked})}/>
                  {currentCaseReach && <CutoffToggle />}
                  {currentSection.stat &&
                    <div className="topic-stats">
                      <div className="StatGroup single">
                        <div className="stat-value">{currentSection.stat.value}</div>
                        <div className="stat-title">{currentSection.stat.title}</div>
                        <div className="stat-subtitle">{currentSection.stat.subtitle}</div>
                      </div>
                    </div>
                  }
                  <div className="topic-description">
                    {currentSection.descriptions.map(d => <p key={d}>{d}</p>)}
                  </div>
                  <SourceGroup sources={currentSection.sources} />
                </div>
                <div className="visualization topic-visualization">
                  { currentSection.showCharts
                    ? <LinePlot className="d3plus" config={assign({}, sharedConfig, currentSection.lineConfig)} />
                    : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
                </div>
                <div className="visualization topic-visualization">
                  { currentSection.showCharts
                    ? <Geomap className="d3plus" config={assign({}, geoStateConfig, currentSection.geoConfig)} />
                    : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
                </div>
              </div>
            </div>
          </div>

          {/** Mobility */}

          <div className="Section coronavirus-section">
            <h2 className="section-title">
              <AnchorLink to="mobility" id="mobility" className="anchor">
                Mobility
              </AnchorLink>
            </h2>
            <div className="section-body">
              <div className="section-content">
                <div className="section-description single">
                  <p>
                    Mobility data helps policymakers, local government and executives make informed decisions on COVID-19 restrictions and reopening.
                  </p>
                </div>
              </div>
            </div>
            <div className="section-topics">
              <div className="topic TextViz">
                <div className="topic-content">
                  <TopicTitle
                    slug="community-mobility"
                    title="Community Mobility"
                  />
                  <StateSelector />
                  <label className="pt-label pt-inline">
                    Place Category
                    <div className="pt-select">
                      <select
                        onChange={evt =>
                          this.setState({mobilityType: evt.target.value})
                        }
                        value={mobilityType}
                      >
                        <option>Grocery and Pharmacy</option>
                        <option>Parks</option>
                        <option>Residential</option>
                        <option>Retail and Recreation</option>
                        <option>Transit Stations</option>
                        <option>Workplaces</option>
                      </select>
                    </div>
                  </label>

                  <div className="topic-description">
                    <p>
                      This chart shows how visits and length of stay to {mobilityType.toLowerCase()} have changed over time compared to a baseline.
                    </p>
                    <p>
                      Baselines are calculated using aggregated and anonymized data to show popular times for places in Google Maps. Changes for each day are compared to a baseline value for that day of the week.
                    </p>
                  </div>
                  <SourceGroup sources={[googleSource]} />
                </div>
                <div className="visualization topic-visualization">
                  {mobilityData.length
                    ? <LinePlot
                      className="d3plus"
                      config={assign({}, sharedConfig, {
                        data: mobilityDataFiltered,
                        time: "Date",
                        timeline: false,
                        title: `Change of ${mobilityType} Mobility`,
                        tooltipConfig: {
                          tbody: d => [
                            [
                              "Percent Change",
                              `${d["Percent Change from Baseline"]}%`
                            ],
                            ["Date", dateFormat(new Date(d.Date))]
                          ]
                        },
                        x: "Date",
                        xConfig: {
                          labels: mobilityDataTicks,
                          ticks: mobilityDataTicks,
                          tickFormat: dateFormat
                        },
                        y: "Percent Change from Baseline",
                        yConfig: {
                          tickFormat: d => `${d > 0 ? "+" : ""}${d}%`,
                          scale: "linear"
                        }
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <div className="visualization topic-visualization">
                  {mobilityData.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, geoStateConfig, {
                        currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                        colorScale: d => Math.abs(d["Percent Change from Baseline"]),
                        colorScaleConfig: {
                          axisConfig: {
                            tickFormat: d => `${d > 0 ? "-" : ""}${d}%`
                          },
                          legendConfig: {
                            label: d => d.id.replace(" - ", " to ")
                          }
                        },
                        data: mobilityDataLatest.filter(
                          d => d.Type === mobilityType && d["ID Geography"]
                        ),
                        tooltipConfig: {
                          tbody: d => [
                            [
                              "Percent Change",
                              `${d["Percent Change from Baseline"]}%`
                            ],
                            ["Date", dateFormat(new Date(d.Date))]
                          ]
                        }
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Economic Impact */}

          <div className="Section coronavirus-section">
            <h2 className="section-title">
              <AnchorLink to="economy" id="economy" className="anchor">
                Economic Impact
              </AnchorLink>
            </h2>
            <div className="section-topics">
              <div className="topic TextViz">
                <div className="topic-content">
                  <h3 id="growth-daily" className="topic-title">
                    <AnchorLink to="economic-weekly" className="anchor">
                      Impact on Employment
                    </AnchorLink>
                  </h3>
                  <div className="topic-subtitle">
                    Initial unemployment insurance claim numbers are not seasonally
                    adjusted.
                  </div>
                  <StateSelector />
                  <AxisToggle />
                  <div className="topic-stats">
                    <div className="StatGroup single">
                      <div className="stat-value">
                        {show ? formatAbbreviate(employmentStat) : <Spinner />}
                      </div>
                      <div className="stat-title">
                        Initial unemployment insurance claims in the United States
                      </div>
                      <div className="stat-subtitle">
                        {show
                          ? `since the week ending ${dayFormat(employmentDate)}`
                          : ""}
                      </div>
                    </div>
                    {currentStates.length
                      ? <div className="StatGroup single">
                        <div className="stat-value">
                          {show
                            ? formatAbbreviate(employmentStatStates)
                            : <Spinner />
                          }
                        </div>
                        <div className="stat-title">
                        Initial Unemployment insurance claims in{" "}
                          {list(currentStates.map(o => o.Geography))}
                        </div>
                        <div className="stat-subtitle">
                          {show
                            ? `since the week ending ${dayFormat(employmentDate)}`
                            : ""}
                        </div>
                      </div>
                      : null}
                  </div>
                  <div className="topic-description">
                    <p>
                      Since new claims for unemployment insurance began to spike the week ending on {dayFormat(employmentDate)}, there have been over {formatAbbreviate(employmentStat)} initial claims filed.
                    </p>
                    <p>
                      This chart shows weekly initial unemployment insurance claims in
                      the United States (not-seasonally adjusted). The most
                      recent data point uses Advance State Claims data, which
                      can be revised in subsequent weeks.
                    </p>
                  </div>
                  <SourceGroup sources={[dolSource]} />
                </div>
                <div className="visualization topic-visualization">
                  {employmentData.length
                    ? <LinePlot
                      className="d3plus"
                      config={assign({}, sharedConfig, {
                        data: employmentDataFiltered,
                        time: "Date",
                        timeline: false,
                        title: `Initial Unemployment Insurance Claims (${scaleLabel})`,
                        tooltipConfig: {
                          tbody: [
                            ["Week Ending", d => weekFormat(d.Date)],
                            [
                              "Initial Claims",
                              d => formatAbbreviate(d.initial_claims)
                            ]
                          ]
                        },
                        x: "Date",
                        xConfig: {
                          tickFormat: yearFormat
                        },
                        y: "initial_claims",
                        yConfig: {
                          scale,
                          tickFormat: formatAbbreviate
                        }
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <div className="visualization topic-visualization">
                  {employmentData.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, geoStateConfig, {
                        currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                        colorScale: "initial_claims",
                        data: latestEmploymentData,
                        tooltipConfig: {
                          tbody: d => [
                            ["Date", dateFormat(new Date(d.Date))],
                            ["Initial Claims", commas(d.initial_claims)],
                            ["Continued Claims", commas(d.continued_claims)]
                          ]
                        }
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Risks and Readiness */}

          <div className="Section coronavirus-section">
            <h2 className="section-title">
              <AnchorLink to="risks" id="risks" className="anchor">
                Risks and Readiness
              </AnchorLink>
            </h2>
            <div className="section-body">
              <div className="section-content">
                <div className="section-description single">
                  <p>
                    Below you will find some statistics of the preparedness of
                    U.S. states and of the vulnerability of the population in
                    each state. For more information on critical care in the
                    United States, visit{" "}
                    <a
                      href="https://sccm.org/Communications/Critical-Care-Statistics"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      this
                    </a>{" "}
                    report from the Society of Critical Care Medicine.
                  </p>
                </div>
              </div>
            </div>
            <div className="section-topics">
              <div className="topic Column">
                <div className="topic-content">
                  <h3 id="risks-beds" className="topic-title">
                    <AnchorLink to="risks-beds" className="anchor">
                      Hospital Beds per 1,000 Population
                    </AnchorLink>
                  </h3>
                </div>
                <div className="visualization topic-visualization">
                  {beds.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, mapConfig, {
                        colorScale: "Total",
                        data: beds,
                        groupBy: "ID Geography",
                        label: d => d.Geography,
                        projection:
                          typeof window !== "undefined"
                            ? window.albersUsaPr()
                            : "geoMercator",
                        tooltipConfig: {
                          tbody: [
                            ["Year", "2018"],
                            ["Beds per 1,000 Residents", d => d.Total]
                          ]
                        },
                        topojson: "/topojson/State.json"
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <SourceGroup sources={[kfSource]} />
              </div>

              <div className="topic Column">
                <div className="topic-content">
                  <h3 id="risks-icu" className="topic-title">
                    <AnchorLink to="risks-icu" className="anchor">
                      ICU Beds per 1,000 Population
                    </AnchorLink>
                  </h3>
                </div>
                <div className="visualization topic-visualization">
                  {beds.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, mapConfig, {
                        colorScale: "TotalPC",
                        data: icu,
                        groupBy: "ID Geography",
                        label: d => d.Geography,
                        projection:
                          typeof window !== "undefined"
                            ? window.albersUsaPr()
                            : "geoMercator",
                        tooltipConfig: {
                          tbody: [
                            ["Year", "2018"],
                            [
                              "ICU Beds per 1,000 Residents",
                              d => formatAbbreviate(d.TotalPC)
                            ],
                            ["ICU Beds", d => d.Total]
                          ]
                        },
                        topojson: "/topojson/State.json"
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <SourceGroup sources={[ahaSource]} />
              </div>

              <div className="topic Column">
                <div className="topic-content">
                  <h3 id="risks-physicians" className="topic-title">
                    <AnchorLink to="risks-physicians" className="anchor">
                      Physicians and Surgeons per 1,000 Population
                    </AnchorLink>
                  </h3>
                </div>
                <div className="visualization topic-visualization">
                  {beds.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, mapConfig, {
                        colorScale: "Total Population PC",
                        colorScaleConfig: {
                          axisConfig: {
                            tickFormat: formatAbbreviate
                          }
                        },
                        data:
                          "/api/data?drilldowns=State&measures=Total%20Population&Year=2017&soc=291060",
                        groupBy: "ID State",
                        label: d => d.State,
                        projection:
                          typeof window !== "undefined"
                            ? window.albersUsaPr()
                            : "geoMercator",
                        tooltipConfig: {
                          tbody: [
                            ["Year", d => d.Year],
                            [
                              "Physicians and Surgeons",
                              d => formatAbbreviate(d["Total Population"])
                            ],
                            [
                              "Per 1,000 Population",
                              d => formatAbbreviate(d["Total Population PC"])
                            ]
                          ]
                        },
                        topojson: "/topojson/State.json"
                      })}
                      dataFormat={resp => {
                        const data = resp.data;
                        data.forEach(d => {
                          d["Total Population PC"] =
                            d["Total Population"] / pops[d["ID State"]] *
                            1000;
                        });
                        return data;
                      }}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <SourceGroup sources={[pums1Source]} />
              </div>

              <div className="topic Column">
                <div className="topic-content">
                  <h3 id="risks-nurses" className="topic-title">
                    <AnchorLink to="risks-nurses" className="anchor">
                      Registered Nurses per 1,000 Population
                    </AnchorLink>
                  </h3>
                </div>
                <div className="visualization topic-visualization">
                  {beds.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, mapConfig, {
                        colorScale: "Total Population PC",
                        colorScaleConfig: {
                          axisConfig: {
                            tickFormat: formatAbbreviate
                          }
                        },
                        data:
                          "/api/data?drilldowns=State&measures=Total%20Population&Year=2017&soc=291141",
                        groupBy: "ID State",
                        label: d => d.State,
                        projection:
                          typeof window !== "undefined"
                            ? window.albersUsaPr()
                            : "geoMercator",
                        tooltipConfig: {
                          tbody: [
                            ["Year", d => d.Year],
                            [
                              "Registered Nurses",
                              d => formatAbbreviate(d["Total Population"])
                            ],
                            [
                              "Per 1,000 Population",
                              d => formatAbbreviate(d["Total Population PC"])
                            ]
                          ]
                        },
                        topojson: "/topojson/State.json"
                      })}
                      dataFormat={resp => {
                        const data = resp.data;
                        data.forEach(d => {
                          d["Total Population PC"] =
                            d["Total Population"] / pops[d["ID State"]] *
                            1000;
                        });
                        return data;
                      }}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <SourceGroup sources={[pums1Source]} />
              </div>

              <div className="topic Column">
                <div className="topic-content">
                  <h3 id="risks-uninsured" className="topic-title">
                    <AnchorLink to="risks-uninsured" className="anchor">
                      Uninsured Population by State
                    </AnchorLink>
                  </h3>
                </div>
                <div className="visualization topic-visualization">
                  {beds.length
                    ? <Geomap
                      className="d3plus"
                      config={assign({}, mapConfig, {
                        colorScale: "Uninsured Percentage",
                        colorScaleConfig: {
                          axisConfig: {
                            tickFormat: d => `${formatAbbreviate(d * 100)}%`
                          }
                        },
                        data:
                          "/api/data?measures=Uninsured%20Percentage&drilldowns=State&Year=latest",
                        groupBy: "ID State",
                        label: d => d.State,
                        projection:
                          typeof window !== "undefined"
                            ? window.albersUsaPr()
                            : "geoMercator",
                        tooltipConfig: {
                          tbody: [
                            ["Year", d => d.Year],
                            [
                              "Uninsured",
                              d =>
                                `${formatAbbreviate(
                                  d["Uninsured Percentage"] * 100
                                )}%`
                            ]
                          ]
                        },
                        topojson: "/topojson/State.json"
                      })}
                      dataFormat={resp => resp.data}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      visual={<Spinner />}
                    />
                  }
                </div>
                <SourceGroup sources={[acs1Source]} />
              </div>
            </div>
          </div>

          {/** FAQs */}
          <div className="Section coronavirus-section">
            <h2 className="section-title">
              <AnchorLink to="faqs" id="faqs" className="anchor">
                FAQs
              </AnchorLink>
            </h2>
            <div className="section-topics">
              <div className="topic TextViz text-only">
                <div className="topic-content">
                  <h3 id="faqs-growth" className="topic-title">
                    <AnchorLink to="faqs-growth" className="anchor">
                      Exponential Growth &amp; Logarithmic Scales
                    </AnchorLink>
                  </h3>
                  <div className="topic-descriptions">
                    <div className="topic-description">
                      <p>
                        What is exponential growth? And how does it relate to
                        the use of logarithmic scales?
                      </p>
                      <p>
                        At the beginning of an epidemic, epidemic growth
                        exponentially. Exponential growth is growth that happens
                        by multiplying rather than adding.
                      </p>
                      <p>
                        Compare linear growth that adds 10 at each time step
                        with exponential growth that multiplies by 2.
                      </p>
                      <p>
                        A linear growth sequence that adds 10 at each time step
                        looks like:
                      </p>
                      <pre>
                        <code>0, 10, 20, 30, 40, 50, 60, 70, 80, 100…</code>
                      </pre>
                      <p>
                        Whereas exponential sequence that multiplies by 2 at
                        each time step looks like:
                      </p>
                      <pre>
                        <code>
                          1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024....
                        </code>
                      </pre>
                      <p>
                        At the beginning, linear growth seems faster (20 is much
                        larger than 4), but linear growth does not accelerate.
                        It adds the same amount every time. Exponential growth
                        accelerates, adding more at each time step, so it can
                        grow suddenly.
                      </p>
                      <p>
                        After 10 steps, linear (+10) growth brings us to 100.
                        Exponential (x2) growth brings us to (1,024). After 20
                        steps, linear growth only brings us to 200. Exponential
                        growth to more than 1 million!
                      </p>
                      <p>
                        Exponential growth is so fast that to appreciate it
                        better we need to use logarithmic scales. These are
                        scales that also grow by multiples. For example, a
                        logarithmic scale between 1 and 1,000,000 goes from 1 to
                        10, from 10 to 100, from 100 to 1,000, from 1,000 to
                        10,000, from 10,000 to 100,000, and from 100,000 to
                        1,000,000. This is a logarithmic scale in base 10,
                        because we are multiplying by ten each time. What this
                        scale shows is that, in exponential growth, 1,000 is
                        halfway to 1,000,000. That’s why it is important to stop
                        exponential growth even if the numbers look small. The
                        same number of steps that bring you from 1 to 1,000
                        bring you from 1,000 to 1,000,000.
                      </p>
                      <p>
                        Strictly speaking, epidemic processes are only
                        exponential early on, when the number of cases is small
                        compared to the size of the population or other limiting
                        factors. Eventually, growth peters out, either because
                        spreading became widespread, or because other factors,
                        such as physical distancing, or immunization, reduces
                        the speed of the spreading. To learn more about the
                        basic functional forms of epidemic spreading, watch{" "}
                        <a
                          href="https://www.youtube.com/watch?v=Kas0tIxDvrg"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          this
                        </a>{" "}
                        video prepared by the CDC.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="topic TextViz text-only">
                <div className="topic-content">
                  <h3 id="faqs-growth" className="topic-title">
                    <AnchorLink to="faqs-growth" className="anchor">
                      Disclaimer
                    </AnchorLink>
                  </h3>
                  <div className="topic-descriptions">
                    <div className="topic-description">
                      <p>
                        Information on this site is provided on an &ldquo;as
                        is&rdquo; and &ldquo;as available&rdquo; basis. Data USA
                        makes every effort to ensure, but does not guarantee,
                        the accuracy or completeness of the information on the
                        Data USA website. This site is for informational
                        purposes and is not intended provide advice or aid in
                        decision making. Our goal is to keep this information
                        timely. If errors are brought to our attention, we will
                        try to correct them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Coronavirus.contextTypes = {
  formatters: PropTypes.object
};

export default connect(
  null,
  dispatch => ({
    updateTitle: title => dispatch(updateTitle(title))
  })
)(Coronavirus);
