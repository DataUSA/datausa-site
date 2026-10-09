// Converted from legacy canon_cms_section_visualization #441 "section distance-to-health-services-by-counties" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {id, hierarchy, countyList, tesseract} = variables;
  const {abbreviate, commas, growthPct} = formatters;

  const selector = swap("[[healthServiceSelector2]]").replace("health_", "");

  const colorList: Record<string, any> = {
    "1": "#172955",
    "2": "#375f90",
    "3": "#5593cd",
    "4": "#afc8dc",
    "5": "#c6d6e1",
  };

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=prism_service_access&include=State+County:${id};Health+Provider:${selector}&drilldowns=County&locale=en&measures=Average+estimated+driving+distance+%28miles%29,Household+Count`
                   
  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
  
      return data.filter((d: any) => d["Average estimated driving distance (miles)"]);
    },
    colorScale: "Average estimated driving distance (miles)",
    colorScaleConfig: {
      buckets: [0, 6, 10, 20, 30],
      color: ["#172955", "#375f90", "#5593cd", "#afc8dc", "#c6d6e1"],
      legendConfig: {
        label: (d: any) => {
          return d.id.replace(/\.\d+/g, '').replace(/\s+/g, '')
        }
      },
      axisConfig: {
        title: "Average Distance (miles)",
      },
    },
     tooltipConfig: {
      tbody: [
        ["Addresses", (d: any) => `${commas(d["Household Count"])}`],
        ["Average Distance", (d: any) => `${abbreviate(d["Average estimated driving distance (miles)"])} miles`],
      ]
    },
    groupBy: "County ID",
    label: (d: any) => d.County,
    projection: "geoMercator",
    topojson: `/topojson/Counties_2023.json`,
    topojsonId: (d: any) => d.properties.id,
    topojsonFilter: (d: any) => countyList.includes(d.properties.id),
   // time: "Year",
    type: "Geomap"
  }


};

export default viz;
