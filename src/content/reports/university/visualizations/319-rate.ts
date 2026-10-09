// Converted from legacy canon_cms_section_visualization #319 "section rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorRaceIPEDS, iconRace, raceData, id, tesseract, hierarchy} = variables;
  const {abbreviate, commas} = formatters;

  const {nest, sum} = libs.d3;
 
  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year,Gender,IPEDS Race&include=${hierarchy}:${id}&locale=en&measures=Number+Of+Finishers,Graduation+Rate&filters=Number Of Finishers.gte.5`,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["IPEDS Race ID"] !== "unknown")
    
      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      })
 
      return data;
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Sex", (d: any) => d.Sex],
        ["Graduation Rate", (d: any) => `${abbreviate(d["Graduation Rate"] * 100)}%`],
        ["Number of Students", (d: any) => commas(d["Number Of Finishers"])]
      ]
    },
    groupBy: "Sex",
    legendTooltip: {
      title: (d: any) =>  {
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${colorRaceIPEDS[d["IPEDS Race ID"]]}"><img src="${iconRace}" /></div>
            <div class="title"><span>${d["IPEDS Race"]}</span></div>
            <div class="subtitle"><span>IPEDS Race</span></div>
          </div>
        ` 
      },
    },
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: iconRace
      }
    },
    shapeConfig: {
      fill: (d: any) => colorRaceIPEDS[d["IPEDS Race ID"]],
      label: false
    },
    time: "Year",
    type: "BarChart",
    x: "IPEDS Race",
    discrete: "x",
    xConfig: {
      labelRotation: false,
      title: "Race or Ethnicity"
    },
    groupPadding: 40,
    xSort: (a: any, b: any) => b["share"] - a["share"],
    y: "Graduation Rate",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Graduation Rate"
    }
  }
};

export default viz;
