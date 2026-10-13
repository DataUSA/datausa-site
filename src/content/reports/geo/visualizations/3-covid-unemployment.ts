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

  const quarterFormat = timeFormat("%b");
  const yearFormat = timeFormat("%Y");
  // a tick every three months, up to the sheet's last week (the DOL stopped updating it in August 2021)
  const lastWeek = new Date(2021, 7, 28).getTime();
  const quarters: number[] = [];
  for (let date = new Date(2018, 3, 1); date.getTime() < lastWeek; date.setMonth(date.getMonth() + 3)) quarters.push(date.getTime());

  const highlightIDs: any = [stateNeighbors];
  const highlightNames = covidGeoName || "Nation";

  return {
    // only the weeks the chart draws (see `cutoffDate`); the whole sheet is 8.9 MB
    data: "/api/covid19/employment/latest?since=2018-01-01",
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
    // d3plus 2 drew a tick every three months, named by month or by year ("Apr", "Jul", "Oct",
    // "2019"), and no vertical grid. Left to itself d3plus 4 picks uneven ticks, draws a grid line
    // on each and labels one of them with a full date ("Jan 1, 2021").
    xConfig: {
      gridConfig: {stroke: "transparent"},
      tickFormat: (d: any) => {
        const date = new Date(+d);
        return date.getMonth() ? quarterFormat(date) : yearFormat(date);
      },
      labels: quarters,
      ticks: quarters
    },
    y: "initial_claims",
    yConfig: {
      scale,
      title: `Unemployment Insurance Claims\n(${scaleName})`
    }
  }
};

export default viz;
