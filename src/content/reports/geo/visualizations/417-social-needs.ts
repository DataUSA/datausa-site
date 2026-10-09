// Converted from legacy canon_cms_section_visualization #417 "section social_needs" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap, albersUsaPr}) => {
  const {colorScaleBad, colorScaleGood, countyDataGeoIDs, pumaInTheStateIDs, id, hierarchy, tesseract, specialTessCut, specialTessDrilldown, stateDataID, tractList} = variables;
  const {abbreviate, commas, growthPct} = formatters;
  const {nest} = libs.d3;
  const {merge} = libs.d3plus;

  const selector = swap("[[social-social_needs]]")
  const title = variables[swap("[[social-social_needs]]Measure")] || variables[swap("[[social-social_needs]]")];
  const filterIDs = (hierarchy === "PUMA" && (selector !== "exercise" || selector !== "food")) ? pumaInTheStateIDs : countyDataGeoIDs

  const measureList: Record<string, any> = {
    "homeless": "Estimates of Chronically Homeless Individuals",
    "exercise": "Access To Exercise Opportunities",
    "food": "Food Insecurity",
    "plumbing": "Households by Plumbing Type",
    "kitchen": "Households by Kitchen Type",
    "internet": "Households by Internet Access",
  }
  const measure = measureList[selector]

  const drilldownList: Record<string, any> = {
    "homeless": "State,Year",
    "exercise": hierarchy === "Nation" ? "State,Year" : "County,Year",
    "food": hierarchy === "Nation" ? "State,Year" : "County,Year",
    "plumbing": hierarchy === "Place" ? `County,Year,Plumbing+Facilities` : `${specialTessDrilldown},Year,Plumbing+Facilities`, //all hierarchies
    "kitchen": hierarchy === "Place" ? `County,Year,Kitchen+Facilities` : `${specialTessDrilldown},Year,Kitchen+Facilities`, //all hierarchies
    "internet": hierarchy === "Place" ? `County,Year,Access+Group` : `${specialTessDrilldown},Year,Access+Group`, //all hierarchies
  }
  const drilldown = drilldownList[selector]

  const cubeList: Record<string, any> = {
    "homeless": "health_estimates_of_chronically_homeless_individuals",
    "exercise": "county_health_ranking",
    "food": "county_health_ranking",
    "plumbing": "acs_ygh_occupied_households_lacking_plumbing_5",
    "kitchen": "acs_ygh_occupied_households_lacking_kitchen_5",
    "internet": "acs_ygh_households_with_no_internet_2016_5",
  }
  const cube = cubeList[selector]

  const cutList: Record<string, any> = {
    "homeless": "",
    "exercise": hierarchy === "Nation" ? "" : `&include=State+County:${stateDataID}`,
    "food": hierarchy === "Nation" ? "" : `&include=State+County:${stateDataID}`,
    "plumbing": hierarchy === "Place" ? `&include=State+County:${stateDataID}` : specialTessCut,
    "kitchen": hierarchy === "Place" ? `&include=State+County:${stateDataID}` : specialTessCut,
    "internet": hierarchy === "Place" ? `&include=State+County:${stateDataID}` : specialTessCut,
  }
  const specialCut = cutList[selector]

  const specialDrilldownList: Record<string, any> = {
    "homeless": "State",
    "exercise": hierarchy === "Nation" ? "State" : "County",
    "food": hierarchy === "Nation" ? "State" : "County",
    "plumbing": hierarchy === "Place" ? "County" : `${specialTessDrilldown}`, 
    "kitchen": hierarchy === "Place" ? "County" : `${specialTessDrilldown}`,
    "internet": hierarchy === "Place" ? "County" : `${specialTessDrilldown}`, 
  }
  const specialDrilldown = specialDrilldownList[selector]

  const level_ = variables[swap("[[social-social_needs]]Level")];
  const level = level_ === "place" ? "county" : level_
  const key = level === "state" ? "State" : "Geography";
  const state = id === "01000US" ? false : id.slice(7, 9);
  const factor = (selector === "exercise" || selector === "food") ? 100 : 1
  const rightMeasure = (selector === "internet" || selector === "kitchen" || selector === "plumbing") ? "Share" : measure

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}${specialCut}&drilldowns=${drilldown}&locale=en&measures=${measure}` 

  const config: Record<string, any> = {
    cache: false,
    colorScale: rightMeasure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat:  (d: any) => (selector === "homeless") ? commas(Math.round(d)) : `${growthPct(d*factor)}`,
        title
      },
      color: selector === "exercise" ? colorScaleGood : colorScaleBad
    },
    data: dataURL,
    dataFormat: (resp: any) => {
      let data = resp.data;
    
      if (selector === "internet" || selector === "kitchen" || selector === "plumbing") {
        let drilldownKey: string = "";
        let mainVariable: string = "";
    
        if (selector === "internet") {
          drilldownKey = "Access Group";
          mainVariable = "No Internet Access";
        } else if (selector === "kitchen") {
          drilldownKey = "Kitchen Facilities";
          mainVariable = "Lacking Complete Kitchen Facilities";
        } else if (selector === "plumbing") {
          drilldownKey = "Plumbing Facilities";
          mainVariable = "Lacking Complete Plumbing Facilities";
        } else {
          return [];
        }
    
        // Group by state and year
        const grouped: Record<string, any> = {};
        data.forEach((entry: any) => {
          const key: string = `${entry[specialDrilldown]}-${entry["Year"]}`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(entry);
        });

        //Get percentage
        const result: any = [];
        for (const key in grouped) {
          const group = grouped[key];
          const total = group.reduce((sum: any, item: any) => sum + item[measure], 0);
          const noAccess = group.find((item: any) => item[drilldownKey] === mainVariable);
        
          result.push({
            [`${specialDrilldown} ID`]: group[0][`${specialDrilldown} ID`],
            [specialDrilldown]: group[0][specialDrilldown],
            Year: group[0]["Year"],
            Share: noAccess ? (noAccess[measure] / total) * 100 : 0
          });
        }

      return result.filter((d: any) => d["Share"] !== null);
      }
      else{
       return data;
      }
    },
    groupBy: (selector === "homeless" || hierarchy === "Nation") ? "State ID" : `${specialDrilldown} ID`,
    ocean: level === "state" ? "transparent" : "#D5DADC",
    projection: level === "state" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    tiles: level === "state" ? false : true,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Value",(d: any) => (selector === "homeless") ? commas(Math.round(d[rightMeasure])) : `${growthPct(d[rightMeasure]*factor)}`],
      ]
    },
    topojson: `/topojson/${level.replace(/^[a-z]/g, (chr: any) => chr.toUpperCase())}${["tract"].includes(level) ? `_${state}` : ""}.json`,
    topojsonFilter: ["tract", "state"].includes(level) ? (d: any) => true : (d: any) => filterIDs.includes(d.id), 
    time: "Year",
    type: "Geomap"
  }

  if(hierarchy === "County" && (selector === "internet" || selector === "kitchen" || selector === "plumbing")){
    config.fitFilter =  (d: any) => tractList.includes(d.id)
  }
  if((hierarchy === "County" || hierarchy === "PUMA") && (selector === "exercise" || selector === "food")){
    config.fitFilter =  (d: any) => countyDataGeoIDs.includes(d.id)
  }

  return config;

};

export default viz;
