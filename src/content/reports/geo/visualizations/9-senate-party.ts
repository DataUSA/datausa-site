// Converted from legacy canon_cms_section_visualization #9 "section senate-party" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {id, senateStackOrder, senatorYears, tesseract, colorParty, colorGrey} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;
  const {titleCase} = libs.d3plus;

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
    data: `${tesseract}tesseract/data?Special=0&cube=Data_USA_Senate_election&drilldowns=Year,Special,Party&measures=Candidate+Votes`,
    dataFormat: (resp: any) => {
      const data = resp.data;
   
      data.forEach((d: any) => {
        d["Party ID"] = d.Party
        d["Senate Candidate Votes"] = d["Candidate Votes"]
      });
    
      data.forEach((d: any) => delete d["Candidate Votes"])
  
      const yearSums = nest()
        .key((d: any) => d.Year)
        .entries(data)
        .reduce((obj: any, group: any) => {
          obj[group.key] = sum(group.values, (d: any) => d["Senate Candidate Votes"]);
          return obj;
        }, {});
    
      const dataEnd = nest()
        .key((d: any) => `${d.Year}_${d.Party}`)
        .entries(data)
        .map((group: any) => {
          const d = group.values[0];
          if (group.values.length > 1) {
            d["Senate Candidate Votes"] = sum(group.values, (v: any) => v["Senate Candidate Votes"]);
            d.Candidate = group.values.map((v: any) => v.Candidate);
          }
          d.Share = d["Senate Candidate Votes"] / yearSums[d.Year] * 100;
          return d;
        });
      
      return dataEnd;
    },
    discrete: "x",
    groupBy: "Party",
    //label: (d: any) => titleCase(d.Party.replace(/-/g, " ")),
    legendConfig: {
      label: legendLabel
    },
    legendTooltip: {
      tbody: [
        [(d: any) => `Active Year${d.Year instanceof Array ? "s" : ""}`, (d: any) => d.Year instanceof Array ? `${d.Year[d.Year.length - 1]} - ${d.Year[0]}` : d.Year]
      ],
      title: legendLabel
    },
    stackOrder: senateStackOrder,
    // time: "Year",
    timeline: false,
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
    },
    shapeConfig: {
      fill: (d: any) => colorParty[d.Party] || colorGrey
    }
  }
};

export default viz;
