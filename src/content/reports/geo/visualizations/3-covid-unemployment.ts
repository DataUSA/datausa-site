// Converted from legacy canon_cms_section_visualization #3 "section covid-unemployment" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, covidGeoName, covidGeoIDs, id, stateNeighbors, stateDataID} = variables;
  const {nest, max, range, sum, timeFormat} = libs.d3;
  const {abbreviate} = formatters;

  const suffixes: any = ["th", "st", "nd", "rd"];
  function suffix(number: any) {
    const tail = number % 100;
    return suffixes[((tail < 11 || tail > 13) && tail % 10) as any] || suffixes[0];
  }

  const d3WeekFormat = timeFormat("%B %d, %Y");
  const weekFormat = (d: any) => d3WeekFormat(d).replace(/\s[0-9]{2}\,/, (m: any) => {
    const n = parseFloat(m);
    return ` ${n}${suffix(n)},`;
  });

  const scaleName: string = "Logarithmic";
  const scale: string = "log";

  const cutoffDate = new Date("2018/01/01").getTime();

  const highlightIDs: any = [stateNeighbors];
  const highlightNames = covidGeoName || "Nation";

  return {
    data: "/api/covid19/employment/latest/",
    dataFormat: (resp: any) => {

      let data = resp.data
        .map((d: any) => {
          d.Timestamp = new Date(d.week_ended.replace(/\-/g, "/")).getTime();
          d.Date = weekFormat(d.Timestamp);
          d["ID Geography"] = d.fips_code;
          d["Geography"] = d.state_name;
          return d;
        })
        .filter((d: any) => d.Timestamp > cutoffDate);
      
      if (id === "01000US") {
        data = nest()
          .key((d: any) => d.Date)
          .entries(data)
          .map((group: any) => {
            const d = group.values[0];
            d.Geography = "United States";
            d["ID Geography"] = "01000US";
            ["initial_claims", "continued_claims", "covered_employment"].forEach((key: any) => {
              d[key] = sum(group.values, (d: any) => d[key]);
            });
            return d;
          });
      }
      else {
        const latestTimestamp = max(data, (d: any) => d.Timestamp);
        const latestData = data
          .filter((d: any) => d.Timestamp === latestTimestamp)
          .sort((a: any, b: any) => b.initial_claims - a.initial_claims);
        const index = latestData.findIndex((d: any) => [stateDataID,stateNeighbors].includes(d["ID Geography"]));
        const start = index >= 2 ? index <= latestData.length - 3 ? index - 2 : latestData.length - 6 : 0;
        const end = index <= latestData.length - 3 ? index >= 2 ? index + 3 : 6 : latestData.length;
        const topIds = latestData.slice(start, end).map((d: any) => d["ID Geography"]);
        [stateNeighbors].forEach((id: any) => {
          if (!topIds.includes(id)) topIds.push(id);
        });
        data = data.filter((d: any) => topIds.includes(d["ID Geography"]));
      }
      return data;
    },
    groupBy: [(d: any) => highlightIDs.includes(d["ID Geography"]) || d["ID Geography"] instanceof Array && d["ID Geography"].every((id: any) => highlightIDs.includes(id)) ? highlightNames : "Similar States", "Geography"],
    legendTooltip: {
      title: (d: any) => highlightIDs.includes(d["ID Geography"]) || d["ID Geography"] instanceof Array && d["ID Geography"].every((id: any) => highlightIDs.includes(id)) ? highlightNames : "Similar States",
      tbody: false
    },
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          fontColor: (d: any) => d["ID Geography"] === variables.stateDataID ? colorHighlight : colorGrey, //highlightIDs.includes(d["ID Geography"])
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12
        },
        sort: (a: any, b: any) => highlightIDs.includes(a["ID Geography"]) ? 1 : -1,
        stroke: (d: any) => variables.hierarchy === "Nation" || d["ID Geography"] === variables.stateDataID ? colorHighlight : colorGrey,//highlightIDs.includes(d["ID Geography"]) || d["ID Geography"] instanceof Array && d["ID Geography"].every((id: any) => highlightIDs.includes(id)) ? colorHighlight : colorGrey,
        strokeWidth: 2
      }
    },
    time: "Timestamp",
    timeline: false,
    tooltipConfig: {
      title: (d: any) => d.Geography,
      tbody: [
        ["Week Ending", (d: any) => d.Date],
        ["Initial Claims", (d: any) => abbreviate(d.initial_claims)]
      ]
    },
    type: "LinePlot",
    x: "Timestamp",
    y: "initial_claims",
    yConfig: {
      scale,
      title: `Unemployment Insurance Claims\n(${scaleName})`
    }
  }
};

export default viz;
