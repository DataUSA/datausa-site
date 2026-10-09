// Converted from legacy canon_cms_section_visualization #6 "section popular_vote" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {electionStackOrder, electionYears, electionVotesYear, tesseract,
        stateElectionIdTemp, hierarchyElectionSubTemp, id, hierarchy, colorParty, colorGrey} = variables;
  const {abbreviate} = formatters;
  const {nest, range, sum} = libs.d3;
  const {merge} = libs.d3plus;

  const legendLabel = (d: any) => {
    if (d.Party instanceof Array) {
      const parties = d.Party.map((d: any) => d.toLowerCase());
      const label = parties.some((d: any) => d.includes("green") && !d.includes("rainbow")) ? "Multiple Green"
        : parties.some((d: any) => d.includes("libertarian")) ? "Multiple Libertarian"
        : parties.some((d: any) => d.includes("independen") && !d.includes("democrat/republican") && !d.includes("veteran") && !d.includes("constitution")) ? "Multiple Independent" 
        : "Multiple";
      return `${label} Parties`;
    }
    return d.Party;
  }
  console.log(`${tesseract}tesseract/data?${hierarchyElectionSubTemp}=${stateElectionIdTemp}&cube=Data_USA_President_election&debug=false&drilldowns=Year,Candidate,Party,${hierarchyElectionSubTemp}&measures=Candidate+Votes,Total+Votes&parents=false&sparse=false`,)
  return {
    aggs: {
      "Party ID": (arr: any, acc: any) => acc(arr[0])
    },
    data: `${tesseract}tesseract/data?${hierarchyElectionSubTemp}=${stateElectionIdTemp}&cube=Data_USA_President_election&debug=false&drilldowns=Year,Candidate,Party,${hierarchyElectionSubTemp}&measures=Candidate+Votes,Total+Votes&parents=false&sparse=false`,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      const yearMap = Array.from(new Set(data.map((d: any) => d.Year)));
      const geoMap = Array.from(new Set(data.map((d: any) => d[`${hierarchyElectionSubTemp } ID`])));
    
      const total: any = []
      yearMap.map((d: any) => 
        geoMap.map((g: any) => 
          total.push({
            "Year": d,
            "Geo": g,
            "Total": data.filter((p: any) => p[`${hierarchyElectionSubTemp } ID`] === g && p.Year*1 === d*1)[0]["Total Votes"]
          })
        )
      )
    
      data.forEach((d: any) => {
        if (d.Party === "Democratic-farmer-labor") {
          d.Party = "Democratic";
        }
        d["Party ID"] = d.Party
        d["Total Votes"] = total.filter((p: any) => p.Year === d.Year).reduce((sum: any, d: any) => sum + d.Total, 0)
      
        delete d[`${hierarchyElectionSubTemp } ID`]
        delete d[`${hierarchyElectionSubTemp }`]
      });
    
      return nest()
        .key((d: any) => `${d.Year}_${d.Party}`)
        .entries(data)
        .map((group: any) => {
      
          const obj = merge(group.values);
          obj["Total Votes"] = obj["Total Votes"] / group.values.length 
          obj.Share = obj["Candidate Votes"] / obj["Total Votes"] * 100;
          obj.Year = obj.Year / group.values.length 
   
          return obj;
        })
        .filter((d: any) => d.Share >= 0);
      //  .filter((d: any) => d["Year"]*1 <= 2024 && d.Share >= 0);
    },
    discrete: "x",
    groupBy: "Party",
    legendConfig: {
      label: legendLabel
    },
    legendTooltip: {
      tbody: [
        [(d: any) => `Active Year${d.Year instanceof Array ? "s" : ""}`, (d: any) => d.Year instanceof Array ? `${d.Year[d.Year.length - 1]} - ${d.Year[0]}` : d.Year],
        ["Recent Candidate", (d: any) => d.Candidate instanceof Array ? d.Candidate[0] : d.Candidate]
      ],
      title: legendLabel
    },
    stackOrder: electionStackOrder,
    time: "Year",
    timeline: false,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Candidate", (d: any) => d.Candidate],
        ["Votes", (d: any) => abbreviate(d["Candidate Votes"])],
        ["Share", (d: any) => `${abbreviate(d.Share)}%`]
      ]
    },
    type: "StackedArea",
    x: "Year",
    xConfig: {
      gridConfig: {
        "stroke-width": 1
      },
      labels: electionYears,
      tickFormat: (d: any) => `'${`${new Date(d).getFullYear()}`.slice(2, 4)}`,
      ticks: electionYears,
      tickSize: 5,
      title: "Election Years"
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
