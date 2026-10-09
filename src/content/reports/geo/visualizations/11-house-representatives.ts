// Converted from legacy canon_cms_section_visualization #11 "section house-representatives" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {id, tesseract} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;
  const {titleCase} = libs.d3plus;

  const order: any = ["Democratic", "Republican", "Democratic Farmer Labor"];

  const legendLabel = (d: any) => {
    if (d.Party instanceof Array) {
      const parties = d.Party.map((d: any) => d.toLowerCase());
      const label = parties.some((d: any) => d.includes("green") && !d.includes("rainbow")) ? "Multiple Green"
        : parties.some((d: any) => d.includes("libertarian")) ? "Multiple Libertarian"
        : parties.some((d: any) => d.includes("independen") && !d.includes("democrat/republican") && !d.includes("veteran") && !d.includes("constitution")) ? "Multiple Independent" 
        : "Multiple";
      return `${label} Parties`;
    }
    return titleCase(d.Party.replace(/-/g, " "));
  }

  return {
    aggs: {
      "Party ID": (arr: any, acc: any) => acc(arr[0])
    },
    data: `${tesseract}tesseract/data?Special=0&cube=Data_USA_House_Compact_election&drilldowns=Special,Year,Party&measures=Winner+Votes`,
    dataFormat: (resp: any) => {
      const data = resp.data;
   
      const yearSums = nest()
        .key((d: any) => d.Year)
        .entries(data)
        .reduce((obj: any, group: any) => {
          obj[group.key] = sum(group.values, (d: any) => d["Winner Votes"]);
          return obj;
        }, {});

      data.forEach((d: any) => {
        d.Share = d["Winner Votes"] / yearSums[d.Year] * 100;
        d["Party ID"] = d["Party"];
        d["Party"] = titleCase(d.Party.replace(/-/g, " "))
      });
 
      return data;
    },
    discrete: "x",
    groupBy: "Party",//(d: any) => titleCase(d.Party.replace(/-/g, " ")),
    legendConfig: {
      label: legendLabel
    },
    legendTooltip: {
      tbody: [
        [(d: any) => `Active Year${d.Year instanceof Array ? "s" : ""}`, (d: any) => d.Year instanceof Array ? `${d.Year[d.Year.length - 1]} - ${d.Year[0]}` : d.Year]
      ],
      //title: legendLabel
    },
    stackOrder: order,
    // time: "Year",
    // timeline: false,
    tooltipConfig: {
    
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Vote Share", (d: any) => `${abbreviate(d.Share)}%`]
      ]
    },
    type: "StackedArea",
    x: "Year",
    xConfig: {
      gridConfig: {
        "stroke-width": 1
      },
      tickFormat: (d: any) => `'${`${d}`.slice(2, 4)}`,
      tickSize: 5
    },
    y: "Share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d)}%`,
      title: "Vote Share"
    }
  }
};

export default viz;
