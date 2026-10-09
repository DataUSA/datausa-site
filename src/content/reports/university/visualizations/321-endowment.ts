// Converted from legacy canon_cms_section_visualization #321 "section endowment" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {id, colorHighlight, colorGrey, tesseract, hierarchy} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;

  const idCarnegie = id.length === 6 ? id.substring(0, 2) : id;

  if (hierarchy === "Carnegie Parent") {
    return {
      //data: `/api/data?University=${idCarnegie}&measures=Endowment 20th Percentile,Endowment 40th Percentile,Endowment 60th Percentile,Endowment 80th Percentile,Endowment 100th Percentile`,
      data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&include=Carnegie Parent:${id}&drilldowns=Carnegie Parent,Year&locale=en&measures=Endowment+20th+Percentile%2CEndowment+40th+Percentile%2CEndowment+60th+Percentile%2CEndowment+80th+Percentile%2CEndowment+100th+Percentile`,
      dataFormat: (resp: any) => {
        const data = resp.data.reduce((all: any, d: any) => {
          all.push({
            "Quintile": "1st Quintile",
            "Endowment": d["Endowment 20th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "2nd Quintile",
            "Endowment": d["Endowment 40th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "3rd Quintile",
            "Endowment": d["Endowment 60th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "4th Quintile",
            "Endowment": d["Endowment 80th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "5th Quintile",
            "Endowment": d["Endowment 100th Percentile"],
            "Year": d["Year"],
          });
          return all;
  
        }, [])
        return data;
      },
      height: 200,
      groupBy: ["Quintile"],
      legendConfig: {
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Endowment", (d: any) => `$${abbreviate(d["Endowment"])}`]
        ]
      },
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: colorHighlight
      },
      legend: false,
      x: "Quintile",
      y: "Endowment",
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`
      },
      xConfig: {
        labelRotation: false
      },
      type: "BarChart"
    }
  }

  else {
    return {
      //data: `/api/data?University=${idCarnegie}&measures=Endowment 20th Percentile,Endowment 40th Percentile,Endowment 60th Percentile,Endowment 80th Percentile,Endowment 100th Percentile`,
      data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&include=Carnegie:${idCarnegie}&drilldowns=Carnegie,Year&locale=en&measures=Endowment+20th+Percentile%2CEndowment+40th+Percentile%2CEndowment+60th+Percentile%2CEndowment+80th+Percentile%2CEndowment+100th+Percentile`,
      dataFormat: (resp: any) => {
        const data = resp.data.reduce((all: any, d: any) => {
          all.push({
            "Quintile": "1st Quintile",
            "Endowment": d["Endowment 20th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "2nd Quintile",
            "Endowment": d["Endowment 40th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "3rd Quintile",
            "Endowment": d["Endowment 60th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "4th Quintile",
            "Endowment": d["Endowment 80th Percentile"],
            "Year": d["Year"],
          });
          all.push({
            "Quintile": "5th Quintile",
            "Endowment": d["Endowment 100th Percentile"],
            "Year": d["Year"],
          });
          return all;
  
        }, [])
        return data;
      },
      height: 200,
      groupBy: ["Quintile"],
      legendConfig: {
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Endowment", (d: any) => `$${abbreviate(d["Endowment"])}`]
        ]
      },
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: colorHighlight
      },
      legend: false,
      x: "Quintile",
      y: "Endowment",
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`
      },
      xConfig: {
        labelRotation: false
      },
      type: "BarChart"
    }
  }

};

export default viz;
