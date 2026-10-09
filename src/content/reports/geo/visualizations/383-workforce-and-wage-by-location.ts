// Converted from legacy canon_cms_section_visualization #383 "section workforce-and-wage-by-location" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap, albersUsaPr}) => {
  const {id, hierarchy, pumasList, tesseract} = variables;
  const {abbreviate, commas, dollar, growthPct} = formatters;
  const {nest, sum} = libs.d3;

  const raceId = swap("[[pums5RacesWorkforce]]").replace("pums5Race", "")
  const race = raceId*1 === 0 ? "" : `&Race=${raceId}`

  const measure = swap("[[measureWorkforceGeomap]]") //workforce, wage
  const valueMeasure = measure === "workforce" ? "Total Population" : "Average Wage"

  const url = hierarchy === "Nation" ? `${tesseract}tesseract/data?cube=pums_5&drilldowns=State,Year&measures=${valueMeasure}&Workforce+Status=true${race}` : `${tesseract}tesseract/data?cube=pums_5&drilldowns=PUMA,Year&measures=${valueMeasure}&Workforce+Status=true${race}`

  const geoLevel = hierarchy === "Nation" ? "State" : "PUMA"
  const growth = swap("[[yearlyChangeWorkforceGeomap]]") //value, growth

  const config: Record<string, any> = {
    data: url,
    dataFormat: (resp: any) => {
      const id_puma = id.replace("04000US", "79500US")
      const data = hierarchy === "State" ? resp.data.filter((d: any) => d["PUMA ID"].toString().slice(0,9) == id_puma) : resp.data;
      const tempData =  hierarchy === "State" ? resp.data.filter((d: any) => d["PUMA ID"].toString().slice(0,9) == id_puma) : resp.data;
    
      data.forEach((d: any) => {
        const s = tempData.find((h: any) => (h[`${geoLevel} ID`] === d[`${geoLevel} ID`]) && (h["Year"]*1  === d["Year"]*1- 1)) || {};
        d["Temp"] = s[valueMeasure];
        d["Growth"] = ((d[valueMeasure] - d["Temp"]) / d["Temp"])*100
      });
    
  
      if(growth === "value"){
        return data
      }
      else {
        return data.filter((d: any) => d["Year"] !== 2014)
      }
    },
    cache: false,
    colorScale: growth === "value" ? valueMeasure : "Growth",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (growth === "value" && measure === "workforce") ? (d: any) => `${abbreviate(d)}` : (growth === "value" && measure === "wage") ? (d: any) => `${dollar(d)}` : (d: any) => `${abbreviate(d)}%`,
        title: measure === "workforce" ? `Workforce` : "Average Wage"
      },
      scale: growth === "value" ? "jenks" : "buckets"
    },
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        measure === "workforce" ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Year Change", growthPct(d["Growth"])],
            ["Workforce", commas(d["Total Population"])],
          ] :
          customTooltip = [
            ["Year", d["Year"]],
            ["Year Change", growthPct(d["Growth"])],
            ["Average Wage", dollar(d["Average Wage"])],
          ]
        return customTooltip;
      }
    },
    groupBy: hierarchy !== "Nation" ? "PUMA ID" : "State ID",
    label: (d: any) => hierarchy !== "Nation" ? d.PUMA : d.State,
    projection: hierarchy === "Nation" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson: hierarchy !== "Nation" ? `/topojson/PUMA.json` : `/topojson/State.json`,
    topojsonId: hierarchy !== "Nation" ? (d: any) => d.id : (d: any) => d.id,
    topojsonFilter: hierarchy !== "Nation" ? (d: any) => pumasList.includes(d.id) : (d: any) => true,
    time: "Year",
    type: "Geomap"
  }

  if (growth === "growth") {
    config.colorScaleConfig.colorMin = "#c35f33",
    config.colorScaleConfig.colorMid = "#f0ecd8",
    config.colorScaleConfig.colorMax = "#448c82",
    config.colorScaleConfig.midpoint = 0;
  }


  return config;

};

export default viz;
