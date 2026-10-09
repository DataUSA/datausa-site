// Converted from legacy canon_cms_section_visualization #388 "section employment-by-location" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap, albersUsaPr}) => {
  const {hierarchy, id, tesseract} = variables;
  const {abbreviate, salary, commas} = formatters;

  const options = swap("[[employment-bl-measure]]") // avgWageEBL, specializationEBL, workforceEBL
  const optionName = swap("{{[[employment-bl-measure]]}}") // Average Wage, Specialization, Workforce

  const filter = swap("[[employment-bl-geo]]") // statesEBL, pumasEBL
  const filterName = filter === "statesEBL" ?  "State" : "PUMA"
  const geo = filter === "statesEBL" ? "State" : "Puma" 

  const measure = options === "avgWageEBL" ? "Average Wage" : options === "workforceEBL" ? "Total Population" : "Total Population RCA"
  const measureMOE = options === "avgWageEBL" ? "Average Wage Appx MOE" : options === "workforceEBL" ? "Total Population MOE Appx" : ""

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=${filterName},Year&include=${hierarchy}:${id};Workforce+Status:true&locale=en&measures=${measure},${measureMOE},Record+Count&filters=Record+Count.gte.5`
  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=${filterName}&activity=${hierarchy}&measure=Total+Population&time=Year&cuts=${hierarchy}:${id};Workforce%20Status:true&filters=Record+Count.gte.5`
  const data = options === "specializationEBL" ? dataRCA  : dataURL

  if(geo === "State") {
    return {
      cache: false,
      colorScale: measure,
      colorScaleConfig: {
        axisConfig: {
          tickFormat: optionName === "Average Wage" ? (d: any) => `$${abbreviate(d)}` : (d: any) => abbreviate(d),
          title: optionName
        }
      },
      data: data,
      dataFormat: (resp: any) => {
        const data = resp.data.filter((d: any) => d["State ID"] !== "")
        return data
      },
      groupBy: `State ID`,
      label: (d: any) => d[filterName],
      tooltipConfig: {
        tbody: (d: any) => {
          let customTooltip: any = [];
          options !== "specializationEBL" ?
            customTooltip = [
              ["Year", d.Year],
              [optionName, optionName === "Average Wage" ? salary(d["Average Wage"]) : commas(d["Total Population"])],
              ["Margin of Error", optionName === "Average Wage" ? `± ${salary(d[measureMOE])}` : `± ${abbreviate(d[measureMOE])}`]
            ]
            :
            customTooltip = [
              ["Year", d.Year],
              ["Specialization (RCA)", abbreviate(d["Total Population RCA"])],
            ]
          return customTooltip;
        },
      },
      projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
      topojson:`/topojson/State.json`,
      time: "Year",
      type: "Geomap"
    };
  }

  else {
      return {
      cache: false,
      colorScale: measure,
      colorScaleConfig: {
        axisConfig: {
          tickFormat: optionName === "Average Wage" ? (d: any) => `$${abbreviate(d)}` : (d: any) => abbreviate(d),
          title: optionName
        }
      },
      data: data,
      dataFormat: (resp: any) => {
        const data = resp.data.filter((d: any) => d["PUMA ID"] !== "")
        return data.filter((d: any) => d[measure])
      },
      groupBy: `PUMA ID`,
      label: (d: any) => d[filterName],
      tooltipConfig: {
        tbody: (d: any) => {
          let customTooltip: any = [];
          options !== "specializationEBL" ?
            customTooltip = [
              ["Year", d.Year],
              [optionName, optionName === "Average Wage" ? salary(d["Average Wage"]) : commas(d["Total Population"])],
              ["Margin of Error", optionName === "Average Wage" ? `± ${salary(d[measureMOE])}` : `± ${abbreviate(d[measureMOE])}`]
            ]
            :
            customTooltip = [
              ["Year", d.Year],
              ["Specialization (RCA)", abbreviate(d["Total Population RCA"])],
            ]
          return customTooltip;
        },
      },
      projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
      topojsonId: (d: any) => d.id,
      topojson:`/topojson/PUMA.json`,
      time: "Year",
      type: "Geomap"
    };
  }
};

export default viz;
