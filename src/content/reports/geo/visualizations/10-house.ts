// Converted from legacy canon_cms_section_visualization #10 "section house" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorParty, colorGrey, hierarchy, id, houseDistricts, stateIds, tesseract} = variables;
  const {abbreviate} = formatters;
  const {merge, min, nest, range, sum} = libs.d3;
  const {titleCase} = libs.d3plus;

  const district: any = hierarchy === "Congressional District" ? +id.slice(-2) : false;
  const houseTotal = district ? 1 : variables.houseTotal;

  const dataCalls = (hierarchy === "State" ? [id] : stateIds).map((d: any) => `${tesseract}tesseract/data?Special=0&State=${d}&cube=Data_USA_House_Compact_election&drilldowns=Party,Candidate,Year,Special,Congressional+District&measures=Winner+Votes,Total+Votes`);

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

  const minBarHeight = 20;
  const axisPadding = 125;
  let height = minBarHeight * houseTotal + axisPadding;
  let padding = 0.05;
  const maxHeight = 500;
  const barCutoff = Math.floor((maxHeight - axisPadding) / minBarHeight);
  if (houseTotal <= barCutoff) {
  
    const barSize = min([120, Math.floor((maxHeight - axisPadding) / houseTotal)]);
    height = barSize * houseTotal + axisPadding;
  
    const mod = ((houseTotal - 1) / (barCutoff - 1)) || 1;
    const maxPadding = 0.2;
    padding = maxPadding + (padding - maxPadding) * mod;
  
  }


  const thisYear = new Date().getFullYear();
  const ticks = range(2008, thisYear + 2, 2);

  return {
    aggs: {
      "Party ID": (arr: any, acc: any) => acc(arr[0])
    },
    axisConfig: {
      gridConfig: {
        "stroke-width": 1
      },
      labels: ticks,
      tickFormat: (d: any) => `'${`${new Date(d).getFullYear()}`.slice(2, 4)}`,
      ticks: ticks,
      tickSize: 5,
      title: "Election Years"
    },
    data: dataCalls,
    dataFormat: (resp: any) => {
    
      const arr = dataCalls.length > 1 ? merge(resp.map((r: any) => r.data)) : resp.data;
    
      arr.forEach((d: any) => {
        d["Winning Candidate"] = d["Candidate"];
        d["Winning Candidate ID"] = d["Candidate"];
      });
    
      const data = arr.filter((d: any) => {
        d.District = +d["Congressional District ID"].slice(-2);
        d.State = d["Congressional District"].slice(-2);
        if (d.Party === "Democratic-farmer-labor") {
          d.Party = "Democratic";
        }
        d["Party ID"] = d.Party;
        delete d.Candidate;
        // return houseDistricts.includes(d.District);
        return district ? d.District === district : true;
      })
   
      const candidates = nest()
        .key((d: any) => `${d["Winning Candidate"]}_${d["Congressional District ID"]}`)
        .entries(data)
        .reduce((arr: any, group: any) => {
        
          const terms = group.values
            .sort((a: any, b: any) => a["Year"] - b["Year"])
            .reduce((arr: any, d: any) => {
              d["Start Year"] = d["Year"];
              d["End Year"] = d["Year"] + 2;
              if (!arr.length || arr[arr.length - 1]["End Year"] !== d["Start Year"]) {
                arr.push(d);
              }
              else {
                arr[arr.length - 1]["End Year"] = d["End Year"];
              }
              return arr;
            }, []);
          
          arr = arr.concat(terms);
        
          return arr;
        }, [])
        .sort((a: any, b: any) => a["End Year"] - b["End Year"])
        .sort((a: any, b: any) => b["District"] - a["District"]);
      
      return candidates;
    },
    depth: 1,
    end: "End Year",
    groupBy: ["Congressional District ID", (d: any) => `${d["Winning Candidate"]}_${d["Start Year"]}`],
    height,
    label: (d: any) => d["Winning Candidate"],
    legendConfig: {
      label: legendLabel
    },
    legendTooltip: {
      tbody: [],
      title: legendLabel
    },
    paddingInner: padding,
    paddingOuter: padding,
    shapeConfig: {
      fill: (d: any) => colorParty[d.Party] || colorGrey,
      Rect: {
        labelBounds: (d: any, i: any, s: any) => {
          const h = s.height;
          const w = s.width;
          const hPadding = h >= 20 ? 3 : 1;
          const wPadding = 5;
          return {width: w - wPadding * 2, height: h - hPadding * 2, x: -w / 2 + wPadding, y: -h / 2 + hPadding};
        },
        labelConfig: {
          fontMax: 24,
          padding: 0,
          verticalAlign: "middle"
        }
      }
    },
    start: "Start Year",
    tooltipConfig: {
      title: (d: any) => {
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="title-without-icon"><span>${d["Winning Candidate"]}</span></div>
            <div class="subtitle"><span>Winning Candidate</span></div>
          </div>
        `
      },
      tbody: [
        ["District", (d: any) => dataCalls.length > 1 ? `${d.State}-${d.District}` : d.District],
        ["Party", (d: any) => titleCase(d.Party.replace(/-/g, " "))],
        ["Elected", (d: any) => d["Start Year"]],
        [(d: any) => d["End Year"] < thisYear ? "Left Office" : "Next Election", (d: any) => d["End Year"]]
      ]
    },
    type: "Priestley"
  }
};

export default viz;
