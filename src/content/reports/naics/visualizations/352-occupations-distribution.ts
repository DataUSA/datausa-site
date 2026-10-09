// Converted from legacy canon_cms_section_visualization #352 "section occupations_distribution" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorOccPUMS, iconOccPUMS, id, hierarchy, colorScaleDiverging, colorScaleGood, tesseract} = variables;
  const {abbreviate, commas, salary, dollar} = formatters;
  const {sum, nest} = libs.d3;

  const measure = swap("[[occupationOption]]") // workforce, wage
  const growth = swap("[[changeOccupation]]") // valueOption, growthOption

  //const dataURL = `/api/data?${hierarchy}=${id}&measure=Total Population,Total Population MOE Appx,Average Wage,Average Wage Appx MOE,Record Count,yiopop RCA&drilldowns=Detailed Occupation&parents=true&debug=true&Workforce%20Status=true&Record%20Count>=5`;

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation,Major+Occupation+Group&measures=Total+Population,Total+Population+MOE+Appx,Record+Count,Average%20Wage,Average%20Wage%20Appx%20MOE&include=${hierarchy}:${id};Workforce+Status:true&locale=en&filters=Record+Count.gte.5`

  const varColorScale = measure === "wage" ? "Average Wage Growth" : "Workforce Growth"

  const config: Record<string, any> = {
    data: dataURL,
    dataFormat: (resp: any) => {
      const dataWorkforce = resp.data.map((d: any) => Object.assign({}, d));

      const tempData = dataWorkforce
    
      dataWorkforce.forEach((d: any) => {
        const s = tempData.find((h: any) => (h["Year"] * 1  === d["Year"] * 1 - 1) && (h["Detailed Occupation ID"]  === d["Detailed Occupation ID"])) || {};
        d["Workforce Prev"] = s["Total Population"];
        d["Workforce Growth"] = ((d["Total Population"] - d["Workforce Prev"]) / d["Workforce Prev"]) * 100
        d["Wage Prev"] = s["Average Wage"];
        d["Average Wage Growth"] = ((d["Average Wage"] - d["Wage Prev"]) / d["Wage Prev"]) * 100
      });
    
      nest()
        .key((d: any) => d["Year"])
        .entries(dataWorkforce)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Total Population"]) 
          group.values.forEach((d: any) => {
            d["Share"] = (d["Total Population"] / total) * 100
          });
        });
      
      if(growth === "valueOption"){
        return dataWorkforce.filter((d: any) => d["Average Wage"])
      }
      else {
        return dataWorkforce.filter((d: any) => d["Year"] !== 2013 && d["Average Wage"])
      }
    },
    colorScale: growth === "growthOption" ? varColorScale : measure === "workforce" ? false : "Average Wage",
    colorScaleConfig: {
      scale: "linear",
      axisConfig: {
        tickFormat: (d: any) => growth === "growthOption" ? `${abbreviate(d)}%` : measure === "workforce" ? commas(d) : salary(d),
      }
    },
    groupBy: ["Major Occupation Group", "Detailed Occupation"],
    label: (d: any) => String(d["Detailed Occupation"]),
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconOccPUMS[d[`Major Occupation Group ID`]]
      }
    },
    sum: (d: any) => d["Total Population"],
    threshold: 0,
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["Workforce Growth", (d: any) => `${abbreviate(d["Workforce Growth"])}%`],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`],
        ["Average Wage Growth", (d: any) => `${abbreviate(d["Average Wage Growth"])}%`],
     ]
    },
    type: "Treemap"
  }


  if(growth !== "growthOption"){
    config.shapeConfig = {
      label: (d: any, i: any, x: any) => measure === "workforce" ? [d["Detailed Occupation"], `${abbreviate(d.Share)}%`] : [d["Detailed Occupation"], salary(d["Average Wage"])]
    }
    if (measure === "workforce"){
      config.shapeConfig.fill = (d: any) => colorOccPUMS[d[`Major Occupation Group ID`]]
    } else {
      config.shapeConfig.fill = "D3PLUS-COMMON-RESET",
      config.colorScaleConfig.color = colorScaleGood,
      config.colorScaleConfig.colorMin = "#b0cde1",
      config.colorScaleConfig.colorMid = "#4c96cb",
      config.colorScaleConfig.colorMax = "#142E58"
      config.colorScaleConfig.domain = false
    }
  } else {
    config.shapeConfig = {
      label: (d: any, i: any, x: any) =>  [d["Detailed Occupation"], `${abbreviate(d[varColorScale])}%`]
    },
    config.total = false,
    config.shapeConfig.fill = "D3PLUS-COMMON-RESET",
    config.colorScaleConfig.midpoint = 0,
    config.colorScaleConfig.color = colorScaleDiverging,
    config.colorScaleConfig.colorMin = "#7B0000",
    config.colorScaleConfig.colorMid = "#DC9595",
    config.colorScaleConfig.colorMax = "#004374",
    config.colorScaleConfig.domain = [-20, 20]
  }

  return config;
};

export default viz;
