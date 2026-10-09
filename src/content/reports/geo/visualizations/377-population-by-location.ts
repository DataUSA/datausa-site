// Converted from legacy canon_cms_section_visualization #377 "section population_by_location" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {id, hierarchy, pumasList, iconGeo, tesseract} = variables;
  const {abbreviate} = formatters;

  const raceId = swap("[[pums5RacesResident]]").replace("pums5Race", "")
  const sexId = swap("[[genderResidents]]").replace("sex", "")

  const race = raceId*1 === 0 ? "" : `&Race=${raceId}`
  const sex = sexId*1 === 0 ? "" : `&Gender=${sexId}`

  const url = hierarchy === "Nation" ? `${tesseract}tesseract/data?cube=pums_5&drilldowns=State,Year&measures=Total+Population${race}${sex}` : `${tesseract}tesseract/data?cube=pums_5&drilldowns=PUMA,Year&measures=Total+Population${race}${sex}`

  const config: Record<string, any> = {
    data: url,
    dataFormat: (resp: any) => {
      const data = resp.data;

      return data;
    },
    colorScale: "Total Population",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => `${abbreviate(d)}`,
        title: `Resident Population`
      },
      scale: "jenks"
    },
    tooltipConfig: {
      title: (d: any) => {
        const imgUrl = iconGeo;
        return  `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: #879bf5"><img src="${imgUrl}" /></div>
            <div class="title"><span>${hierarchy !== "Nation" ? d.PUMA : d.State}</span></div>
            <div class="subtitle"><span>${hierarchy !== "Nation" ? "PUMA" : "State"}</span></div>
          </div>
        `
      },
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Resident Population", (d: any) => abbreviate(d["Total Population"])],
      ]
    },
    groupBy: hierarchy !== "Nation" ? "PUMA ID" : "State ID",
    label: (d: any) => hierarchy !== "Nation" ? d.PUMA : d.State,
    projection: hierarchy === "Nation" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson: hierarchy !== "Nation" ? `/topojson/PUMA.json` : `/topojson/State.json`,
    topojsonId: (d: any) => hierarchy !== "Nation" ? d.id : d.id,
    topojsonFilter: hierarchy !== "Nation" ? (d: any) => pumasList.includes(d.id) : (d: any) => true,
    time: "Year",
    type: "Geomap"
  }

  if (hierarchy === "PUMA") {
    config.shapeConfig = {
      Path: {
        strokeWidth: (d: any) => d["PUMA ID"] === id ? 5 : 1,
        stroke: (d: any) => d["PUMA ID"] === id ? "red" : false
      }
    }
  }

  return config;

};

export default viz;
