import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import axios from "axios";
import {NonIdealState, Slider, Spinner, Button} from "@blueprintjs/core";
import {Helmet} from "react-helmet";
import {AnchorLink} from "@datawheel/canon-core";

import {countries} from "countries-list";

import styles from "style.yml";

const world = {"Afghanistan": 35530081, "Albania": 2873457, "Algeria": 41318142, "American Samoa": 55641, "Andorra": 76965, "Angola": 29784193, "Antigua and Barbuda": 102012, "Argentina": 44271041, "Armenia": 2930450, "Aruba": 105264, "Australia": 24598933, "Austria": 8809212, "Azerbaijan": 9862429, "Bahamas": 395361, "Bahrain": 1492584, "Bangladesh": 164669751, "Barbados": 285719, "Belarus": 9507875, "Belgium": 11372068, "Belize": 374681, "Benin": 11175692, "Bermuda": 65441, "Bhutan": 807610, "Bolivia": 11051600, "Bosnia and Herzegovina": 3507017, "Botswana": 2291661, "Brazil": 209288278, "British Virgin Islands": 31196, "Brunei": 428697, "Bulgaria": 7075991, "Burkina Faso": 19193382, "Burma": 53370609, "Burundi": 10864245, "Cambodia": 16005373, "Cameroon": 24053727, "Canada": 36708083, "Cape Verde": 546388, "Caribbean": 7284294, "Cayman Islands": 61559, "Central African Republic": 4659080, "Chad": 14899994, "Channel Islands": 165314, "Chile": 18054726, "China": 1386395000, "Colombia": 49065615, "Comoros": 813912, "Costa Rica": 4905769, "Cote d'Ivoire": 24294750, "Croatia": 4125700, "Cuba": 11484636, "Curaçao": 161014, "Cyprus": 1179551, "Czechia": 10591323, "Democratic Republic of the Congo": 81339988, "Denmark": 5769603, "Djibouti": 956985, "Dominica": 73925, "Dominican Republic": 10766998, "Ecuador": 16624858, "Egypt": 97553151, "El Salvador": 6377853, "Equatorial Guinea": 1267689, "Estonia": 1315480, "Eswatini": 1367254, "Ethiopia": 104957438, "Faroe Islands": 49290, "Fiji": 905502, "Finland": 5511303, "France": 67118648, "French Polynesia": 283007, "Gabon": 2025137, "Gambia": 2100568, "Georgia": 3717100, "Germany": 82695000, "Ghana": 28833629, "Gibraltar": 34571, "Greece": 10760421, "Greenland": 56171, "Grenada": 107825, "Guam": 164229, "Guatemala": 16913503, "Guinea-Bissau": 1861283, "Guinea": 12717176, "Guyana": 777859, "Haiti": 10981229, "Honduras": 9265067, "Hong Kong": 7391700, "Hungary": 9781127, "Iceland": 341284, "India": 1339180127, "Indonesia": 263991379, "Iran": 81162788, "Iraq": 38274618, "Ireland": 4813608, "Isle of Man": 84287, "Israel": 8712400, "Italy": 60551416, "Jamaica": 2890299, "Japan": 126785797, "Jordan": 9702353, "Kazakhstan": 18037646, "Kenya": 49699862, "Kiribati": 116398, "Kosovo": 1830700, "Kuwait": 4136528, "Kyrgyzstan": 6201500, "Laos": 6858160, "Latvia": 1940740, "Lebanon": 6082357, "Lesotho": 2233339, "Liberia": 4731906, "Libya": 6374616, "Liechtenstein": 37922, "Lithuania": 2827721, "Luxembourg": 599449, "Macau": 622567, "Madagascar": 25570895, "Malawi": 18622104, "Malaysia": 31624264, "Maldives": 436330, "Mali": 18541980, "Malta": 465292, "Marshall Islands": 53127, "Mauritania": 4420184, "Mauritius": 1264613, "Mexico": 129163276, "Micronesia": 105544, "Moldova": 3549750, "Monaco": 38695, "Mongolia": 3075647, "Montenegro": 622471, "Morocco": 35739580, "Mozambique": 29668834, "Namibia": 2533794, "Nauru": 13649, "Nepal": 29304998, "Netherlands": 17132854, "New Caledonia": 280460, "New Zealand": 4793900, "Nicaragua": 6217581, "Niger": 21477348, "Nigeria": 190886311, "North Korea": 25490965, "North Macedonia": 2083160, "Northern Mariana Islands": 55144, "Norway": 5282223, "Oman": 4636262, "Pakistan": 197015955, "Palau": 21729, "Palestine": 4684777, "Panama": 4098587, "Papua New Guinea": 8251162, "Paraguay": 6811297, "Peru": 32165485, "Philippines": 104918090, "Poland": 37975841, "Portugal": 10293718, "Puerto Rico": 3337177, "Qatar": 2639211, "Republic of the Congo": 5260750, "Romania": 19586539, "Russia": 144495044, "Rwanda": 12208407, "Saint Kitts and Nevis": 55345, "Saint Lucia": 178844, "Saint Martin": 73234, "Saint Vincent and the Grenadines": 109897, "Samoa": 196440, "San Marino": 33400, "Sao Tome and Principe": 204327, "Saudi Arabia": 32938213, "Senegal": 15850567, "Serbia": 7022268, "Seychelles": 95843, "Sierra Leone": 7557212, "Singapore": 5612253, "Slovakia": 5439892, "Slovenia": 2066748, "Solomon Islands": 611343, "Somalia": 14742523, "South Africa": 56717156, "South Korea": 51466201, "South Sudan": 12575714, "Spain": 46572028, "Sri Lanka": 21444000, "Sudan": 40533330, "Suriname": 563402, "Sweden": 10067744, "Switzerland": 8466017, "Syria": 18269868, "Tajikistan": 8921343, "Tanzania": 57310019, "Thailand": 69037513, "Timor-Leste": 1296311, "Togo": 7797694, "Tonga": 108020, "Trinidad and Tobago": 1369125, "Tunisia": 11532127, "Turkey": 80745020, "Turkmenistan": 5758075, "Turks and Caicos Islands": 35446, "Tuvalu": 11192, "Uganda": 42862958, "Ukraine": 44831159, "United Arab Emirates": 9400145, "United Kingdom": 66022273, "United States": 325719178, "Uruguay": 3456750, "Uzbekistan": 32387200, "Vanuatu": 276244, "Venezuela": 31977065, "Vietnam": 95540800, "Virgin Islands": 107268, "Yemen": 28250420, "Zambia": 17094130, "Zimbabwe": 16529904};
const stateAbbreviations = {"Arizona": "AZ", "Alabama": "AL", "Alaska": "AK", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Guam": "GU", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Puerto Rico": "PR", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "U.S. Virgin Islands": "VI", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"};
const countryMeta = Object.keys(countries).reduce((obj, key) => {
  const d = countries[key];
  d.iso = key;
  obj[d.name] = d;
  return obj;
}, {});

import {extent, max, min, mean, merge, sum} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
import {format} from "d3-format";
const commas = format(",");

const suffixes = ["th", "st", "nd", "rd"];

/** */
function suffix(number) {
  const tail = number % 100;
  return suffixes[(tail < 11 || tail > 13) && tail % 10] || suffixes[0];
}
const d3DayFormat = timeFormat("%A, %B %d");

const dayFormat = d => d3DayFormat(d).replace(/[0-9]{2}$/, m => {
  const n = parseFloat(m, 10);
  return `${n}${suffix(n)}`;
});

const d3WeekFormat = timeFormat("%B %d, %Y");

const weekFormat = d => d3WeekFormat(d).replace(/\s[0-9]{2}\,/, m => {
  const n = parseFloat(m, 10);
  return ` ${n}${suffix(n)},`;
});
const yearFormat = timeFormat("%Y");

import {colorLegible} from "d3plus-color";
import {assign, unique} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";
import {Geomap, LinePlot} from "d3plus-react";

import {divisions, stateToDivision} from "helpers/stateDivisions";
import colors from "../../static/data/colors.json";
import {updateTitle} from "actions/title";

import SectionIcon from "toCanon/SectionIcon";
import SourceGroup from "toCanon/components/SourceGroup";

import "./Coronavirus.css";

const ctSource = {
  dataset_link: "https://docs.google.com/spreadsheets/u/2/d/e/2PACX-1vRwAqp96T9sYYq2-i7Tj0pvTf6XVHjDSMIKBdZHXiCGGdNC0ypEU9NbngS8mxea55JuCFuua1MUeOj5/pubhtml",
  dataset_name: "Coronavirus numbers by state",
  source_link: "https://covidtracking.com/",
  source_name: "The COVID Tracking Project"
};

const jhSource = {
  dataset_link: "https://github.com/CSSEGISandData/COVID-19",
  dataset_name: "2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository",
  source_link: "https://systems.jhu.edu/",
  source_name: "Johns Hopkins CSSE"
};

const kfSource = {
  dataset_link: "https://www.kff.org/other/state-indicator/beds-by-ownership/?currentTimeframe=0&selectedDistributions=total&selectedRows=%7B%22states%22:%7B%22all%22:%7B%7D%7D,%22wrapups%22:%7B%22united-states%22:%7B%7D%7D%7D&sortModel=%7B%22colId%22:%22Location%22,%22sort%22:%22asc%22%7D",
  dataset_name: "State Health Facts",
  source_link: "https://www.kff.org/",
  source_name: "Kaiser Family Foundation"
};

const dolSource = {
  dataset_link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?output=csv",
  dataset_name: "Unemployment insurance weekly claims by state",
  source_link: "https://oui.doleta.gov/unemploy/claims.asp",
  source_name: "DOL Unemployment Insurance Weekly Claims Data"
};

// const aaSource = {
//   dataset_link: "https://array-architects.com/press-release/array-advisors-model-validates-fears-of-icu-bed-shortage-due-to-coronavirus-pandemic/",
//   dataset_name: "ICU Bed Shortage",
//   source_link: "https://array-architects.com/",
//   source_name: "Array Architects"
// };

const pums1Source = {
  source_name: "Census Bureau",
  source_description: "The American Community Survey (ACS) Public Use Microdata Sample (PUMS) files are a set of untabulated records about individual people or housing units. The Census Bureau produces the PUMS files so that data users can create custom tables that are not available through pretabulated (or summary) ACS data products.",
  dataset_name: "ACS PUMS 1-Year Estimate",
  dataset_link: "https://census.gov/programs-surveys/acs/technical-documentation/pums.html",
  subtopic: "Demographics",
  table_id: "PUMS",
  topic: "Diversity",
  hidden_measures: "ygbpop RCA,ygopop RCA,ygipop RCA,yocpop RCA,yiopop RCA,ycbpop RCA"
};

const acs1Source = {
  source_name: "Census Bureau",
  source_description: "Census Bureau conducts surveys of the United States Population, including the American Community Survey",
  dataset_name: "ACS 1-year Estimate",
  dataset_link: "http://www.census.gov/programs-surveys/acs/",
  table_id: "S2701,S2703,S2704",
  topic: "Health",
  subtopic: "Access and Quality"
};

const wbSource = {
  dataset_link: "https://datacatalog.worldbank.org/dataset/world-development-indicators",
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

const labelWidth = 80;

/** */
function calculateDomain(data, w) {
  if (data && data instanceof Array && data.length) {
    const dataDomain = unique(data.map(d => d.Date)).sort((a, b) => a - b);
    const domain = dataDomain.slice();
    let lastDate = domain[domain.length - 1];
    const labelSpace = w <= 768 ? 0 : 0.15;
    const endDate = lastDate + (lastDate - domain[0]) * labelSpace;
    lastDate = new Date(lastDate);
    while (domain[domain.length - 1] < endDate) {
      lastDate.setDate(lastDate.getDate() + 1);
      domain.push(lastDate.getTime());
    }
    const space = (w <= 768 ? w : w - 300 - 350) - 100 - 60;
    const step = Math.ceil(domain.length / (space / labelWidth));
    while (domain.length % step) {
      lastDate.setDate(lastDate.getDate() + 1);
      domain.push(lastDate.getTime());
    }
    const labels = domain.filter((d, i) => i % step === 0);
    return [domain, labels];
  }
  return [[], []];
}

/** */
function calculateDayDomain(data, w) {
  if (data && data instanceof Array && data.length) {
    const dataDomain = unique(data.map(d => d.Days)).sort((a, b) => a - b);
    const domain = dataDomain.slice();
    let lastDate = domain[domain.length - 1];
    const labelSpace = w <= 768 ? 0.1 : 0.1;
    const endDate = lastDate + (lastDate - domain[0]) * labelSpace;
    while (domain[domain.length - 1] < endDate) {
      lastDate++;
      domain.push(lastDate);
    }
    const space = (w <= 768 ? w : w - 300) - 100 - 60;
    const step = Math.ceil(domain.length / (space / labelWidth));
    while (domain.length % step) {
      lastDate++;
      domain.push(lastDate);
    }
    const labels = domain.filter((d, i) => i % step === 0);
    return [domain, labels];
  }
  return [[], []];
}

/** */
function calculateWeekDomain(data, w) {
  if (data && data instanceof Array && data.length) {
    const dataDomain = unique(data.map(d => d.Date)).sort((a, b) => a - b);
    const domain = dataDomain.slice();
    let lastDate = domain[domain.length - 1];
    const labelSpace = w <= 768 ? 0 : 0.15;
    const endDate = lastDate + (lastDate - domain[0]) * labelSpace;
    lastDate = new Date(lastDate);
    while (domain[domain.length - 1] < endDate) {
      lastDate.setDate(lastDate.getDate() + 7);
      domain.push(lastDate.getTime());
    }
    const labels = domain.reduce((arr, d) => {
      const lastYear = new Date(arr[arr.length - 1]).getFullYear();
      const currentYear = new Date(d).getFullYear();
      if (!arr.length || lastYear !== currentYear) arr.push(d);
      return arr;
    }, []);
    return [domain, labels];
  }
  return [[], []];
}

/** */
function SectionTitle(props) {
  const {slug, title} = props;
  return <h2 className="section-title">
    <AnchorLink to={slug} id={slug} className="anchor">
      {title}
    </AnchorLink>
  </h2>;
}

/** */
function TopicTitle(props) {
  const {slug, title} = props;
  return <h3 id={slug} className="topic-title">
    <AnchorLink to={slug} className="anchor">{title}</AnchorLink>
  </h3>;
}

/** */
function calculateAnnotations(data, measure, scale) {
  if (!data.length) return undefined;
  const yDomain = extent(data, d => d[measure]);
  const xDomain = extent(data, d => d.Days);

  const lineData = [];
  const factors = scale === "log" ? [1, 2, 3, 4, 7] : [1, 2, 3, 4];
  factors.forEach(factor => {
    const first = {
      id: factor,
      x: xDomain[0],
      y: yDomain[0]
    };
    lineData.push(first);
    let Days = first.x;
    let value = first.y;
    while (value * 2 < yDomain[1] && Days + factor < xDomain[1]) {
      value *= 2;
      Days += factor;
      lineData.push({
        id: factor,
        x: Days,
        y: value
      });
    }
  });

  const color = "#ccc";
  const labelColor = "#aaa";

  return [
    {
      curve: "monotoneX",
      data: lineData,
      label: d => `Doubling Every ${d.id === 1 ? "Day" : `${d.id} Days`}`,
      labelBounds: (d, i, s) => {
        const [firstX, firstY] = s.points[0];
        const [lastX, lastY] = s.points[s.points.length - 1];
        const height = 30;
        return   {
          x: lastX - firstX + 5,
          y: lastY - firstY - height / 2 + 1,
          width: 200,
          height
        };
      },
      labelConfig: {
        fontColor: () => labelColor,
        fontFamily: () => ["Source Sans Pro", "sans-serif"],
        fontSize: () => 12,
        padding: 0,
        verticalAlign: "middle"
      },
      shape: "Line",
      stroke: color,
      // strokeDasharray: "5",
      strokeWidth: 1
    }
  ];
}

class Coronavirus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      beds: [],
      countryCutoffData: [],
      countryCutoffDeathData: [],
      countryData: [],
      currentStates: [],
      currentStatesHash: {},
      cutoff: 10,
      countries: false,
      data: false,
      employmentData: [],
      stateTestData: [],
      date: false,
      icu: [],
      level: "state",
      pops: [],
      scale: "log",
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

    axios.all([
      axios.get("/api/covid19/states"),
      axios.get("/api/covid19/country"),
      axios.get("/api/covid19/old/state"),
      axios.get("/api/covid19/employment/latest/")
    ]).then(axios.spread((...resp) => {

      const stateTestData = resp[0].data;
      stateTestData.forEach(d => {
        const dID = stateToDivision[d["ID Geography"]];
        let division = divisions.find(x => x["ID Division"] === dID);
        if (!division) division = divisions.find(x => x["ID Region"] === 5);
        d.Date = new Date(d.Date).getTime();
        d = Object.assign(d, division);
      });
      stateTestData.sort((a, b) => a.Date - b.Date);

      const countryCases = resp[1].data.map(d => {
        const pop = world[d.Geography];
        d["ID Geography"] = countryMeta[d.Geography] ? countryMeta[d.Geography].iso : d.Geography;
        d.Date = new Date(d.Date).getTime();
        d.ConfirmedPC = d.Confirmed / pop * 100000;
        d.RecoveredPC = d.Recovered / pop * 100000;
        d.DeathsPC = d.Deaths / pop * 100000;
        const division = divisions.find(x => x["ID Region"] === 6);
        return Object.assign(d, division);
      });

      const data = resp[2].data;
      const icuData = data.icu
        .map(d => {
          d.TotalPC = d.Total / data.population[d["ID Geography"]] * 1000;
          return d;
        });

      const cutoffDate = new Date("2007/01/01").getTime();

      const employmentData = resp[3].data.data
        .map(d => ({
          ...d,
          ...divisions.find(x => x["ID Division"] === stateToDivision[d.fips_code]),
          "ID Geography": d.fips_code,
          "Geography": d.state_name,
          "Date": new Date(d.week_ended.replace(/\-/g, "/")).getTime()
        }))
        .filter(d => d.Date > cutoffDate);

      this.setState({
        beds: data.beds,
        countryCases,
        icu: icuData,
        pops: data.population,
        stateTestData,
        employmentData
      }, this.prepData.bind(this));

    }))
      .catch(() => this.setState({data: "Error loading data, please try again later."}));
  }

  changeCutoff(value) {
    this.setState({cutoff: value}, this.prepData.bind(this));
  }

  changeScale(event) {
    this.setState({scale: event.target.value});
  }

  prepData() {
    const {stateTestData, countryCases, cutoff} = this.state;

    const stateCutoffData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(stateTestData)
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d) => {
            if (d.Confirmed >= cutoff) {
              days++;
              d.Days = days;
              arr.push(d);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d.Confirmed) - max(a, d => d.Confirmed)));

    const chinaCutoff = new Date("2020/02/17").getTime();
    const countryData = countryCases
      .filter(d => {
        if (d.Geography === "China") {
          return d.Date <= chinaCutoff;
        }
        return true;
      });

    const countryCutoffData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(countryData.concat(stateTestData))
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d) => {
            if (d.Confirmed > 50) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d.Confirmed) - max(a, d => d.Confirmed)));

    const countryCutoffDeathData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(countryData.concat(stateTestData))
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d) => {
            if (d.Deaths > 10) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d.Deaths) - max(a, d => d.Deaths)));

    this.setState({stateCutoffData, countryCutoffData, countryCutoffDeathData, countryData});

  }

  render() {

    const {
      beds,
      countryCutoffData,
      countryCutoffDeathData,
      cutoff,
      currentStates,
      currentStatesHash,
      employmentData,
      stateTestData,
      // measure,
      // icu,
      pops,
      scale,
      stateCutoffData,
      title
    } = this.state;

    const stateFilter = d => currentStates.length > 0 ? currentStatesHash[d["ID Geography"]] || d.Region === "International" : true;
    const stateTestDataFiltered = stateTestData.filter(stateFilter);
    const stateCutoffDataFiltered = stateCutoffData.filter(stateFilter);
    const countryCutoffDataFiltered = countryCutoffData.filter(stateFilter);
    const countryCutoffDeathDataFiltered = countryCutoffDeathData.filter(stateFilter);

    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const smallLabels = w < 768;
    const now = new Date();

    const dateFormat = d => timeFormat("%B %d")(d).replace(/\s[0-9]{2}\,/, m => {
      const n = parseFloat(m, 10);
      return ` ${n}${suffix(n)},`;
    });
    const daysFormat = d => `${commas(d)} day${d !== 1 ? "s" : ""}`;

    // const stateGrowthData = stateData.filter(d => d.ConfirmedGrowth !== undefined);
    // const stateSmoothData = stateData.filter(d => d.ConfirmedSmooth !== undefined);
    // const minValueGrowth = min(stateGrowthData, d => d.ConfirmedGrowth);
    // const minValueSmooth = min(stateSmoothData, d => d.ConfirmedSmooth);

    // const [stateDomain, stateLabels] = calculateDomain(stateData, w);
    const [stateNewDomain, stateNewLabels] = calculateDomain(stateTestData, w);
    // const [stateGrowthDomain, stateGrowthLabels] = calculateDomain(stateGrowthData, w);
    // const [stateSmoothDomain, stateSmoothLabels] = calculateDomain(stateSmoothData, w);

    const [stateCutoffDomain, stateCutoffLabels] = calculateDayDomain(stateCutoffData, w);
    const stateCutoffAnnotations = calculateAnnotations(stateCutoffData, "Confirmed", scale);
    const [countryCutoffDomain, countryCutoffLabels] = calculateDayDomain(countryCutoffData, w);
    const countryCutoffAnnotations = calculateAnnotations(countryCutoffData, "ConfirmedPC", scale);
    const [countryCutoffDeathDomain, countryCutoffDeathLabels] = calculateDayDomain(countryCutoffDeathData, w);
    const countryCutoffDeathAnnotations = calculateAnnotations(countryCutoffDeathData, "DeathsPC", scale);

    const scaleLabel = scale === "log" ? "Logarithmic" : "Linear";
    const [stateDeathDomain, stateDeathLabels] = calculateDomain(stateTestData.filter(d => d.Deaths), w);
    const [hospitalizedDomain, hospitalizedLabels] = calculateDomain(stateTestData.filter(d => d.hospitalized), w);
    const [totalTestsDomain, totalTestsLabels] = calculateDomain(stateTestData.filter(d => d.total), w);
    // const [positiveRateDomain, positiveRateLabels] = calculateDomain(stateTestData.filter(d => d.ConfirmedPC), w);

    const lineColor = d =>
      currentStates.length === 0 || currentStates.length > 5
        ? colors.Region[d["ID Region"]]
        : colors.Region[currentStates.indexOf(currentStates.find(s => s["ID Geography"] === d["ID Geography"])) + 1];

    const sharedConfig = {
      aggs: {
        "ID Division": arr => arr[0],
        "ID Region": arr => arr[0]
      },
      discrete: "x",
      groupBy: ["ID Region", "ID Geography"],
      height: 500,
      label: d => d.Geography instanceof Array ? d.Region : d["ID Region"] === 6 ? `${countryMeta[d.Geography] ? countryMeta[d.Geography].emoji : ""}${d.Geography}` : d.Geography,
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
          if (d["ID Geography"] instanceof Array) this.hover(h => (h.data || h)["ID Region"] === d["ID Region"]);
          else this.hover(h => h["ID Geography"] === d["ID Geography"]);
        }
      },
      shapeConfig: {
        hoverOpacity: 0.25,
        Line: {
          label: d =>
            smallLabels
              ? stateAbbreviations[d.Geography] || (countryMeta[d.Geography] ? countryMeta[d.Geography].iso : d.Geography)
              : d.Geography,
          labelConfig: {
            fontColor: d => colorLegible(lineColor(d)),
            fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
            fontSize: () => 12,
            padding: 0,
            verticalAlign: "middle"
          },
          labelBounds: (d, i, s) => {
            const yExtent = extent(s.points.map(p => p[1]));
            if (yExtent[1] - yExtent[0] > 5) {
              const [firstX, firstY] = s.points[0];
              const [lastX, lastY] = s.points[s.points.length - 1];
              const height = 30;
              return   {
                x: lastX - firstX + 5,
                y: lastY - firstY - height / 2 + 1,
                width: 200,
                height
              };
            }
            return false;
          },
          sort: a => a["ID Region"] !== 6 ? 1 : -1,
          stroke: lineColor,
          strokeWidth: 2
        }
      },
      tooltipConfig: {
        tbody: d => {
          const arr = [
            ["Date", dateFormat(new Date(d.Date))]
          ];
          if (d.Confirmed !== undefined) arr.push(["Total Cases", commas(d.Confirmed)]);
          if (d.ConfirmedGrowth !== undefined) arr.push(["New Cases", commas(d.ConfirmedGrowth)]);
          if (d.ConfirmedPC !== undefined) arr.push(["Cases per 100,000", formatAbbreviate(d.ConfirmedPC)]);
          // if (d.ConfirmedGrowth) arr.push(["Growth Factor", formatAbbreviate(d.ConfirmedGrowth)]);
          if (d.initial_claims !== undefined) arr.push(["Initial Claims", formatAbbreviate(d.initial_claims)]);
          return arr;
        }
      },
      titleConfig: {
        fontSize: 21
      },
      xConfig: {
        gridConfig: {"stroke-width": 0},
        shapeConfig: {
          labelConfig: {
            fontOpacity: d => d.id < 10000 || new Date(d.id) <= now ? 1 : 0.5
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
      colorScaleMaxSize: 250,
      zoom: false,
      time: "Date",
      timeline: false,

      /*
      timelineConfig: {
        on: {
          // end: d => console.log(dayFormat(d))
        },
        buttonBehavior: "auto",
        shapeConfig: {
          stroke: styles.dark,
          strokeOpacity: .5,
          strokeWidth: 1
        }
      },
      */
      groupBy: "ID Geography",
      label: d => d.Geography,
      shapeConfig: {
        Path: {
          stroke: d => currentStatesHash[d["ID Geography"]] ? styles.red : styles.dark,
          strokeWidth: d => currentStatesHash[d["ID Geography"]] ? 3 : 1,
          strokeOpacity: d => currentStatesHash[d["ID Geography"]] ? .75 : .25
        }
      },
      projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
      titleConfig: {
        fontSize: 21
      },
      tooltipConfig: Object.assign({}, sharedConfig.tooltipConfig, {
        footer: d => `Click to ${!currentStatesHash[d["ID Geography"]] ? `select ${d.Geography}` : "clear state selection"}`
      }),
      on: {
        click: d => {
          if (currentStatesHash[d["ID Geography"]]) {
            const newCurrentStates = currentStates.filter(o => o["ID Geography"] !== d["ID Geography"]);
            const newCurrentStatesHash = newCurrentStates.reduce((acc, d) => ({[d["ID Geography"]]: true, ...acc}), {});
            this.setState({
              currentStates: newCurrentStates,
              currentStatesHash: newCurrentStatesHash
            });
          }
          else {
            const newCurrentStates = currentStates.concat(d);
            const newCurrentStatesHash = newCurrentStates.reduce((acc, d) => ({[d["ID Geography"]]: true, ...acc}), {});
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
        if (d.DeathsPC !== undefined) arr.push(["Deaths per 100,000", formatAbbreviate(d.DeathsPC)]);
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
          ["initial_claims", "continued_claims", "covered_employment"].forEach(key => {
            d[key] = sum(group.values, d => d[key]);
          });
          return d;
        });

    const latestEmployment = max(employmentDataFiltered, d => d.Date);
    // const latestEmploymentPublish = new Date(latestEmployment);
    // latestEmploymentPublish.setDate(latestEmploymentPublish.getDate() + 5);
    const latestEmploymentData = employmentData.filter(d => d.Date === latestEmployment);
    const [employmentDataDomain, employmentDataLabels] = calculateWeekDomain(employmentDataFiltered, w);
    const employmentDataLabelsFiltered = employmentDataLabels.filter(d => d <= new Date().getTime());
    const employmentStat = sum(employmentDataFiltered.filter(d => d.Date === latestEmployment), d => d.initial_claims);
    // const employmentDataMax = max(employmentDataFiltered, d => d.initial_claims);

    // const StateCutoff = () =>
    //   <div className="topic-subtitle">
    //     Only showing states with more than 50 confirmed cases.
    //   </div>;

    const AxisToggle = () =>
      <div>
        {currentStates.length > 0 &&
          <Button
            className="pt-fill"
            iconName="cross"
            onClick={() => this.setState({currentStates: [], currentStatesHash: {}})}
          >
            {`Click to Clear State Selection${currentStates.length > 1 ? "s" : ""}`}
          </Button>
        }
        <label className="pt-label pt-inline">
        Y-Axis Scale
          <div className="pt-select">
            <select value={scale} onChange={this.changeScale.bind(this)}>
              <option value="linear">Linear</option>
              <option value="log">Logarithmic</option>
            </select>
          </div>
        </label>
        <div className="SourceGroup">
          For more information about the difference between linear and logarithmic scale, <AnchorLink to="faqs-growth">click here</AnchorLink>.
        </div>
      </div>;

    const CutoffToggle = () =>
      <div className="cutoff-slider">
        <UncontrolledSlider
          initialValue={cutoff}
          min={0}
          max={100}
          labelStepSize={10}
          onRelease={this.changeCutoff.bind(this)}
        />
      </div>;

    const tooltipConfigTracker = {
      tbody: d => {
        const arr = [
          ["Date", dateFormat(d.Date)],
          ["Total Tests", commas(d.total)],
          ["Tests yielding positive results", commas(d.Positive)],
          ["Tests yielding negative results", commas(d.Negative)],
          ["Percentage of tests yielding positive results", `${formatAbbreviate(d.PositivePC * 100)}%`]
        ];
        if (d.hospitalized) arr.push(["Hospitalized patients", commas(d.hospitalized)]);

        return arr;
      }
    };

    // stats helpers
    const today = max(stateTestData, d => d.Date);
    const latest = stateTestData.filter(d => d.Date === today);
    const show = stateTestData.length > 0;
    const {list} = this.context.formatters;

    // top-level stats
    const stats = {};
    const totalCases = sum(latest, d => d.Confirmed);
    stats.totalCases = commas(totalCases);
    const totalPopulation = sum(latest, d => d.Population);
    stats.totalPC = formatAbbreviate(totalCases / totalPopulation * 100000);
    const totalDeaths = sum(latest, d => d.Deaths);
    stats.totalDeaths = commas(totalDeaths);
    stats.totalDeathsPC = formatAbbreviate(totalDeaths / totalPopulation * 100000);
    stats.totalHospitalizations = commas(sum(latest, d => d.hospitalized));
    const totalTests = sum(latest, d => d.total);
    stats.totalTests = commas(totalTests);
    const totalPositive = sum(latest, d => d.Positive);
    stats.totalPositivePercent = `${formatAbbreviate(totalPositive / totalTests * 100)}% Tested Positive`;

    // topic stats
    const topicStats = {};
    const latestFiltered = latest.filter(d => currentStates.length > 0 ? currentStatesHash[d["ID Geography"]] : true);
    const totalCasesFiltered = sum(latestFiltered, d => d.Confirmed);
    topicStats.totalCases = commas(totalCasesFiltered);
    const totalPopulationFiltered = sum(latestFiltered, d => d.Population);
    topicStats.totalPC = formatAbbreviate(totalCasesFiltered / totalPopulationFiltered * 100000);
    const totalDeathsFiltered = sum(latestFiltered, d => d.Deaths);
    topicStats.totalDeaths = commas(totalDeathsFiltered);
    topicStats.totalDeathsPC = formatAbbreviate(totalDeathsFiltered / totalPopulationFiltered * 100000);
    topicStats.totalHospitalizations = commas(sum(latestFiltered, d => d.hospitalized));
    const totalTestsFiltered = sum(latestFiltered, d => d.total);
    topicStats.totalTests = commas(totalTestsFiltered);
    const totalPositiveFiltered = sum(latestFiltered, d => d.Positive);
    topicStats.totalPositivePercent = `${formatAbbreviate(totalPositiveFiltered / totalTestsFiltered * 100)}%`;

    return <div id="Coronavirus">

      <Helmet title={title}>
        <meta property="og:title" content={ `${title} | Data USA` } />
      </Helmet>

      <div id="Splash" className="splash-coronavirus">
        {/* <div className="image-container">
          <div className="image" style={{backgroundImage: "url('')"}}></div>
        </div> */}
        <div className="content-container">
          <h1 className="profile-title">{title}</h1>
        </div>
        <div className="content-container">
          {today && <div className="profile-subtitle">
            Latest Data from {dayFormat(today)}.
          </div>}
        </div>
        <div className="content-container sponsors">
          <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
            <img id="deloitte" src="/images/home/logos/deloitte.png" />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
            <img id="datawheel" src="/images/home/logos/datawheel.png" />
          </a>
        </div>
        <div className="content-container">
          <div className="profile-stats">
            <div className="Stat large-text">
              <div className="stat-title">Total Cases</div>
              <div className="stat-value">{show ? stats.totalCases : <Spinner />}</div>
              <div className="stat-subtitle">in the USA</div>
            </div>
            <div className="Stat large-text">
              <div className="stat-title">Total Deaths</div>
              <div className="stat-value">{show ? stats.totalDeaths : <Spinner />}</div>
              <div className="stat-subtitle">in the USA</div>
            </div>
            <div className="Stat large-text">
              <div className="stat-title">Total Hospitalizations</div>
              <div className="stat-value">{show ? stats.totalHospitalizations : <Spinner />}</div>
              <div className="stat-subtitle">in the USA</div>
            </div>
            <div className="Stat large-text">
              <div className="stat-title">Cases per Capita</div>
              <div className="stat-value">{show ? stats.totalPC : <Spinner />}</div>
              <div className="stat-subtitle">per 100,000</div>
            </div>
            <div className="Stat large-text">
              <div className="stat-title">Deaths per Capita</div>
              <div className="stat-value">{show ? stats.totalDeathsPC : <Spinner />}</div>
              <div className="stat-subtitle">per 100,000</div>
            </div>
            <div className="Stat large-text">
              <div className="stat-title">Total Tests</div>
              <div className="stat-value">{show ? stats.totalTests : <Spinner />}</div>
              <div className="stat-subtitle">{show ? stats.totalPositivePercent : "Tested Positive"}</div>
            </div>
          </div>
        </div>
        <div className="splash-columns">
          <p>
            Based on publicly available data, how is COVID-19 (also known as Coronavirus) spreading in the United States? How fast is it growing in each state? And how prepared may different states be to cope with the spread of this global pandemic?
          </p>
          <p>
            At Data USA, our mission is to visualize and distribute open source data of U.S. public interest. To track the evolution and trajectory of COVID-19, we have created a series of interactive graphics. These visualizations are designed to put the spread of COVID-19 in context.
          </p>
        </div>
        <div className="profile-sections">
          <SectionIcon slug="cases" title="Cases by State" />
          <SectionIcon slug="deaths" title="Deaths" />
          <SectionIcon slug="hospitalizations" title="Hospitalizations" />
          <SectionIcon slug="testing" title="Testing" />
          <SectionIcon slug="growth" title="Growth Rate" />
          <SectionIcon slug="economy" title="Economic Impact" />
          <SectionIcon slug="risks" title="Risks and Readiness" />
          <SectionIcon slug="faqs" title="FAQs" />
        </div>
      </div>

      <div id="coronavirus-main">

        {/* Cases by states */}
        <div className="Section coronavirus-section">
          <SectionTitle
            slug="cases"
            title="Cases by State"
          />
          <div className="section-body">
            <div className="section-content">
              <AnchorLink to="cases-total" className="anchor">Total</AnchorLink>
              <AnchorLink to="cases-pc" className="anchor">Per Capita</AnchorLink>
              <AnchorLink to="cases-adj" className="anchor">Time Adjusted</AnchorLink>
              <AnchorLink to="cases-intl" className="anchor">International Comparison</AnchorLink>
            </div>
          </div>
          <div className="section-topics">

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="cases-total"
                  title="Total Confirmed Cases by Date"
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalCases : <Spinner />}</div>
                    <div className="stat-title">Total Cases in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart shows the number of confirmed COVID-19 cases in each U.S. state by date. It is the simplest of all charts, which does not control for the size of a state, or the time the epidemic began in that state.
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.Confirmed),
                    title: `Confirmed Cases (${scaleLabel})`,
                    x: "Date",
                    xConfig: {
                      domain: stateNewDomain,
                      labels: stateNewLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "Confirmed"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Confirmed Cases by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "Confirmed",
                    data: latest.filter(d => d.Confirmed)
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="cases-pc"
                  title="Total Confirmed Cases per Capita"
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalPC : <Spinner />}</div>
                    <div className="stat-title">Cases per 100k in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart normalizes the number of confirmed COVID-19 cases by the population of each state. It gives an idea of the &ldquo;density&rdquo; of COVID-19 infections in each state.
                  </p>
                </div>
                <SourceGroup sources={[ctSource, acs1Source]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.ConfirmedPC),
                    title: `Confirmed Cases per 100,000 (${scaleLabel})`,
                    x: "Date",
                    xConfig: {
                      domain: stateNewDomain,
                      labels: stateNewLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "ConfirmedPC"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Cases per Capita by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "ConfirmedPC",
                    data: latest.filter(d => d.ConfirmedPC)
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="cases-adj"
                  title={`Total Confirmed Cases Since Reaching ${cutoff} Cases`}
                />
                <AxisToggle />
                <CutoffToggle />
                <div className="topic-description">
                  <p>
                    Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as 10, 50, or 100 cases.
                  </p>
                  <p>
                    Move the slider to adjust this threshold.
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateCutoffData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    annotations: stateCutoffAnnotations,
                    data: stateCutoffDataFiltered,
                    title: `Confirmed Cases (${scaleLabel})`,
                    x: "Days",
                    xConfig: {
                      domain: stateCutoffDomain,
                      gridConfig: {"stroke-width": 0},
                      labels: stateCutoffLabels,
                      tickFormat: daysFormat,
                      tickSize: 0,
                      title: `Days Since ${cutoff} Confirmed Cases`
                    },
                    yConfig: {
                      barConfig: {"stroke": "#ccc", "stroke-width": 1},
                      gridConfig: {"stroke-width": 0},
                      tickSize: 0
                    },
                    y: "Confirmed"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="cases-intl"
                  title="International Comparison"
                />
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    To get a sense of how the COVID-19 trajectory in the U.S. states compares to that in other countries, we compare the per capita number of cases for each state that has reported more than 50 cases, with that of the five countries that have reported most cases. We shift all time starting points to the day each place reported a total of 50 cases or more.
                  </p>
                </div>
                <SourceGroup sources={[ctSource, acs1Source, wbSource]} />
              </div>
              <div className="visualization topic-visualization">
                { countryCutoffData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    annotations: countryCutoffAnnotations,
                    data: countryCutoffDataFiltered,
                    title: `Confirmed Cases per 100,000 (${scaleLabel})`,
                    x: "Days",
                    xConfig: {
                      domain: countryCutoffDomain,
                      gridConfig: {"stroke-width": 0},
                      labels: countryCutoffLabels,
                      tickFormat: daysFormat,
                      tickSize: 0,
                      title: "Days Since 50 Confirmed Cases"
                    },
                    y: "ConfirmedPC",
                    yConfig: {
                      barConfig: {"stroke": "#ccc", "stroke-width": 1},
                      gridConfig: {"stroke-width": 0},
                      tickSize: 0
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

          </div>
        </div>


        {/* Deaths */}
        <div className="Section coronavirus-section">
          <SectionTitle
            slug="deaths"
            title="Deaths"
          />
          <div className="section-topics">

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="cases-total"
                  title="Total Deaths by State"
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalDeaths : <Spinner />}</div>
                    <div className="stat-title">Total Deaths in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart shows the number of deaths attributed to COVID-19 cases in each U.S. state.
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.Deaths),
                    title: `Deaths (${scaleLabel})`,
                    tooltipConfig: deathTooltip,
                    x: "Date",
                    xConfig: {
                      domain: stateDeathDomain,
                      labels: stateDeathLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "Deaths"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Deaths by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "Deaths",
                    data: latest.filter(d => d.Deaths),
                    tooltipConfig: deathTooltip
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="deaths-pc"
                  title="Deaths per Capita"
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalDeathsPC : <Spinner />}</div>
                    <div className="stat-title">Deaths per 100k in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart normalizes the number of confirmed COVID-19 deaths by the population of each state. It gives an idea of the impact of COVID-19 infections in each state.
                  </p>
                </div>
                <SourceGroup sources={[ctSource, acs1Source]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.DeathsPC),
                    title: `Deaths per 100,000 (${scaleLabel})`,
                    tooltipConfig: deathTooltip,
                    x: "Date",
                    xConfig: {
                      domain: stateDeathDomain,
                      labels: stateDeathLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "DeathsPC"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Deaths per Capita by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "DeathsPC",
                    data: latest.filter(d => d.DeathsPC),
                    tooltipConfig: deathTooltip
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="deaths-intl"
                  title="International Comparison"
                />
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    Here we compare the per capita number of deaths attributed to COVID-19 in each state that has reported more than 10 deaths with that of the five countries that have reported the most deaths. We shift all time starting points to the day each place reported its tenth death.
                  </p>
                </div>
                <SourceGroup sources={[ctSource, acs1Source, wbSource]} />
              </div>
              <div className="visualization topic-visualization">
                { countryCutoffDeathData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    annotations: countryCutoffDeathAnnotations,
                    data: countryCutoffDeathDataFiltered,
                    title: `Deaths per 100,000 (${scaleLabel})`,
                    tooltipConfig: deathTooltip,
                    x: "Days",
                    xConfig: {
                      barConfig: {"stroke": "#ccc", "stroke-width": 1},
                      domain: countryCutoffDeathDomain,
                      gridConfig: {"stroke-width": 0},
                      labels: countryCutoffDeathLabels,
                      tickFormat: daysFormat,
                      tickSize: 0,
                      title: "Days Since 10 Deaths"
                    },
                    y: "DeathsPC",
                    yConfig: {
                      barConfig: {"stroke": "#ccc", "stroke-width": 1},
                      gridConfig: {"stroke-width": 0},
                      tickSize: 0
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

          </div>
        </div>

        {/** Hospitalizations */}
        <div className="Section coronavirus-section">
          <SectionTitle
            slug="hospitalizations"
            title="Hospitalizations"
          />
          <div className="section-body">
            <div className="section-content">
              <div className="section-description single">
                <p>
                  Hospitalizations are a statistic that, unlike cases, doesn&rsquo;t grow mechanically with increased testing. Hospitalizations also speak about the burden of COVID-19 in the healthcare system.
                </p>
              </div>
            </div>
          </div>
          <div className="section-topics">
            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="total-hospitalizations"
                  title="Hospitalizations"
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalHospitalizations : <Spinner />}</div>
                    <div className="stat-title">Hospitalizations in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    Hospitalizations for all states that have registered at least 50 hospitalizations.
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length && stateTestData.length > 0
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.hospitalized),
                    title: `Hospitalized Patients (${scaleLabel})`,
                    tooltipConfig: tooltipConfigTracker,
                    x: "Date",
                    xConfig: {
                      domain: hospitalizedDomain,
                      labels: hospitalizedLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "hospitalized"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Hospitalizations by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "hospitalized",
                    data: latest.filter(d => d.hospitalized),
                    tooltipConfig: tooltipConfigTracker
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>
          </div>
        </div>


        {/** Testing */}
        <div className="Section coronavirus-section">
          <SectionTitle
            slug="testing"
            title="Testing"
          />

          <div className="section-body">
            <div className="section-content">
              <div className="section-description single">
                <p>
                Testing is central in the fight against a pandemic such as COVID-19.
                </p>
              </div>
            </div>
          </div>
          <div className="section-topics">
            <div className="topic TextViz">
              <div className="topic-content">
                <TopicTitle
                  slug="tests-over-time"
                  title="Tests over time for all states in the U.S."
                />
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? topicStats.totalTests : <Spinner />}</div>
                    <div className="stat-title">Total Tests in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `as of ${dayFormat(today)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.total),
                    title: `Number of Tests (${scaleLabel})`,
                    tooltipConfig: tooltipConfigTracker,
                    x: "Date",
                    xConfig: {
                      domain: totalTestsDomain,
                      labels: totalTestsLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "total"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Number of Tests by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "total",
                    data: latest.filter(d => d.total),
                    tooltipConfig: tooltipConfigTracker
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

          </div>
        </div>

        {/* Growth Rate */}


        <div className="Section coronavirus-section">
          <h2 className="section-title">
            <AnchorLink to="growth" id="growth" className="anchor">
              Growth Rate
            </AnchorLink>
          </h2>
          <div className="section-body">
            <div className="section-content">
              {/* <div className="section-sublinks">
                <AnchorLink to="growth-daily" className="anchor">Daily Cases</AnchorLink>
                <AnchorLink to="growth-rate" className="anchor">Growth Rate</AnchorLink>
                <AnchorLink to="growth-smoothed" className="anchor">Growth Rate (Smoothed)</AnchorLink>
              </div> */}
              <div className="section-description single">
                <p>
                  Because of the exponential nature of early epidemic spreading, it is important to track not only the total number of COVID-19 cases, but their growth. Here, we present the number of daily reported cases.
                </p>
              </div>
            </div>
          </div>
          <div className="section-topics">

            <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="growth-daily" className="topic-title">
                  <AnchorLink to="growth-daily" className="anchor">Number of Daily Cases</AnchorLink>
                </h3>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart presents the number of new cases reported daily by each U.S. state.
                  </p>
                </div>
                <SourceGroup sources={[ctSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateTestDataFiltered.filter(d => d.ConfirmedGrowth),
                    title: `Daily Confirmed Cases (${scaleLabel})`,
                    x: "Date",
                    xConfig: {
                      domain: stateNewDomain,
                      labels: stateNewLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: "ConfirmedGrowth"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { stateTestData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Daily Cases by State\nas of ${today ? dayFormat(today) : ""}`,
                    colorScale: "ConfirmedGrowth",
                    data: latest.filter(d => d.ConfirmedGrowth)
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            {/* <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="growth-daily" className="topic-title">
                  <AnchorLink to="growth-rate" className="anchor">Growth Factor</AnchorLink>
                </h3>
                <AxisToggle />
                <StateCutoff />
                <div className="topic-description">
                  <p>
                    This chart shows the growth factor for each state. The growth factor is the ratio between the newly reported cases between two consecutive days. It is a measure of whether the spread of the epidemic is &ldquo;accelerating&rdquo; (&gt;1), &ldquo;peaking&rdquo; (=1), or &ldquo;decelerating&rdquo; (&lt;1).
                  </p>
                </div>
                <SourceGroup sources={[jhSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateGrowthData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateGrowthData,
                    title: `Growth Factor (${scaleLabel})`,
                    x: "Date",
                    xConfig: {
                      domain: stateGrowthDomain,
                      labels: stateGrowthLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: d => scale === "log" && d[`${measure}Growth`] === 0 ? minValueGrowth : d[`${measure}Growth`]
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div> */}

            {/* <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="growth-daily" className="topic-title">
                  <AnchorLink to="growth-smoothed" className="anchor">Growth Factor (Smoothed)</AnchorLink>
                </h3>
                <AxisToggle />
                <StateCutoff />
                <div className="topic-description">
                  <p>
                    Since growth factors can experience a lot of volatility when numbers are still small, here we present a smoothed version of the growth factor based on a 3 day average.
                  </p>
                </div>
                <SourceGroup sources={[jhSource]} />
              </div>
              <div className="visualization topic-visualization">
                { stateData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateSmoothData,
                    title: title: `Growth Factor (Smoothed) (${scaleLabel})`,
                    x: "Date",
                    xConfig: {
                      domain: stateSmoothDomain,
                      labels: stateSmoothLabels,
                      ticks: false,
                      tickFormat: dateFormat
                    },
                    y: d => scale === "log" && d[`${measure}Smooth`] === 0 ? minValueSmooth : d[`${measure}Smooth`]
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div> */}

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
                  <AnchorLink to="economic-weekly" className="anchor">Impact on Unemployment</AnchorLink>
                </h3>
                <div className="topic-subtitle">
                  Unemployment insurance claim numbers are not seasonally adjusted.
                </div>
                <div className="topic-stats">
                  <div className="StatGroup single">
                    <div className="stat-value">{show ? formatAbbreviate(employmentStat) : <Spinner />}</div>
                    <div className="stat-title">Unemployment insurance claims in {currentStates.length > 0 ? list(currentStates.map(o => o.Geography)) : "the USA"}</div>
                    <div className="stat-subtitle">{show ? `for the week ending ${dayFormat(latestEmployment)}` : ""}</div>
                  </div>
                </div>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart shows weekly unemployment insurance claims in the United States (not-seasonally adjusted). The most recent data point uses Advance State Claims data, which can be revised in subsequent weeks.
                  </p>
                </div>
                <SourceGroup sources={[dolSource]} />
              </div>
              <div className="visualization topic-visualization">
                { employmentData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    // annotations: [
                    //   {
                    //     data: [
                    //       {id: "Area", x: 1196485200000, initial_claims: employmentDataMax},
                    //       {id: "Area", x: 1243828800000, initial_claims: employmentDataMax}
                    //     ],
                    //     fill: "#ddd",
                    //     label: "2008 Recession",
                    //     labelConfig: {
                    //       textAnchor: "middle",
                    //       verticalAlign: "top"
                    //     },
                    //     shape: "Area"
                    //   }
                    // ],
                    data: employmentDataFiltered,
                    discrete: false,
                    title: `Unemployment Insurance Claims (${scaleLabel})`,
                    tooltipConfig: {
                      tbody: [
                        ["Week Ending", d => weekFormat(d.Date)],
                        ["Initial Claims", d => formatAbbreviate(d.initial_claims)]
                      ]
                    },
                    x: "Date",
                    xConfig: {
                      domain: [employmentDataDomain[0], employmentDataDomain[employmentDataDomain.length - 1]],
                      labels: employmentDataLabelsFiltered,
                      ticks: employmentDataLabelsFiltered,
                      tickFormat: yearFormat
                    },
                    y: "initial_claims",
                    yConfig: {
                      scale,
                      tickFormat: formatAbbreviate
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <div className="visualization topic-visualization">
                { employmentData.length
                  ? <Geomap className="d3plus" config={assign({}, geoStateConfig, {
                    currentStates, // currentState is a no-op key to force a re-render when currentState changes.
                    title: `Unemployment Impact by State\nas of ${latestEmployment ? dayFormat(latestEmployment) : ""}`,
                    colorScale: "initial_claims",
                    data: latestEmploymentData,
                    tooltipConfig: {
                      tbody: d =>
                        [
                          ["Date", dateFormat(new Date(d.Date))],
                          ["Initial Claims", commas(d.initial_claims)],
                          ["Continued Claims", commas(d.continued_claims)]
                        ]
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
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
              {/* <div className="section-sublinks">
                <AnchorLink to="risks-beds" className="anchor">Hospital Beds</AnchorLink>
                <AnchorLink to="risks-icu" className="anchor">ICU Beds</AnchorLink>
                <AnchorLink to="risks-uninsured" className="anchor">Uninsured Population</AnchorLink>
                <AnchorLink to="risks-physicians" className="anchor">Physicians</AnchorLink>
                <AnchorLink to="risks-nurses" className="anchor">Nurses</AnchorLink>
              </div> */}
              <div className="section-description single">
                <p>
                  Below you will find some statistics of the preparedness of U.S. states and of the vulnerability of the population in each state. For more information on critical care in the United States, visit <a href="https://sccm.org/Communications/Critical-Care-Statistics" target="_blank" rel="noopener noreferrer">this</a> report from the Society of Critical Care Medicine.
                </p>
              </div>
            </div>
          </div>
          <div className="section-topics">

            <div className="topic Column">
              <div className="topic-content">
                <h3 id="risks-beds" className="topic-title">
                  <AnchorLink to="risks-beds" className="anchor">Hospital Beds per 1,000 Population</AnchorLink>
                </h3>
              </div>
              <div className="visualization topic-visualization">
                { beds.length
                  ? <Geomap className="d3plus" config={assign({}, mapConfig, {
                    colorScale: "Total",
                    data: beds,
                    groupBy: "ID Geography",
                    label: d => d.Geography,
                    projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
                    tooltipConfig: {
                      tbody: [
                        ["Year", "2018"],
                        ["Beds per 1,000 Residents", d => d.Total]
                      ]
                    },
                    topojson: "/topojson/State.json"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <SourceGroup sources={[kfSource]} />
            </div>

            {/* <div className="topic Column">
              <div className="topic-content">
                <h3 id="risks-icu" className="topic-title">
                  <AnchorLink to="risks-icu" className="anchor">ICU Beds per 1,000 Population</AnchorLink>
                </h3>
              </div>
              <div className="visualization topic-visualization">
                { beds.length
                  ? <Geomap className="d3plus" config={assign({}, mapConfig, {
                    colorScale: "TotalPC",
                    data: icu,
                    groupBy: "ID Geography",
                    label: d => d.Geography,
                    projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
                    tooltipConfig: {
                      tbody: [
                        ["Year", "2018"],
                        ["ICU Beds per 1,000 Residents", d => formatAbbreviate(d.TotalPC)],
                        ["ICU Beds", d => d.Total]
                      ]
                    },
                    topojson: "/topojson/State.json"
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <SourceGroup sources={[aaSource]} />
            </div> */}

            <div className="topic Column">
              <div className="topic-content">
                <h3 id="risks-uninsured" className="topic-title">
                  <AnchorLink to="risks-uninsured" className="anchor">Uninsured Population by State</AnchorLink>
                </h3>
              </div>
              <div className="visualization topic-visualization">
                { beds.length
                  ? <Geomap className="d3plus" config={assign({}, mapConfig, {
                    colorScale: "Uninsured Percentage",
                    colorScaleConfig: {
                      axisConfig: {
                        tickFormat: d => `${formatAbbreviate(d * 100)}%`
                      }
                    },
                    data: "/api/data?measures=Uninsured%20Percentage&drilldowns=State&Year=latest",
                    groupBy: "ID State",
                    label: d => d.State,
                    projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
                    tooltipConfig: {
                      tbody: [
                        ["Year", d => d.Year],
                        ["Uninsured", d => `${formatAbbreviate(d["Uninsured Percentage"] * 100)}%`]
                      ]
                    },
                    topojson: "/topojson/State.json"
                  })} dataFormat={resp => resp.data} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <SourceGroup sources={[acs1Source]} />
            </div>

            <div className="topic Column">
              <div className="topic-content">
                <h3 id="risks-physicians" className="topic-title">
                  <AnchorLink to="risks-physicians" className="anchor">Physicians and Surgeons per 1,000 Population</AnchorLink>
                </h3>
              </div>
              <div className="visualization topic-visualization">
                { beds.length
                  ? <Geomap className="d3plus" config={assign({}, mapConfig, {
                    colorScale: "Total Population PC",
                    colorScaleConfig: {
                      axisConfig: {
                        tickFormat: formatAbbreviate
                      }
                    },
                    data: "/api/data?drilldowns=State&measures=Total%20Population&Year=2017&soc=291060",
                    groupBy: "ID State",
                    label: d => d.State,
                    projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
                    tooltipConfig: {
                      tbody: [
                        ["Year", d => d.Year],
                        ["Physicians and Surgeons", d => formatAbbreviate(d["Total Population"])],
                        ["Per 1,000 Population", d => formatAbbreviate(d["Total Population PC"])]
                      ]
                    },
                    topojson: "/topojson/State.json"
                  })} dataFormat={resp => {
                    const data = resp.data;
                    data.forEach(d => {
                      d["Total Population PC"] = d["Total Population"] / pops[d["ID State"]] * 1000;
                    });
                    return data;
                  }} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <SourceGroup sources={[pums1Source]} />
            </div>

            <div className="topic Column">
              <div className="topic-content">
                <h3 id="risks-nurses" className="topic-title">
                  <AnchorLink to="risks-nurses" className="anchor">Registered Nurses per 1,000 Population</AnchorLink>
                </h3>
              </div>
              <div className="visualization topic-visualization">
                { beds.length
                  ? <Geomap className="d3plus" config={assign({}, mapConfig, {
                    colorScale: "Total Population PC",
                    colorScaleConfig: {
                      axisConfig: {
                        tickFormat: formatAbbreviate
                      }
                    },
                    data: "/api/data?drilldowns=State&measures=Total%20Population&Year=2017&soc=291141",
                    groupBy: "ID State",
                    label: d => d.State,
                    projection: typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
                    tooltipConfig: {
                      tbody: [
                        ["Year", d => d.Year],
                        ["Registered Nurses", d => formatAbbreviate(d["Total Population"])],
                        ["Per 1,000 Population", d => formatAbbreviate(d["Total Population PC"])]
                      ]
                    },
                    topojson: "/topojson/State.json"
                  })} dataFormat={resp => {
                    const data = resp.data;
                    data.forEach(d => {
                      d["Total Population PC"] = d["Total Population"] / pops[d["ID State"]] * 1000;
                    });
                    return data;
                  }} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
              <SourceGroup sources={[pums1Source]} />
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
                      What is exponential growth? And how does it relate to the use of logarithmic scales?
                    </p>
                    <p>
                      At the beginning of an epidemic, epidemic growth exponentially. Exponential growth is growth that happens by multiplying rather than adding.
                    </p>
                    <p>
                      Compare linear growth that adds 10 at each time step with exponential growth that multiplies by 2.
                    </p>
                    <p>
                      A linear growth sequence that adds 10 at each time step looks like:
                    </p>
                    <pre><code>0, 10, 20, 30, 40, 50, 60, 70, 80, 100…</code></pre>
                    <p>
                      Whereas exponential sequence that multiplies by 2 at each time step looks like:
                    </p>
                    <pre><code>1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024....</code></pre>
                    <p>
                      At the beginning, linear growth seems faster (20 is much larger than 4), but linear growth does not accelerate. It adds the same amount every time. Exponential growth accelerates, adding more at each time step, so it can grow suddenly.
                    </p>
                    <p>
                      After 10 steps, linear (+10) growth brings us to 100. Exponential (x2) growth brings us to (1,024). After 20 steps, linear growth only brings us to 200. Exponential growth to more than 1 million!
                    </p>
                    <p>
                      Exponential growth is so fast that to appreciate it better we need to use logarithmic scales. These are scales that also grow by multiples. For example, a logarithmic scale between 1 and 1,000,000 goes from 1 to 10, from 10 to 100, from 100 to 1,000, from 1,000 to 10,000, from 10,000 to 100,000, and from 100,000 to 1,000,000. This is a logarithmic scale in base 10, because we are multiplying by ten each time. What this scale shows is that, in exponential growth, 1,000 is halfway to 1,000,000. That’s why it is important to stop exponential growth even if the numbers look small. The same number of steps that bring you from 1 to 1,000 bring you from 1,000 to 1,000,000.
                    </p>
                    <p>
                      Strictly speaking, epidemic processes are only exponential early on, when the number of cases is small compared to the size of the population or other limiting factors. Eventually, growth peters out, either because spreading became widespread, or because other factors, such as physical distancing, or immunization, reduces the speed of the spreading. To learn more about the basic functional forms of epidemic spreading, watch <a href="https://www.youtube.com/watch?v=Kas0tIxDvrg" target="_blank" rel="noopener noreferrer">this</a> video prepared by the CDC.
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
                      Information on this site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Data USA makes every effort to ensure, but does not guarantee, the accuracy or completeness of the information on the Data USA website. This site is for informational purposes and is not intended provide advice or aid in decision making. Our goal is to keep this information timely. If errors are brought to our attention, we will try to correct them.
                    </p>

                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>;

  }

}

Coronavirus.contextTypes = {
  formatters: PropTypes.object
};

export default connect(null, dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Coronavirus);
