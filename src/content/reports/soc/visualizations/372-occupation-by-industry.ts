// Converted from legacy canon_cms_section_visualization #372 "section occupation-by-industry" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorIndPUMS, colorSectorIndustry, tesseract, iconOccPUMS, iconIndPUMS, id, hierarchy, colorScaleDiverging, colorScaleGood} = variables;
  const {abbreviate, commas, salary, dollar} = formatters;
  const {sum, nest} = libs.d3;

  const measure = swap("[[occupation-by-industry-measure]]"); // avgWageOBI, workforceOBI
  const growth = swap("[[occupation-by-industry-metric]]"); // valueOBI, yearlyChangeOBI

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Industry+Group,Year&locale=en&measures=Record+Count,Average+Wage,Average Wage Appx MOE,Total Population,Total Population MOE Appx&exclude=Industry+Group:0&include=${hierarchy}:${id};Workforce+Status:true&filters=Record+Count.gte.5&parents=true`

  const varColorScale = measure === "avgWageOBI" ? "Average Wage Growth" : "Workforce Growth";

  const config: Record<string, any> = {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "")
      const dataWorkforce = data.map((d: any) => Object.assign({}, d));

      const tempData = dataWorkforce;
    
      dataWorkforce.forEach((d: any) => {
        const s = tempData.find((h: any) => (h["Year"]*1  === d["Year"]*1- 1) && (h["Industry Group"]  === d["Industry Group"])) || {};
        d["Workforce Prev"] = s["Total Population"];
        d["Workforce Growth"] = ((d["Total Population"] - d["Workforce Prev"]) / d["Workforce Prev"])*100;
        d["Wage Prev"] = s["Average Wage"];
        d["Average Wage Growth"] = ((d["Average Wage"] - d["Wage Prev"]) / d["Wage Prev"])*100;

      });
    
      nest()
        .key((d: any) => d["Year"])
        .entries(dataWorkforce)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Total Population"]) ;
          group.values.forEach((d: any) => {
              d["Share"] = (d["Total Population"] / total) * 100;
          });
        });
      
      if(growth === "valueOBI"){
        return dataWorkforce.filter((d: any) => d["Average Wage"])
      }
      else {
        return dataWorkforce.filter((d: any) => d["Year"] !== 2013 && d["Average Wage"])
      }
      
    },
    colorScale: growth === "yearlyChangeOBI" ? varColorScale : measure === "workforceOBI" ? false : "Average Wage",
    colorScaleConfig: {
      scale: "linear",
      axisConfig: {
        tickFormat: (d: any) => growth === "yearlyChangeOBI" ? `${abbreviate(d)}%` : measure === "workforceOBI" ? commas(d) : salary(d),
      }
    },
    groupBy: ["Industry Sector", "Industry Group"],
  //  label: (d: any) => String(d["Industry Group"]),
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconIndPUMS[d["Industry Sector ID"]]
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
  };

  if(growth !== "yearlyChangeOBI"){
    config.shapeConfig = {
      label: (d: any, i: any, x: any) => measure === "workforceOBI" ? [d["Industry Group"], `${abbreviate(d.Share)}%`] : [d["Industry Group"], salary(d["Average Wage"])]
    };
    if (measure === "workforceOBI"){
      config.shapeConfig.fill = (d: any) => colorIndPUMS[d[`Industry Sector ID`]];
    } else {
      config.shapeConfig.fill = "D3PLUS-COMMON-RESET",
      config.colorScaleConfig.color = colorScaleGood,
      config.colorScaleConfig.colorMin = "#b0cde1",
      config.colorScaleConfig.colorMid = "#4c96cb",
      config.colorScaleConfig.colorMax = "#142E58",
      config.colorScaleConfig.domain = false;
    }
  } else {
    config.shapeConfig = {
      label: (d: any, i: any, x: any) =>  [d["Industry Group"], `${abbreviate(d[varColorScale])}%`]
    },
    config.total = false,
    config.shapeConfig.fill = "D3PLUS-COMMON-RESET",
    config.colorScaleConfig.midpoint = 0,
    config.colorScaleConfig.color = colorScaleDiverging,
    config.colorScaleConfig.colorMin = "#7B0000",
    config.colorScaleConfig.colorMid = "#DC9595",
    config.colorScaleConfig.colorMax = "#004374",
    config.colorScaleConfig.domain = [-20, 20];
  }


  return config;
};

export default viz;
