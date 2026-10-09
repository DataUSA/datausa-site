// Converted from legacy canon_cms_section_visualization #442 "section location-of-health-services-facilities" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  /* CUSTOM VIZ */
  const {id, tesseract} = variables;
  const {commas} = formatters;

  const selector = swap("[[healthServiceSelector3]]").replace("health_", "");

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=prism_facilities_by_households_served&include=County+Household:${id};Health+Provider:${selector}&drilldowns=Tract+Facility,Facility,Rank+Facility,Health+Provider,County+Household&locale=en&measures=Addresses+Served,Average+estimated+driving+distance+%28miles%29&properties=Latitude,Longitude,Address&sort=Rank+Facility`;

  const lockedTooltipTitle: Record<string, any> = {
    1: "Maternal Health Service Provider",
    2: "Mental Health Service Provider",
    3: "Emergency Care Service Provider",
    4: "Child Healthcare Service Provider",
  }

  const lockedMsg: string = "<a href='mailto:PeoplePrism@deloitte.com'>Contact Deloitte</a> to access these details and the full dataset from PeoplePrism."

  return {
    type: "PrismMap",

    // URL for point/facility data — county and health provider filters already applied
    data: dataURL,
    dataFormat: (res: any) => res.data.map((d: any) => ({
      "Facility": d["Rank Facility"] <= 5 ? d["Facility"] : `${d["Facility"]} SERVICE`,
      "County Household": d["County Household"],
      "Addresses Served": d["Addresses Served"],
      "Tract": d["Tract Facility"],
      "Rank": d["Rank Facility"],
      "Address": d["Address"] ? d["Address"]:  "-",
      "Longitude": d["Rank Facility"] <= 5 ? d["Longitude"]:  "-",
      "Latitude": d["Rank Facility"] <= 5 ? d["Latitude"]:  "-",
      "Average estimated driving distance (miles)": d["Average estimated driving distance (miles)"]
        ? d["Average estimated driving distance (miles)"]
        : "-"
    })),
    // URL for county boundary TopoJSON
    topojson: `/topojson/Counties_2023.json`,
    // FIPS county ID used to highlight the selected county on the map
    county: id,

    // Field accessors — accept a field name string or a (d: any) => value function
    id:        (d: any) => d["Facility ID"],                       // unique key for each marker
    latitude:  (d: any) => d["Latitude"],                          // marker position
    longitude: (d: any) => d["Longitude"],                         // marker position
    sortBy:    (d: any) => d["Rank Facility"],    // determines marker render order
    rankBy:    (d: any) => d["Rank Facility"],                     // numeric rank → numbered marker; null/0 → lock icon

    // Popup shown on marker hover
    tooltipConfig: {
      title:    (d: any) => d["Rank Facility"] > 5 ? lockedTooltipTitle[Number(selector)] : d["Facility"],         // bold header
      subtitle: (d: any) => d["County Facility"],  // uppercase line below the title
      tbody: (d: any) => d["Rank Facility"] > 5 
      ? [
          ["[lock_icon]", (d: any) => lockedMsg]
        ]
      :[
       // ["Drive time", (d: any) => `${d["Average estimated driving distance (miles)"].toFixed(1)} miles`],
        ["Facility Address",    (d: any) => d["Address"]],
        ["Census Tract",   (d: any) => d["Tract Facility"].match(/^Census Tract\s+([^,]+)/)[1]],
        ["Addresses Served",    (d: any) => commas(d["Addresses Served"])],
      ]
    }
  };

  /*

  const {id, hierarchy, countyList, tesseract} = variables;
  const {abbreviate, commas, growthPct} = formatters;

  const selector = "[[healthServiceSelector3]]".replace("health_", "");

  const dataURL = `${tesseract}tesseract/data.jsonrecords?cube=prism_facilities_by_households_served&include=County+Facility:${id};Health+Provider:${selector}&drilldowns=Facility,County+Facility&locale=en&measures=Avg+estimated+drive+time+%28min%29&properties=Latitude,Longitude,Address,Zip+Code`;

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
  
      return data;
    },
    groupBy: "Facility ID",
    point: (d: any) => [d.Longitude, d.Latitude],
    pointSize: (d: any) => d["Avg estimated drive time (min)"] || 1,
    projection: "geoAlbersUsa",
    shapeConfig: {
      Path: {
        fill: (d: any) => "#00000000",
        strokeWidth: 2,
        stroke: "red",
      },
      Circle: {
        fill: (d: any) => "#dddddddd",
        stroke: (d: any) => "#aaaaaa",
        strokeWidth: 1,
      },
    },
    tiles: true,
    tooltipConfig: {
      tbody: [
        ["Address", (d: any) => d["Address"]],
        ["Zip Code", (d: any) => d["Zip Code"]],
      ]
    },
    topojson: `/topojson/Counties_2023.json`,
    topojsonId: (d: any) => d.properties.id,
    topojsonFilter: (d: any) =>  d.properties.id === id,
    type: "Geomap"
  };
  */
};

export default viz;
