import React, {Component} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import {Helmet} from "react-helmet";

import {max, merge} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
const dayFormat = timeFormat("%A %B %d");
const dateFormat = timeFormat("%b %d");
const hourFormat = timeFormat("%I:%M %p");

import {colorLegible} from "d3plus-color";
import {assign, unique} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {LinePlot} from "d3plus-react";

import "./Coronavirus.css";
import {divisions, stateToDivision} from "helpers/stateDivisions";
import colors from "../../static/data/colors.json";
import {updateTitle} from "actions/title";

class Coronavirus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cutoff: 10,
      countries: false,
      data: false,
      date: false,
      level: "state",
      measure: "Confirmed",
      scale: "linear",
      title: `Coronavirus Outbreak by ${titleCase("state")}`
    };
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  componentDidMount() {
    const {title} = this.state;
    this.props.updateTitle(title);
    axios.get("/api/coronavirus/state")
      .then(resp => resp.data)
      .then(resp => {

        const data = resp.data
          .map(d => {
            d.Date = new Date(d.Date).getTime();
            d.ConfirmedPC = d.Confirmed / resp.population[d["ID Geography"]] * 100000;
            if (d.Level === "state") {
              const dID = stateToDivision[d["ID Geography"]];
              let division = divisions.find(x => x["ID Division"] === dID);
              if (!division) division = divisions.find(x => x["ID Division"] === 5);
              return Object.assign(d, division);
            }
            return d;
          });

        const countries = resp.countries
          .map(d => {
            d.Date = new Date(d.Date).getTime();
            d.ConfirmedPC = d.Confirmed / resp.world[d.Geography] * 100000;
            return d;
          });

        this.setState({countries, data, date: new Date(resp.timestamp)});
      })
      .catch(() => this.setState({data: "Error loading data, please try again later."}));
  }

  changeCutoff(event) {
    this.setState({cutoff: +event.target.value});
  }

  changeScale(event) {
    this.setState({scale: event.target.value});
  }

  render() {

    const {countries, cutoff, data, date, level, measure, scale, title} = this.state;

    const w = typeof window !== "undefined" ? window.innerWidth : 1200;

    const filteredData = data instanceof Array ? data.filter(d => d.Level === level) : [];

    const vizData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(filteredData)
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
      }).sort((a, b) => max(b, d => d[measure]) - max(a, d => d[measure])));

    const maxValue = max(vizData, d => d[measure]);
    const maxValuePC = max(vizData, d => d[`${measure}PC`]);
    const maxValueWorldPC = max(countries, d => d[`${measure}PC`]);
    const minValue = scale === "log" ? 1 : 0;

    const showLabel = {};
    const labelSpace = 5;
    nest()
      .key(d => d["ID Geography"])
      .entries(vizData)
      .forEach(group => {
        const d = group.values[group.values.length - 1];
        const compares = vizData
          .filter(v => v.Days === d.Days)
          .sort((a, b) => a[measure] - b[measure]);
        const i = compares.indexOf(d);
        const prevDiff = compares[i - 1] ? d[measure] - compares[i - 1][measure] : Infinity;
        const nextDiff = compares[i + 1] ? compares[i + 1][measure] - d[measure] : Infinity;
        if (prevDiff > labelSpace || nextDiff > labelSpace) {
          showLabel[group.key] = true;
        }
      });

    let daysDomain = [];
    if (vizData.length) {
      daysDomain = unique(vizData.map(d => d.Days)).sort();
      const lastDays = daysDomain[daysDomain.length - 1];
      daysDomain.push(lastDays + 1);
    }

    let dateDomain = [];
    if (vizData.length) {
      dateDomain = unique(vizData.map(d => d.Date)).sort();
      const lastDate = new Date(dateDomain[dateDomain.length - 1]);
      const nextDate = lastDate.setDate(lastDate.getDate() + 1);
      dateDomain.push(nextDate);
    }

    let worldDomain = [];
    if (vizData.length) {
      worldDomain = unique(countries.map(d => d.Date)).sort();
      let lastDate = worldDomain[worldDomain.length - 1];
      const endDate = lastDate + (lastDate  - worldDomain[0]) / 15;
      lastDate = new Date(lastDate);
      while (worldDomain[worldDomain.length - 1] < endDate) {
        lastDate.setDate(lastDate.getDate() + 1);
        worldDomain.push(lastDate.getTime());
      }
    }

    const labelWidth = daysDomain.length ? w / (daysDomain[daysDomain.length - 1] + 1) : 0;

    const sharedConfig = {
      aggs: {
        "ID Division": arr => arr[0],
        "ID Region": arr => arr[0]
      },
      data: vizData,
      discrete: "x",
      groupBy: ["ID Region", "ID Geography"],
      label: d => d.Geography instanceof Array ? d.Region : d.Geography,
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
          label: d => d.Geography,
          labelConfig: {
            fontColor: d => colorLegible(colors.Region[d["ID Region"]]),
            fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
            fontSize: () => 14,
            padding: 0,
            verticalAlign: "middle"
          },
          labelBounds: (d, i, s) => {
            if (showLabel[d["ID Geography"]]) {
              const [firstX, firstY] = s.points[0];
              const [lastX, lastY] = s.points[s.points.length - 1];
              const height = 30;
              return   {
                x: lastX - firstX + 5,
                y: lastY - firstY - height / 2 + 1,
                width: labelWidth,
                height
              };
            }
            return false;
          },
          stroke: d => colors.Region[d["ID Region"]]
        }
      },
      tooltipConfig: {
        tbody: [
          ["Date", d => dayFormat(new Date(d.Date))],
          ["Confirmed", d => formatAbbreviate(d.Confirmed)],
          ["Cases per 100,000", d => formatAbbreviate(d.ConfirmedPC)],
          ["Recovered", d => formatAbbreviate(d.Recovered)],
          ["Deaths", d => formatAbbreviate(d.Deaths)]
        ]
      },
      y: measure,
      yConfig: {
        barConfig: {
          stroke: "transparent"
        },
        domain: [minValue, maxValue],
        scale,
        tickFormat: formatAbbreviate,
        title: `${measure}${measure !== "Deaths" ? " Cases" : ""} (${scale === "log" ? "Logarithmic" : "Linear"})`
      }
    };

    return <div id="Coronavirus">

      <Helmet title={title}>
        <meta property="og:title" content={ `${title} | Data USA` } />
      </Helmet>

      <p className="coronavirus-source">Data is sourced from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noopener noreferrer">Johns Hopkins CSSE</a>.</p>
      { date && <p className="coronavirus-updated-at">Last updated on {dayFormat(date)} at {hourFormat(date)}.</p> }

      { data && data instanceof Array
        ? <div id="coronavirus-main">
          <div className="coronavirus-viz">
            <h2>Confirmed Cases Over Time</h2>
            <p>Y-Axis Scale <select value={scale} onChange={this.changeScale.bind(this)}>
              <option value="linear">Linear</option>
              <option value="log">Logarithmic</option>
            </select></p>
            <LinePlot config={assign({}, sharedConfig, {
              x: "Date",
              xConfig: {
                domain: dateDomain,
                tickFormat: dateFormat
              }
            })} />
          </div>
          <div className="coronavirus-viz">
            <h2>Days Since <select value={cutoff} onChange={this.changeCutoff.bind(this)}>
              <option value="1">1</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select> Confirmed Cases</h2>
            <p>Y-Axis Scale <select value={scale} onChange={this.changeScale.bind(this)}>
              <option value="linear">Linear</option>
              <option value="log">Logarithmic</option>
            </select></p>
            <LinePlot config={assign({}, sharedConfig, {
              x: "Days",
              xConfig: {
                domain: daysDomain,
                tickFormat: d => `${formatAbbreviate(d)} day${d !== 1 ? "s" : ""}`,
                title: `Days Since ${cutoff} Confirmed Cases`
              }
            })} />
          </div>
          <div className="coronavirus-viz">
            <h2>Confirmed Cases per 100,000 Population</h2>
            <LinePlot config={assign({}, sharedConfig, {
              x: "Date",
              xConfig: {
                domain: dateDomain,
                tickFormat: dateFormat
              },
              y: `${measure}PC`,
              yConfig: {
                domain: [0, maxValuePC],
                scale: "linear",
                title: `${measure}${measure !== "Deaths" ? " Cases" : ""} per 100,000`
              }
            })} />
          </div>
          <div className="coronavirus-viz">
            <h2>United States Compared to Most Highly Effected Countries</h2>
            <LinePlot config={assign({}, sharedConfig, {
              data: countries,
              groupBy: "Geography",
              label: d => d.Geography instanceof Array ? "International" : d.Geography,
              on: {
                mouseenter(d) {
                  if (d.Geography instanceof Array) this.hover(h => (h.data || h).Geography === d.Geography);
                  else this.hover(h => h.Geography === d.Geography);
                }
              },
              shapeConfig: {
                Line: {
                  labelConfig: {
                    fontColor: d => colorLegible(d.Geography === "United States" ? colors.colorHighlight : colors.colorGrey)
                  },
                  labelBounds: (d, i, s) => {
                    const [firstX, firstY] = s.points[0];
                    const [lastX, lastY] = s.points[s.points.length - 1];
                    const height = 30;
                    return   {
                      x: lastX - firstX + 5,
                      y: lastY - firstY - height / 2 + 1,
                      width: labelWidth,
                      height
                    };
                  },
                  stroke: d => d.Geography === "United States" ? colors.colorHighlight : colors.colorGrey
                },
                sort: a => a.Geography === "United States" ? 1 : -1
              },
              x: "Date",
              xConfig: {
                domain: worldDomain,
                tickFormat: dateFormat
              },
              y: `${measure}PC`,
              yConfig: {
                domain: [0, maxValueWorldPC],
                scale: "linear",
                title: `${measure}${measure !== "Deaths" ? " Cases" : ""} per 100,000`
              }
            })} />
          </div>
        </div>
        : typeof data === "string" ? <NonIdealState title={data} visual="error" />
          : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }

    </div>;

  }

}

export default connect(null, dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Coronavirus);
