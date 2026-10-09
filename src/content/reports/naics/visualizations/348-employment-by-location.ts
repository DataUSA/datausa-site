// Converted from legacy canon_cms_section_visualization #348 "section employment_by_location" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap, albersUsaPr}) => {
  const {id, hierarchy, tesseract} = variables;
  const {abbreviate, commas, dollar} = formatters;
  const {nest, sum} = libs.d3;

  const measure = swap("[[workforceByStates]]") // workforce, wage, specialization
  const valueMeasure = measure === "workforce" ? "Total Population" : "Average Wage"

  const chartMeasure = measure === "workforce" ? "Total Population" : measure === "wage" ? "Average Wage" : "RCA"

  const geoOption = swap("[[geoOption]]") //states, pumas
  const geoLevel = geoOption === "states" ? "State" : "PUMA"

  //const dataURL = `/api/data?drilldowns=${geoLevel},Year&measures=${valueMeasure}&${hierarchy}=${id}&Workforce Status=true&Record%20Count>=5`

  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=${geoLevel}&activity=${hierarchy}&measure=Total+Population&time=Year&cuts=${hierarchy}:${id};Workforce%20Status:true`
  const dataUrl: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=${geoLevel},Year&include=${hierarchy}:${id};Workforce+Status:true&locale=en&measures=${valueMeasure}`

  return {
    data: [dataRCA, dataUrl],
    dataFormat: (resp: any) => {
      const dataRCA = resp[0].data;
      const data = resp[1].data;
    
      data.forEach((d: any) => {
        const rcaItem = dataRCA.find((s: any) => d["Year"] === s["Year"] && d[`${geoLevel} ID`] === s[`${geoLevel} ID`])
      
        d["RCA"] = rcaItem["Total Population RCA"]
      })
    
      return data
    },
    cache: false,
    colorScale: chartMeasure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: measure === "wage" ? (d: any) => dollar(d) : (d: any) => `${abbreviate(d)}`,
        title: measure === "workforce" ? `Workforce` : measure === "wage" ? "Average Wage" : "Specialization (RCA)"
      },
      scale: "linear"
    },
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        measure === "workforce" ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Workforce", commas(d["Total Population"])],
          ] :
        measure === "wage" ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Average Wage", dollar(d["Average Wage"])],
          ] : 
          customTooltip = [
            ["Year", d["Year"]],
            ["Specialization", abbreviate(d["RCA"])],
          ] 
        return customTooltip;
      }
    },
    groupBy: geoOption !== "states" ? "PUMA ID" : "State ID",
    label: (d: any) => geoOption !== "states" ? d.PUMA : d.State,
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson:  geoOption !== "states" ? `/topojson/PUMA.json` : `/topojson/State.json`,
    topojsonId: (d: any) => geoOption !== "states" ? d.id : d.id,
    topojsonFilter: (d: any) => true,
    time: "Year",
    type: "Geomap"
  }
};

export default viz;
