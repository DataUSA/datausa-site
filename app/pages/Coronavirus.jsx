import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import axios from "axios";
import {Icon, NonIdealState, Slider, Spinner, Button, Checkbox, Popover, PopoverInteractionKind} from "@blueprintjs/core";
import {Helmet} from "react-helmet";
import {AnchorLink} from "@datawheel/canon-core";
import {Sparklines, SparklinesCurve} from "react-sparklines";

import {extent, max, mean, merge, range, sum} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
import {format} from "d3-format";
import {scaleLog} from "d3-scale";

import {countries} from "countries-list";

import styles from "style.yml";

const stateAbbreviations = {
  "Arizona": "AZ",
  "Alabama": "AL",
  "Alaska": "AK",
  "American Samoa": "AS",
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
  "United States": "US",
  "U.S. Virgin Islands": "VI",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};

const stateGrid = [
  ["AK", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "ME"],
  ["  ", "  ", "  ", "  ", "  ", "WI", "  ", "  ", "  ", "VT", "NH"],
  ["WA", "ID", "MT", "ND", "MN", "IL", "MI", "  ", "NY", "MA", "  "],
  ["OR", "NV", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT", "RI"],
  ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE", "  "],
  ["  ", "AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC", "  ", "  "],
  ["MP", "  ", "  ", "OK", "LA", "MS", "AL", "GA", "  ", "  ", "PR"],
  ["GU", "HI", "AS", "  ", "TX", "  ", "  ", "  ", "FL", "  ", "VI"]
];

const countryMeta = Object.keys(countries).reduce((obj, key) => {
  const d = countries[key];
  d.iso = key;
  obj[d.name] = d;
  return obj;
}, {});

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

const caseSlugLookup = {
  cases: "Confirmed",
  deaths: "Deaths",
  hospitalizations: "Hospitalized",
  tests: "Tests",
  positive: "Tests",
  daily: "ConfirmedGrowth"
};

const justDayFormat = timeFormat("%A");

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
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const midCutoff = w < 500 ? 3 : 5;
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
        let months = (finalObj.getFullYear() - dateObj.getFullYear()) * 12;
        months -= dateObj.getMonth();
        months += finalObj.getMonth();
        const showMids = months < midCutoff;
        if (showMids && date < 10) arr.push(`${month + 1}/15/${year}`);
        while (currentMonth <= finalMonth) {
          if (currentMonth !== finalMonth || finalDate > 5) arr.push(new Date(`${currentMonth + 1}/01/${year}`).getTime());
          if (showMids && date < 20 && currentMonth !== finalMonth || finalDate > 20) {
            arr.push(`${currentMonth + 1}/15/${year}`);
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
      currentCaseSlug: "daily",
      currentCasePC: false,
      currentCaseReach: false,
      currentCaseInternational: false,
      currentCaseSmooth: true,
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
      tableOrder: "Geography",
      tableSort: "asc",
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

          const currentStates = nest()
            .key(d => d["ID Geography"])
            .entries(stateTestData.filter(d => d.Confirmed > 0))
            .map(group => group.values.slice(-14))
            .sort((a, b) => sum(b, d => d.ConfirmedGrowth) - sum(a, d => d.ConfirmedGrowth))
            .slice(0, 5)
            .map(d => d[d.length - 1]);

          const currentStatesHash = currentStates.reduce(
            (acc, d) => ({[d["ID Geography"]]: true, ...acc}),
            {}
          );

          const countryCases = resp[1].data;

          const data = resp[2].data;
          const icuData = data.icu;

          const cutoffDate = new Date("2018/01/01").getTime();

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

          const nationDivision = divisions.find(x => x["ID Region"] === 5);
          const employmentTotals = nest()
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

          let mobilityData = resp[4].data.data.map(d => ({
            ...d,
            ...divisions.find(
              x => x["ID Division"] === stateToDivision[d["ID Geography"]]
            )
          }));
          const mobilityTotals = nest()
            .key(d => `${d.Date}_${d.Type}`)
            .entries(mobilityData)
            .map(group => {
              const d = Object.assign({}, group.values[0], nationDivision);
              d.Geography = "United States";
              d["ID Geography"] = "01000US";
              [
                "Percent Change from Baseline"
              ].forEach(key => {
                d[key] = mean(group.values, d => d[key]);
              });
              return d;
            });
          mobilityData = mobilityData.concat(mobilityTotals);
          const mobilityLatestDate = max(mobilityData, d => d.Date);
          const mobilityDataLatest = mobilityData.filter(
            d => d.Date === mobilityLatestDate
          );

          this.setState(
            {
              beds: data.beds,
              countryCases,
              currentStates,
              currentStatesHash,
              icu: icuData,
              mobilityData,
              mobilityDataLatest,
              mobilityLatestDate,
              pops: resp[0].data.population,
              stateTestData,
              employmentData: employmentData.concat(employmentTotals)
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
    this.prepData.bind(this)({cutoff: value});
  }

  changeScale(scale) {
    if (scale !== this.state.scale) this.setState({scale});
  }

  deriveCutoffKey(slug, isPC, isSmooth) {
    const cutoffKey = caseSlugLookup[slug];
    const maybePC = ["cases", "deaths", "hospitalizations", "tests", "daily"].includes(slug);
    return `${cutoffKey}${maybePC && isPC ? "PC" : ""}${maybePC && isSmooth ? "Smooth" : ""}`;
  }

  changePC(e) {
    const currentCasePC = e.target.checked;
    const {currentCaseSlug, currentCaseSmooth} = this.state;
    const cutoffKey = this.deriveCutoffKey(currentCaseSlug, currentCasePC, currentCaseSmooth);
    const reset = true;
    this.prepData.bind(this)({currentCasePC, cutoffKey, reset});
  }

  changeSmooth(e) {
    const currentCaseSmooth = e.target.checked;
    const {currentCaseSlug, currentCasePC, currentCaseInternational} = this.state;
    const cutoffKey = this.deriveCutoffKey(currentCaseSlug, currentCasePC || currentCaseInternational, currentCaseSmooth);
    const reset = false;
    this.prepData.bind(this)({currentCaseSmooth, cutoffKey, reset});
  }

  changeReach(e) {
    const currentCaseReach = e.target.checked;
    const {currentCaseSlug, currentCasePC, currentCaseSmooth} = this.state;
    const cutoffKey = this.deriveCutoffKey(currentCaseSlug, currentCasePC, currentCaseSmooth);
    const reset = true;
    this.prepData.bind(this)({currentCaseReach, cutoffKey, reset});
  }

  changeInternational(e) {
    const currentCaseInternational = e.target.checked;
    const {currentCaseSlug, currentCaseSmooth} = this.state;
    const cutoffKey = this.deriveCutoffKey(currentCaseSlug, currentCaseInternational, currentCaseSmooth);
    const reset = true;
    this.prepData.bind(this)({currentCaseInternational, cutoffKey, reset});
  }

  changeCaseSlug(e) {
    const {currentCasePC, currentCaseSmooth} = this.state;
    const currentCaseSlug = e.target.value;
    const cutoffKey = this.deriveCutoffKey(currentCaseSlug, currentCasePC, currentCaseSmooth);
    const reset = true;
    this.prepData.bind(this)({currentCaseSlug, cutoffKey, reset});
  }

  prepData(config) {
    let cutoff = config && config.cutoff !== undefined ? config.cutoff : this.state.cutoff;
    const cutoffKey = config && config.cutoffKey !== undefined ? config.cutoffKey : this.state.cutoffKey;
    const currentCaseSlug = config && config.currentCaseSlug !== undefined ? config.currentCaseSlug : this.state.currentCaseSlug;
    const currentCaseReach = config && config.currentCaseReach !== undefined ? config.currentCaseReach : this.state.currentCaseReach;
    const currentCasePC = config && config.currentCasePC !== undefined ? config.currentCasePC : this.state.currentCasePC;
    const currentCaseSmooth = config && config.currentCaseSmooth !== undefined ? config.currentCaseSmooth : this.state.currentCaseSmooth;
    const currentCaseInternational = config && config.currentCaseInternational !== undefined ? config.currentCaseInternational : this.state.currentCaseInternational;
    const reset = config && config.reset !== undefined ? config.reset : false;
    const {stateTestData, countryCases} = this.state;

    const maxPct = currentCasePC || currentCaseInternational ? .3 : .1;
    const dataMax = Math.round(max(stateTestData, d => d[cutoffKey]));
    let cutoffStepSize = Math.pow(10, String(dataMax).length - 3);
    if (cutoffStepSize < 1) cutoffStepSize = 1;
    let cutoffLabelStepSize = cutoffStepSize * 10;
    const cutoffMax = Math.round(dataMax * maxPct / cutoffLabelStepSize) * cutoffLabelStepSize;
    if (cutoffLabelStepSize > cutoffMax / 2) cutoffLabelStepSize /= 5;
    if (cutoffLabelStepSize < cutoffMax / 10) cutoffLabelStepSize *= 3;

    if (reset) cutoff = cutoffStepSize;

    const sliderConfig = {
      max: cutoffMax,
      min: 0,
      stepSize: cutoffStepSize,
      labelStepSize: cutoffLabelStepSize,
      labelRenderer: label => formatAbbreviate(label)
    };

    const stateCutoffData = merge(
      nest()
        .key(d => d["ID Geography"])
        .entries(stateTestData)
        .map(group => {
          let days = 0;
          return group.values.reduce((arr, d) => {
            if (d[cutoffKey] && d[cutoffKey] >= cutoff) {
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
            if (d.ConfirmedPC && d.ConfirmedPC > cutoff) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
        })
        .sort((a, b) => max(b, d => d.ConfirmedPC) - max(a, d => d.ConfirmedPC))
    );

    const countryCutoffDeathData = merge(
      nest()
        .key(d => d["ID Geography"])
        .entries(countryData.concat(stateTestData))
        .map(group => {
          let days = 0;
          return group.values.reduce((arr, d) => {
            if (d.DeathsPC && d.DeathsPC > cutoff) {
              days++;
              const newObj = Object.assign({}, d);
              newObj.Days = days;
              arr.push(newObj);
            }
            return arr;
          }, []);
        })
        .sort((a, b) => max(b, d => d.DeathsPC) - max(a, d => d.DeathsPC))
    );

    this.setState({
      stateCutoffData,
      countryCutoffData,
      countryCutoffDeathData,
      countryData,
      cutoff,
      cutoffKey,
      currentCaseSlug,
      currentCaseReach,
      currentCasePC,
      currentCaseSmooth,
      currentCaseInternational,
      sliderConfig
    });
  }

  updateStates(d) {
    const {currentStates, currentStatesHash} = this.state;
    if (currentStatesHash[d["ID Geography"]]) {
      let newCurrentStates = currentStates.filter(
        o => o["ID Geography"] !== d["ID Geography"]
      );
      if (newCurrentStates.length === 0) {
        newCurrentStates = currentStates.filter(o => o["ID Geography"] === "01000US");
      }
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

  updateTableSort(column) {
    const {tableOrder, tableSort} = this.state;
    if (column === tableOrder) this.setState({tableSort: tableSort === "asc" ? "desc" : "asc"});
    else this.setState({tableOrder: column, tableSort: "desc"});
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
      currentCaseSmooth,
      currentStates,
      currentStatesHash,
      employmentData,
      mobilityData,
      // mobilityDataLatest,
      mobilityType,
      stateTestData,
      // measure,
      icu,
      pops,
      scale,
      sliderConfig,
      stateCutoffData,
      tableOrder,
      tableSort,
      title
    } = this.state;


    const onlyNational = currentStates.find(d => d["ID Geography"] === "01000US") && currentStates.length === 1;

    const stateFilter = d => currentStatesHash[d["ID Geography"]] || d.Region === "International";
    const stateTestDataFiltered = stateTestData.filter(stateFilter);
    const stateCutoffDataFiltered = stateCutoffData.filter(stateFilter);
    const countryCutoffDataFiltered = countryCutoffData.filter(stateFilter);
    const countryCutoffDeathDataFiltered = countryCutoffDeathData.filter(stateFilter);

    const mobilityDataFiltered = mobilityData
      .filter(stateFilter)
      .filter(d => d.Type === mobilityType && d["ID Geography"]);
    const mobilityDataTicks = calculateMonthlyTicks(mobilityDataFiltered, d => d.Date);

    // manually forcing small labels on desktop
    const smallLabels = true;
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    // const smallLabels = w < 768;

    const d3DateFormat = timeFormat(w < 768 ? "%b %d" : "%B %d");
    const dateFormat = d => d3DateFormat(d).replace(/[0-9]{2}$/, m => parseFloat(m, 10));
    // const daysFormat = d => `${commas(d)} day${d !== 1 ? "s" : ""}`;
    const daysFormat = d => commas(d);

    // const scaleLabel = scale === "log" ? "Logarithmic" : "Linear";

    const lineColor = d => {
      if (d.Region === "International") return "#ccc";
      if (currentStates.length === 1) return colorArray[0];
      if (d["ID Geography"] === "01000US") return "#aaa";
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
        "ID Division": (arr, acc) => acc(arr[0]),
        "ID Region": (arr, acc) => acc(arr[0])
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
        // click: this.updateStates.bind(this),
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
          sort: a => a["ID Region"] !== 6 ? -1 : 1,
          stroke: lineColor,
          strokeWidth: 2
        }
      },
      tooltipConfig: {
        tbody: d => {
          const arr = [["Date", dateFormat(new Date(d.Date))]];
          if (d.ConfirmedGrowth !== undefined) arr.push(["Daily New Cases", commas(d.ConfirmedGrowth)]);
          if (d.Confirmed !== undefined) arr.push(["Confirmed Cases", commas(d.Confirmed)]);
          if (d.ConfirmedPC !== undefined) arr.push(["Cases per 100,000", commas(Math.round(d.ConfirmedPC))]);
          if (d.PositivePct !== undefined) arr.push(["% Positive Tests", `${formatAbbreviate(d.PositivePct)}%`]);
          if (d.Deaths !== undefined) arr.push(["Deaths", commas(d.Deaths)]);
          if (d.DeathsPC !== undefined) arr.push(["Deaths per 100,000", formatAbbreviate(d.DeathsPC)]);
          if (d.Tests !== undefined) arr.push(["Tests", commas(d.Tests)]);
          if (d.Hospitalized !== undefined) arr.push(["Hospitalizations", commas(d.Hospitalized)]);
          if (d.initial_claims !== undefined) arr.push(["Initial Claims", formatAbbreviate(d.initial_claims)]);
          return arr;
        },
        title: d =>
          d["ID Region"] === 6
            ? `${countryMeta[d.Geography] ? countryMeta[d.Geography].emoji : ""}${d.Geography}`
            : d.Geography,
        titleStyle: {
          color: d => colorLegible(lineColor(d)),
        }
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
    // const geoStateConfig = {
    //   colorScalePosition: false,
    //   zoom: false,
    //   time: "Date",
    //   timeline: false,
    //   groupBy: "ID Geography",
    //   label: d => d.Geography,
    //   shapeConfig: {
    //     Path: {
    //       stroke: d =>
    //         currentStatesHash[d["ID Geography"]] ? lineColor(d) : styles.dark,
    //       strokeWidth: d => currentStatesHash[d["ID Geography"]] ? 3 : 1,
    //       strokeOpacity: d =>
    //         currentStatesHash[d["ID Geography"]] ? 0.75 : 0.25
    //     }
    //   },
    //   projection:
    //     typeof window !== "undefined" ? window.albersUsaPr() : "geoMercator",
    //   titleConfig: {
    //     fontSize: 21
    //   },
    //   tooltipConfig: Object.assign({}, sharedConfig.tooltipConfig, {
    //     footer: d =>
    //       `Click to ${
    //         !currentStatesHash[d["ID Geography"]]
    //           ? `select ${d.Geography}`
    //           : "clear state selection"
    //       }`
    //   }),
    //   on: {
    //     click: this.updateStates.bind(this)
    //   },
    //   topojson: "/topojson/State.json"
    // };

    const deathTooltip = {
      tbody: d => {
        const arr = [
          ["Date", dateFormat(new Date(d.Date))],
          ["Total Deaths", commas(d.Deaths)]
        ];
        if (d.DeathsConfirmed && d.DeathsProbable) {
          arr.push(["Confirmed Deaths", commas(d.DeathsConfirmed)]);
          arr.push(["Probable Deaths", commas(d.DeathsProbable)]);
        }
        if (d.DeathsPC !== undefined) {
          arr.push(["Deaths per 100,000", formatAbbreviate(d.DeathsPC)]);
        }
        return arr;
      }
    };

    const employmentDataFiltered = employmentData.filter(stateFilter);

    const employmentDate = new Date("03/21/2020");
    const employmentStat = sum(
      employmentData.filter(d => d.Date >= employmentDate && d["ID Geography"] === "01000US"),
      d => d.initial_claims
    );
    const employmentStatStates = sum(
      employmentDataFiltered.filter(d => d.Date >= employmentDate && d["ID Geography"] !== "01000US"),
      d => d.initial_claims
    );

    const StateSelector = () =>
      <AnchorLink to="cases" className="topic-subtitle">
        <Icon icon="arrow-up" iconSize={8} /> click here to return to the table and change state selection <Icon icon="arrow-up" iconSize={8} />
      </AnchorLink>;

    const AxisToggle = () =>
      <div>
        <label className="bp3-label bp3-inline">
          Y-Axis Scale
          <div className="bp3-button-group bp3-fill">
            <Button className={scale === "linear" ? "bp3-active bp3-fill" : "bp3-fill"} onClick={this.changeScale.bind(this, "linear")}>Linear</Button>
            <Button className={scale === "log" ? "bp3-active bp3-fill" : "bp3-fill"} onClick={this.changeScale.bind(this, "log")}>Logarithmic</Button>
          </div>
        </label>
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
          arr.push(["Hospitalized patients per 100,000", formatAbbreviate(d.HospitalizedPC)]);
        }
        if (d.CurrentlyHospitalized) arr.push(["Patients in hospital on this date", formatAbbreviate(d.CurrentlyHospitalized)]);
        if (d.CurrentlyInICU) arr.push(["Patients in ICU on this date", formatAbbreviate(d.CurrentlyInICU)]);
        if (d.CurrentlyOnVentilator) arr.push(["Patients on ventilator on this date", formatAbbreviate(d.CurrentlyOnVentilator)]);
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
    const latestNational = latest.filter(d => d["ID Geography"] === "01000US");
    const totalCases = sum(latestNational, d => d.Confirmed);
    stats.totalCases = commas(totalCases);
    const totalPopulation = pops["01000US"];
    stats.totalPC = formatAbbreviate(totalCases / totalPopulation * 100000);
    const totalDeaths = sum(latestNational, d => d.Deaths);
    stats.totalDeaths = commas(totalDeaths);
    stats.totalDeathsPC = formatAbbreviate(
      totalDeaths / totalPopulation * 100000
    );
    stats.totalHospitalizations = commas(sum(latestNational, d => d.Hospitalized));
    const totalTests = sum(latestNational, d => d.Tests);
    stats.totalTests = formatAbbreviate(totalTests);
    const totalPositive = sum(latestNational, d => d.Confirmed);
    stats.totalPositivePercent = `${formatAbbreviate(
      totalPositive / totalTests * 100
    )}% Tested Positive`;

    // topic stats
    const topicStats = {};
    const latestFiltered = latest.filter(d => currentStatesHash[d["ID Geography"]] && d["ID Geography"] !== "01000US");
    const totalCasesFiltered = sum(latestFiltered, d => d.Confirmed);
    topicStats.totalCases = commas(totalCasesFiltered);
    const totalPopulationFiltered = sum(latestFiltered, d => pops[d["ID Geography"]]);
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
    // "currently" hospitalized stats
    ["CurrentlyHospitalized", "CurrentlyInICU", "CurrentlyOnVentilator"].forEach(stat => {
      topicStats[`total${stat}`] = latestFiltered.every(d => d[stat]) ? formatAbbreviate(sum(latestFiltered, d => d[stat])) : false;
    });

    const pctCutoffDate = new Date(today - 12096e5);
    const cutoffFormatted = formatAbbreviate(cutoff);
    const example = `${formatAbbreviate(sliderConfig.stepSize)}, ${formatAbbreviate(sliderConfig.stepSize * 2)}, or ${formatAbbreviate(sliderConfig.stepSize * 10)}`;

    const caseSections = {
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
            ? stateCutoffDataFiltered.filter(d => d[`ConfirmedGrowth${currentCaseSmooth ? "Smooth" : ""}`])
            : stateTestDataFiltered.filter(d => d[`ConfirmedGrowth${currentCaseSmooth ? "Smooth" : ""}`]),
          time: "Date",
          timeline: false,
          // title: `Daily Confirmed Cases (${scaleLabel})`,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? currentCasePC
                ? `Days Since Reaching ${cutoffFormatted} Daily Cases Per 100,000`
                : `Days Since Reaching ${cutoffFormatted} Daily Cases`
              : "",
            labels: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Date),
            ticks: currentCaseReach
              ? calculateDailyTicks(stateCutoffDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Days)
              : calculateMonthlyTicks(stateTestDataFiltered.filter(d => d.ConfirmedGrowth), d => d.Date),
            tickFormat: currentCaseReach ? daysFormat : dateFormat
          },
          y: `ConfirmedGrowth${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`
        },
        geoConfig: {
          currentStates, // currentState is a no-op key to force a re-render when currentState changes.
          colorScale: "ConfirmedGrowth",
          data: latest.filter(d => d.ConfirmedGrowth)
        }
      },
      cases: {
        showCharts: currentCaseInternational
          ? countryCutoffData.length > 0
          : currentCaseReach
            ? stateCutoffData.length > 0
            : stateTestData.length > 0,
        title: currentCaseInternational
          ? "International Comparison (Cases)"
          : currentCasePC
            ? currentCaseReach
              ? `Total Confirmed Cases Since Reaching ${cutoffFormatted} Cases Per 100,000`
              : "Total Confirmed Cases per 100,000"
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
            title: `${currentCasePC ? "Confirmed Cases per 100,000" : "Confirmed Cases"} in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseInternational
          ? [`To get a sense of how the COVID-19 trajectory in the U.S. states compares to that in other countries, we compare the per capita number of cases for each state that has reported more than ${cutoffFormatted} cases, with that of the five countries that have reported most cases.`]
          : currentCaseReach
            ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} cases${currentCasePC ? " per capita" : ""}.`]
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
              ? stateCutoffDataFiltered.filter(d => d[`Confirmed${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`])
              : stateTestDataFiltered.filter(d => d[`Confirmed${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`]),
          // title: currentCaseInternational || currentCasePC
          //   ? `Confirmed Cases per 100,000 (${scaleLabel})`
          //   : `Confirmed Cases (${scaleLabel})`,
          time: "Date",
          timeline: false,
          x: currentCaseInternational || currentCaseReach
            ? "Days"
            : "Date",
          xConfig: {
            title: currentCaseInternational
              ? `Days Since ${cutoffFormatted} Confirmed Cases Per 100,000`
              : currentCaseReach
                ? currentCasePC
                  ? `Days Since ${cutoffFormatted} Confirmed Cases Per 100,000`
                  : `Days Since ${cutoffFormatted} Confirmed Cases`
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
          y: `Confirmed${currentCaseInternational || currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`,
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
            ? currentCaseReach
              ? `Total Deaths Since Reaching ${cutoffFormatted} Death${cutoff === 1 ? "" : "s"} Per 100,000`
              : "Deaths per 100,000"
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
            title: `${currentCasePC ? "Deaths per 100,000" : "Total Deaths"} in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseInternational
          ? [`Here we compare the per capita number of deaths attributed to COVID-19 in each state that has reported more than ${cutoffFormatted} deaths with that of the five countries that have reported the most deaths.`]
          : currentCaseReach
            ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} deaths${currentCasePC ? " per 100,000" : ""}.`]
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
              ? stateCutoffDataFiltered.filter(d => d[`Deaths${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`])
              : stateTestDataFiltered.filter(d => d[`Deaths${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`]),
          // title: `${currentCasePC || currentCaseInternational ? "Deaths per 100,000" : "Deaths"} (${scaleLabel})`,
          tooltipConfig: deathTooltip,
          time: "Date",
          timeline: false,
          x: currentCaseInternational || currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseInternational
              ? `Days Since ${cutoffFormatted} Death${cutoff === 1 ? "" : "s"} Per 100,000`
              : currentCaseReach
                ? currentCasePC
                  ? `Days Since ${cutoffFormatted} Death${cutoff === 1 ? "" : "s"} Per 100,000`
                  : `Days Since ${cutoffFormatted} Deaths`
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
          y: `Deaths${currentCaseInternational || currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`
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
          ? currentCaseReach
            ? `Total Hospitalizations Since Reaching ${cutoffFormatted} Hospitalization${cutoff === 1 ? "" : "s"} Per 100,000`
            : "Hospitalizations per 100,000"
          : currentCaseReach
            ? `Total Hospitalizations Since Reaching ${cutoffFormatted} Hospitalizations`
            : "Total Hospitalizations by State",
        subtitle: "Hospitalization data for some states may be delayed or not reported.",
        stat: currentCaseReach
          ? false
          : [
              {
                value: show
                  ? currentCasePC
                    ? topicStats.totalHospitalizationsPC
                    : topicStats.totalHospitalizations
                  : <Spinner />,
                title: `${currentCasePC ? "Hospitalizations per 100,000" : "Hospitalizations"} in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`,
                subtitle: show ? `as of ${dayFormat(today)}` : ""
              }
            ],
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} hospitalizations${currentCasePC ? " per 100,000" : ""}.`]
          : [
            "Hospitalizations are a statistic that, unlike cases, doesn't grow mechanically with increased testing. Hospitalizations also speak about the burden of COVID-19 in the healthcare system."
          ],
        sources: [ctSource],
        option: "Hospitalizations",
        lineConfig: {
          data: currentCaseReach
            ? stateCutoffDataFiltered.filter(d => d[`Hospitalized${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`])
            : stateTestDataFiltered.filter(d => d[`Hospitalized${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`]),
          // title: `Hospitalized Patients ${currentCasePC ? "per 100,000" : ""} (${scaleLabel})`,
          tooltipConfig: tooltipConfigTracker,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? currentCasePC
                ? `Days Since ${cutoffFormatted} Hospitalization${cutoff === 1 ? "" : "s"} Per 100,000`
                : `Days Since ${cutoffFormatted} Hospitalizations`
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
          y: `Hospitalized${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`
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
          ? currentCaseReach
            ? `Total Tests Since Reaching ${cutoffFormatted} Tests Per 100,000`
            : "Tests per 100,000"
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
            title: `${currentCasePC ? "Tests per 100,000" : "Total Tests"} in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`,
            subtitle: show ? `as of ${dayFormat(today)}` : ""
          },
        descriptions: currentCaseReach
          ? [`Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as ${example} tests${currentCasePC ? " per 100,000" : ""}.`]
          : ["Testing is central in the fight against a pandemic such as COVID-19."],
        sources: [ctSource],
        option: "Tests",
        lineConfig: {
          data: currentCaseReach
            ? stateCutoffDataFiltered.filter(d => d[`Tests${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`])
            : stateTestDataFiltered.filter(d => d[`Tests${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`]),
          // title: `Number of Tests ${currentCasePC ? "per 100,000" : ""} (${scaleLabel})`,
          tooltipConfig: tooltipConfigTracker,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? currentCasePC
                ? `Days Since ${cutoffFormatted} Tests Per 100,000`
                : `Days Since ${cutoffFormatted} Tests`
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
          y: `Tests${currentCasePC ? "PC" : ""}${currentCaseSmooth ? "Smooth" : ""}`
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
            title: `Positive Test Results in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`,
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
          // title: `Positive Tests (${scaleLabel})`,
          time: "Date",
          timeline: false,
          x: currentCaseReach ? "Days" : "Date",
          xConfig: {
            title: currentCaseReach
              ? currentCasePC
                ? `Days Since ${cutoffFormatted} Tests Per 100,000`
                : `Days Since ${cutoffFormatted} Tests`
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
      }
    };

    const CaseSelector = () =>
      <div>
        <label className="bp3-label bp3-inline">
          Indicator
          <div className="bp3-select">
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
    const isDaily = currentCaseSlug === "daily";
    const allowPC = isCases || isDeaths || isTests || isHospitalizations || isDaily;
    const allowSmooth = isCases || isDeaths || isTests || isHospitalizations || isDaily;

    const currentSection = caseSections[currentCaseSlug];

    if (currentCaseInternational || currentCaseReach) {
      delete currentSection.lineConfig.time;
      delete currentSection.lineConfig.timeline;
    }

    // Selectively add stats to Hospital tab:
    if (caseSections.hospitalizations.stat) {
      const titlesuffix = `in ${!onlyNational ? list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography)) : "the USA"}`
      const subtitle = show ? `${dayFormat(today)}` : "";
      if (topicStats.totalCurrentlyHospitalized) caseSections.hospitalizations.stat.push({value: topicStats.totalCurrentlyHospitalized, title: `Currently Hospitalized ${titlesuffix}`, subtitle});
      if (topicStats.totalCurrentlyInICU) caseSections.hospitalizations.stat.push({value: topicStats.totalCurrentlyInICU, title: `Currently in ICU ${titlesuffix}`, subtitle});
      if (topicStats.totalCurrentlyOnVentilator) caseSections.hospitalizations.stat.push({value: topicStats.totalCurrentlyOnVentilator, title: `Currently on Ventilator ${titlesuffix}`, subtitle});
    }

    const sparklineBuckets = 20;
    const tableData = nest()
      .key(d => d["ID Geography"])
      .entries(stateTestData.filter(d => d.Confirmed > 0))
      .map(group => {

        const curveData = group.values.filter(d => d.ConfirmedSmooth >= 100);

        const d = {...group.values[group.values.length - 1]};

        if (curveData.length) {
          const xExtent = extent(curveData, d => d.ConfirmedSmooth);
          const yExtent = extent(curveData, d => d.ConfirmedGrowthSmooth);
          if (!yExtent[0]) yExtent[0] = 1;

          const xScale = scaleLog()
            .domain(xExtent)
            .range([1, sparklineBuckets]);

          const yScale = scaleLog()
            .domain(yExtent)
            .range([1, 100]);

          const data = [];
          for (let i = 0; i < sparklineBuckets; i++) {
            const cases = Math.floor(xScale.invert(i + 1));
            const index = curveData.findIndex(d => d.ConfirmedSmooth >= cases);
            const datum = curveData[index - 1] || curveData[index];
            data.push(yScale(datum.ConfirmedGrowthSmooth || 1));
          }
          d.Curve = data;
        }

        const last14 = group.values.slice(-14);
        d.NewCases = last14.map(d => d.ConfirmedGrowthSmooth);
        d.ConfirmedGrowth14 = sum(last14, d => d.ConfirmedGrowth);
        d.ConfirmedGrowth14PC = d.ConfirmedGrowth14 * 100000 / pops[group.key];
        d.Trend = (d.NewCases[d.NewCases.length - 1] - d.NewCases[0]) / d.NewCases[0] * 100;

        return d;

      })
      .sort((a, b) => {
        if (typeof a[tableOrder] === "string") {
          return tableSort === "asc"
            ? a[tableOrder].localeCompare(b[tableOrder])
            : b[tableOrder].localeCompare(a[tableOrder]);
        }
        return tableSort === "asc" ? a[tableOrder] - b[tableOrder] : b[tableOrder] - a[tableOrder];
      });

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
            <h1 className="profile-title">
              <p>{title}</p>
            </h1>
          </div>
          <div className="content-container">
            {today &&
              <div className="profile-subtitle">
                <p>Latest Data from {dayFormat(today)}</p>
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
                <div className="stat-title">Confirmed Cases</div>
                <div className="stat-value">
                  {show ? stats.totalCases : <Spinner />}
                </div>
                <div className="stat-subtitle">in the USA</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Deaths</div>
                <div className="stat-value">
                  {show ? stats.totalDeaths : <Spinner />}
                </div>
                <div className="stat-subtitle">in the USA</div>
              </div>
              <div className="Stat large-text">
                <div className="stat-title">Hospitalizations</div>
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
              <div className="topic Column StateTable">
                <table className="state-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="Geography" onClick={this.updateTableSort.bind(this, "Geography")}>
                        State
                        <Icon className={`sort-caret ${tableOrder === "Geography" ? "active" : ""}`} icon={tableOrder === "Geography" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Trend" onClick={this.updateTableSort.bind(this, "Trend")}>
                        14-day Trend of New Cases
                        <Icon className={`sort-caret ${tableOrder === "Trend" ? "active" : ""}`} icon={tableOrder === "Trend" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="ConfirmedGrowth14" onClick={this.updateTableSort.bind(this, "ConfirmedGrowth14")}>
                        14-Day New<br />Cases
                        <Icon className={`sort-caret ${tableOrder === "ConfirmedGrowth14" ? "active" : ""}`} icon={tableOrder === "ConfirmedGrowth14" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="ConfirmedGrowth14PC" onClick={this.updateTableSort.bind(this, "ConfirmedGrowth14PC")}>
                        14-Day New Cases<br />per 100,000
                        <Icon className={`sort-caret ${tableOrder === "ConfirmedGrowth14PC" ? "active" : ""}`} icon={tableOrder === "ConfirmedGrowth14PC" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Confirmed" onClick={this.updateTableSort.bind(this, "Confirmed")}>
                        Confirmed<br />Cases
                        <Icon className={`sort-caret ${tableOrder === "Confirmed" ? "active" : ""}`} icon={tableOrder === "Confirmed" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="ConfirmedPC" onClick={this.updateTableSort.bind(this, "ConfirmedPC")}>
                        Cases per<br />100,000
                        <Icon className={`sort-caret ${tableOrder === "ConfirmedPC" ? "active" : ""}`} icon={tableOrder === "ConfirmedPC" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Deaths" onClick={this.updateTableSort.bind(this, "Deaths")}>
                        Confirmed<br />Deaths
                        <Icon className={`sort-caret ${tableOrder === "Deaths" ? "active" : ""}`} icon={tableOrder === "Deaths" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="PositivePct" onClick={this.updateTableSort.bind(this, "PositivePct")}>
                        % Positive<br />Tests
                        <Icon className={`sort-caret ${tableOrder === "PositivePct" ? "active" : ""}`} icon={tableOrder === "PositivePct" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Tests" onClick={this.updateTableSort.bind(this, "Tests")}>
                        Total<br />Tests
                        <Icon className={`sort-caret ${tableOrder === "Tests" ? "active" : ""}`} icon={tableOrder === "Tests" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="CurrentlyHospitalized" onClick={this.updateTableSort.bind(this, "CurrentlyHospitalized")}>
                        Currently<br />Hospitalized
                        <Icon className={`sort-caret ${tableOrder === "CurrentlyHospitalized" ? "active" : ""}`} icon={tableOrder === "CurrentlyHospitalized" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Hospitalized" onClick={this.updateTableSort.bind(this, "Hospitalized")}>
                        Total<br />Hospitalized
                        <Icon className={`sort-caret ${tableOrder === "Hospitalized" ? "active" : ""}`} icon={tableOrder === "Hospitalized" ? `caret-${tableSort === "desc" ? "down" : "up"}` : "double-caret-vertical"} />
                      </th>
                      <th className="Curve">
                        Total vs New Cases
                        <Popover
                          hoverOpenDelay={0}
                          hoverCloseDelay={0}
                          interactionKind={PopoverInteractionKind.HOVER}
                          placement="bottom-end"
                          content="This curve show daily new cases vs total confirmed cases (both logarithmic) since reaching 100 confirmed cases. This gives us a good look at how the outbreak is slowing down (decreasing slope), stabilizing (straight horizontal line), or spreading (increasing slope).">
                          <Icon iconSize={12} icon="help" />
                        </Popover>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    { tableData.length
                      ? tableData.map((d, i) =>
                        <tr key={i} id={`state-${d["ID Geography"]}`} className={`state-table-row ${currentStates.find(s => s["ID Geography"] === d["ID Geography"]) ? "selected" : ""}`} onClick={this.updateStates.bind(this, d)}>
                          <td className="checkbox">
                            <div className={`checkbox-fake ${d["ID Geography"] === "01000US" && currentStates.length === 1 && currentStates.find(s => s["ID Geography"] === d["ID Geography"]) ? "disabled" : ""}`}>
                              <Icon icon="small-tick" />
                            </div>
                          </td>
                          <td className="Geography">{d.Geography}</td>
                          <td className={`Trend ${d.Trend < -5 ? "decreasing" : d.Trend > 5 ? "increasing" : "flat"}`}>
                            <Sparklines svgWidth={100} svgHeight={30} data={d.NewCases}>
                              <SparklinesCurve style={{
                                fill: "none",
                                stroke: d.Trend < -5 ? styles.soc : d.Trend > 5 ? styles.red : styles.gray,
                                strokeWidth: 2
                              }} />
                            </Sparklines>
                            <div>
                              {d.Trend > 0 ? "+" : ""}{formatAbbreviate(d.Trend)}%
                            </div>
                          </td>
                          <td className="ConfirmedGrowth14">{commas(d.ConfirmedGrowth14)}</td>
                          <td className="ConfirmedGrowth14PC">{commas(Math.round(d.ConfirmedGrowth14PC))}</td>
                          <td className="Confirmed">{commas(d.Confirmed)}</td>
                          <td className="ConfirmedPC">{commas(Math.round(d.ConfirmedPC))}</td>
                          <td className="Deaths">{commas(d.Deaths)}</td>
                          <td className="PositivePct">{formatAbbreviate(d.PositivePct)}%</td>
                          <td className="Tests">{formatAbbreviate(d.Tests)}</td>
                          <td className="CurrentlyHospitalized">{d.CurrentlyHospitalized ? commas(d.CurrentlyHospitalized) : <span className="state-table-na">N/A</span>}</td>
                          <td className="Hospitalized">{typeof d.Hospitalized === "number" ? commas(d.Hospitalized) : <span className="state-table-na">N/A</span>}</td>
                          <td className="Curve">
                            <Sparklines svgWidth={100} svgHeight={30} data={d.Curve}>
                              <SparklinesCurve style={{
                                fill: "none",
                                stroke: d.Trend < -5 ? styles.soc : d.Trend > 5 ? styles.red : styles.gray,
                                strokeWidth: 2
                              }} />
                            </Sparklines>
                          </td>
                        </tr>
                      )
                      : range(0, 56, 1).map((d, i) =>
                        <tr key={i} className="state-table-row">
                          <td colSpan={15} className="spinner">
                            <Spinner className="bp3-small" />
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
              <div className="topic TextViz">
                <div className="topic-content">
                  <TopicTitle
                    slug="cases-total"
                    title={currentSection.title}
                  />
                  { currentSection.subtitle
                    ?  <div className="topic-subtitle">{currentSection.subtitle}</div>
                    : null
                  }
                  <AxisToggle />
                  <CaseSelector />
                  <Checkbox disabled={!allowSmooth} label="7-day Rolling Average" checked={currentCaseSmooth && allowSmooth} onChange={this.changeSmooth.bind(this)}/>
                  <Checkbox disabled={!allowPC || currentCaseInternational} label="Per Capita" checked={currentCaseInternational || currentCasePC && allowPC} onChange={this.changePC.bind(this)}/>
                  <Checkbox disabled={currentCaseInternational} label="Shift Time Axis" checked={currentCaseReach || currentCaseInternational} onChange={this.changeReach.bind(this)}/>
                  <Checkbox disabled={!(isCases || isDeaths)} label="International Comparison" checked={currentCaseInternational} onChange={this.changeInternational.bind(this)}/>
                  {(currentCaseReach || currentCaseInternational) && <CutoffToggle />}
                  {currentSection.stat ?
                    <div className="topic-stats">
                      {
                        Array.isArray(currentSection.stat) ?
                          currentSection.stat.map(stat => (
                            <div className="StatGroup single">
                              <div className="stat-value">{stat.value}</div>
                              <div className="stat-title">{stat.title}</div>
                              <div className="stat-subtitle">{stat.subtitle}</div>
                            </div>
                          ))
                        :
                        <div className="StatGroup single">
                          <div className="stat-value">{currentSection.stat.value}</div>
                          <div className="stat-title">{currentSection.stat.title}</div>
                          <div className="stat-subtitle">{currentSection.stat.subtitle}</div>
                        </div>
                      }
                    </div>
                    : null
                  }
                  <div className="topic-description">
                    {currentSection.descriptions.map(d => <p key={d}>{d}</p>)}
                  </div>
                  <div className="SourceGroup">
                    For more information about the difference between linear and
                    logarithmic scale,{" "}
                    <AnchorLink to="faqs-growth">click here</AnchorLink>.
                  </div>
                  <SourceGroup sources={currentSection.sources} />
                </div>
                <div className="visualization topic-visualization">
                  { currentSection.showCharts
                    ? <LinePlot className="d3plus" config={assign({}, sharedConfig, currentSection.lineConfig)} />
                    : <NonIdealState title="Loading Data..." icon={<Spinner />} /> }
                  <StateSelector />
                </div>
                {/* <div className="visualization topic-visualization">
                  { currentSection.showCharts
                    ? <Geomap className="d3plus" config={assign({}, geoStateConfig, currentSection.geoConfig)} />
                    : <NonIdealState title="Loading Data..." icon={<Spinner />} /> }
                </div> */}
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
                  <label className="bp3-label bp3-inline">
                    Place Category
                    <div className="bp3-select">
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
                        // title: `Change of ${mobilityType} Mobility`,
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
                      icon={<Spinner />}
                    />
                  }
                  <StateSelector />
                </div>
                {/* <div className="visualization topic-visualization">
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
                      icon={<Spinner />}
                    />
                  }
                </div> */}
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
                    { !onlyNational
                      ? <div className="StatGroup single">
                        <div className="stat-value">
                          {show
                            ? formatAbbreviate(employmentStatStates)
                            : <Spinner />
                          }
                        </div>
                        <div className="stat-title">
                        Initial Unemployment insurance claims in{" "}
                          {list(currentStates.filter(d => d["ID Geography"] !== "01000US").map(o => o.Geography))}
                        </div>
                        <div className="stat-subtitle">
                          {show
                            ? `since the week ending ${dayFormat(employmentDate)}`
                            : ""}
                        </div>
                      </div>
                      : null }
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
                  <div className="SourceGroup">
                    For more information about the difference between linear and
                    logarithmic scale,{" "}
                    <AnchorLink to="faqs-growth">click here</AnchorLink>.
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
                        // title: `Initial Unemployment Insurance Claims (${scaleLabel})`,
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
                        y: "initial_claims",
                        yConfig: {
                          scale,
                          tickFormat: formatAbbreviate
                        }
                      })}
                    />
                    :                     <NonIdealState
                      title="Loading Data..."
                      icon={<Spinner />}
                    />
                  }
                  <StateSelector />
                </div>
                {/* <div className="visualization topic-visualization">
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
                      icon={<Spinner />}
                    />
                  }
                </div> */}
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
                      icon={<Spinner />}
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
                      icon={<Spinner />}
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
                      icon={<Spinner />}
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
                      icon={<Spinner />}
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
                      icon={<Spinner />}
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
)(hot(Coronavirus));
