import React, {Component} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import {Helmet} from "react-helmet";

import {extent, max, merge, range} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
const dayFormat = timeFormat("%A %B %d");
const hourFormat = timeFormat("%I:%M %p");

import {colorLegible} from "d3plus-color";
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
      data: false,
      date: false,
      level: "state",
      measure: "Confirmed",
      title: `Coronavirus Outbreak by ${titleCase("state")}`
    };
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  componentDidMount() {
    const {title} = this.state;
    this.props.updateTitle(title);
    axios.get("/api/coronavirus/all")
      .then(resp => resp.data)
      .then(resp => {
        const data = resp.data.map(d => {
          if (d.Level === "state") {
            const dID = stateToDivision[d["ID Geography"]];
            let division = divisions.find(x => x["ID Division"] === dID);
            if (!division) division = divisions.find(x => x["ID Division"] === 5);
            return Object.assign(d, division);
          }
          return d;
        });
        this.setState({data, date: new Date(resp.timestamp)});
      })
      .catch(() => this.setState({data: "Error loading data, please try again later."}));
  }

  changeCutoff(event) {
    this.setState({cutoff: +event.target.value});
  }

  render() {

    const {cutoff, data, date, level, measure, title} = this.state;

    const filteredData = data instanceof Array ? data.filter(d => d.Level === level) : [];

    const vizData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(filteredData)
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d, i) => {
            if (d.Confirmed >= cutoff) {
              if (days === 0) {
                const starter = group.values[i - 1];
                starter.Days = days;
                arr.push(starter);
              }
              days++;
              d.Days = days;
              arr.push(d);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d[measure]) - max(a, d => d[measure])));

    const maxValue = max(vizData, d => d[measure]);
    const ratio = window.innerHeight / maxValue;

    const labelOffsets = {};
    nest()
      .key(d => d["ID Geography"])
      .entries(vizData)
      .forEach(group => {
        const d = group.values[group.values.length - 1];
        const compares = vizData
          .filter(v => v.Days === d.Days)
          .sort((a, b) => a[measure] - b[measure]);
        const i = compares.indexOf(d);
        const mod = Math.log10(d[measure]) / 0.5;
        const prevDiff = compares[i - 1] ? d[measure] - compares[i - 1][measure] : Infinity;
        const nextDiff = compares[i + 1] ? compares[i + 1][measure] - d[measure] : Infinity;
        if (prevDiff * ratio > mod && nextDiff * ratio > mod) {
          labelOffsets[group.key] = 0;
        }
      });

    let xDomain = [];
    if (vizData.length) {
      const xExtent = extent(vizData, d => d.Days);
      xDomain = range(xExtent[0], xExtent[1] + 2, 1);
    }
    const labelWidth = xDomain.length ? window.innerWidth / (xDomain[xDomain.length - 1] + 1) : 0;

    return <div id="Coronavirus">

      <Helmet title={title}>
        <meta property="og:title" content={ `${title} | Data USA` } />
      </Helmet>

      <div className="coronavirus-cutoff">Days Since <select value={cutoff} onChange={this.changeCutoff.bind(this)}>
        <option value="1">1</option>
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select> Confirmed Cases</div>

      <p className="coronavirus-source">Data is sourced from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noopener noreferrer">Johns Hopkins CSSE</a>.</p>
      { date && <p className="coronavirus-updated-at">Last updated on {dayFormat(date)} at {hourFormat(date)}.</p> }

      <div id="coronavirus-main-viz">
        { data && data instanceof Array
          ? <LinePlot config={{
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
            shapeConfig: {
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
                  const offset = labelOffsets[d["ID Geography"]];
                  if (offset !== undefined) {
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
                ["Recovered", d => formatAbbreviate(d.Recovered)],
                ["Deaths", d => formatAbbreviate(d.Deaths)]
              ]
            },
            x: "Days",
            xConfig: {
              domain: xDomain,
              tickFormat: d => `${formatAbbreviate(d)} day${d !== 1 ? "s" : ""}`,
              title: `Days Since ${cutoff} Confirmed Cases`
            },
            y: measure,
            yConfig: {
              barConfig: {
                stroke: "transparent"
              },
              domain: [1, maxValue],
              scale: "log",
              tickFormat: formatAbbreviate,
              title: `${measure}${measure !== "Deaths" ? " Cases" : ""} (log)`
            }
          }} />
          : typeof data === "string" ? <NonIdealState title={data} />
            : <NonIdealState title="Loading Data..." icon={<Spinner />} /> }
      </div>
    </div>;

  }

}

export default connect(null, dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Coronavirus);
