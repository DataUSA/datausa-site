// Converted from legacy canon_cms_section_visualization #386 "section occupations" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {tesseract, colorOccACS, colorOccPUMS, iconOccACS, iconOccPUMS, id, useAcs, hierarchy, colorScaleDiverging, colorScaleGood} = variables;
  const {abbreviate, commas, salary, dollar} = formatters;
  const {sum, nest} = libs.d3;

  const sexId = swap("[[genderOccupations]]").replace("sex", "") //sex0, sex1, sex2
  const sex = sexId*1 === 0 ? "" : `&Gender=${sexId}`
  const sex_ = sexId*1 === 0 ? "" : sexId*1 === 1 ? `&Gender=0` : `&Gender=1` 

  const measure = swap("[[measureOccupations]]") // workforce, wage
  const growth = swap("[[growthOccupations]]") // value, growth

  const drilldown = useAcs ? "Occupation" : "Detailed Occupation";
  const parent_ = useAcs ? "Group" : "Major Occupation Group";

  const color = useAcs ? colorOccACS : colorOccPUMS;
  const icon = useAcs ? iconOccACS : iconOccPUMS;

  const tbody = useAcs ? [
      ["Year", (d: any) => d.Year],
      ["People in Workforce", (d: any) => commas(d["Workforce by Occupation and Gender"])],
      ["Margin of Error", (d: any) => `± ${commas(d["Workforce by Occupation and Gender Moe"])}`],
      ["Workforce Growth", (d: any) => `${abbreviate(d["Workforce Growth"])}%`],
      ["Median Earnings", (d: any) => salary(d["Median Earnings"])],
      ["Margin of Error", (d: any) => `± ${salary(d["Median Earnings Moe"])}`],
      ["Median Earnings Growth", (d: any) => `${abbreviate(d["Median Earnings Growth"])}%`],
      ] :
    [
      ["Year", (d: any) => d.Year],
      ["People in Workforce", (d: any) => commas(d["Total Population"])],
      ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
      ["Workforce Growth", (d: any) => `${abbreviate(d["Workforce Growth"])}%`],
      ["Average Salary", (d: any) => salary(d["Average Wage"])],
      ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`],
      ["Average Wage Growth", (d: any) => `${abbreviate(d["Average Wage Growth"])}%`],
    ];

  let pumsData: any = ""
  let workforceData: any = ""
  let wageData: any = ""
  let moeData: any = ""
  if (useAcs) {
    workforceData = `${tesseract}tesseract/data?cube=acs_ygso_gender_by_occupation_c_5&include=${hierarchy}:${id}&measures=Workforce by Occupation and Gender,Workforce by Occupation and Gender Moe,ACS Occupation yg RCA&drilldowns=Year,Occupation&parents=true&debug=true${sex_}`;
    wageData = `${tesseract}tesseract/data?cube=acs_ygso_gender_by_occupation_for_median_earnings_5&include=${hierarchy}:${id}&measures=Median+Earnings+by+Occupation+and+Gender%3A+Occupation%2CMedian+Earnings+by+Occupation+and+Gender+Moe%3A+Occupation&drilldowns=Year,Occupation&parents=false&debug=true${sex}`;
  }
  else {
    pumsData = `${tesseract}tesseract/data?cube=pums_5&include=${hierarchy}:${id}&measures=Total Population,Average Wage,Average Wage Appx MOE,Record Count&drilldowns=Year,Detailed Occupation&parents=true&debug=true&Workforce+Status=true${sex}`
    moeData = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&include=${hierarchy}:${id};Workforce+Status:true&drilldowns=Year,Detailed Occupation&measures=Total+Population+MOE+Appx&locale=en&parents=false${sex}`
  }

  const varColorScale = measure === "wage" && useAcs ? "Median Earnings Growth" : measure === "wage" && !useAcs ? "Average Wage Growth" : "Workforce Growth"
  const colorWage = useAcs ? "Median Earnings" : "Average Wage"

  const config: Record<string, any> = {
    colorScale: growth === "growth" ? varColorScale : measure === "workforce" ? false : colorWage,
    colorScaleConfig: {
      scale: "linear",
      axisConfig: {
        tickFormat: (d: any) => growth === "growth" ? `${abbreviate(d)}%` : measure === "workforce" ? commas(d) : salary(d),
      }
    },
    groupBy: [`${parent_} ID`, drilldown],
    label: (d: any) => String(d[drilldown]),
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => icon[d[`${parent_} ID`]]
      }
    },
    sum: useAcs ? (d: any) => d["Workforce by Occupation and Gender"] : (d: any) => d["Total Population"],
    threshold: 0,
    time: "Year",
    tooltipConfig: {tbody},
    type: "Treemap"
  }

  if (useAcs) {
    config.data = [workforceData, wageData],
    config.dataFormat = (resp: any) => {
      const dataWorkforce= resp[0].data.filter((d: any) => d["Occupation ID"] !== "").map((d: any) => Object.assign({}, d));
      const dataWage = resp[1].data.filter((d: any) => d["Occupation ID"] !== "").map((d: any) => Object.assign({}, d));
    
      const occupationIdMap: Record<string, any> = {};
      dataWorkforce.forEach((item: any) => {
        occupationIdMap[item.Occupation] = item["Occupation ID"];
      });
    
      const cleanedDataWage = dataWage
        .filter((item: any) => occupationIdMap.hasOwnProperty(item.Occupation))
        .map((item: any) => ({
          "Occupation ID": occupationIdMap[item.Occupation],
          "Occupation": item.Occupation,
          "Year": item.Year,
          "Median Earnings by Occupation and Gender: Occupation": item["Median Earnings by Occupation and Gender: Occupation"],
          "Median Earnings by Occupation and Gender Moe: Occupation": item["Median Earnings by Occupation and Gender Moe: Occupation"]
        }));

      dataWorkforce.forEach((d: any) => {
        const s = cleanedDataWage.find((h: any) => (h["Year"]*1  === d["Year"]*1) && (h["Occupation ID"]*1 === d["Occupation ID"]*1)) || {};
        d["Median Earnings"] = s["Median Earnings by Occupation and Gender: Occupation"];
        d["Median Earnings Moe"] = s["Median Earnings by Occupation and Gender Moe: Occupation"]
      });

      const tempData = dataWorkforce.slice()
    
      dataWorkforce.forEach((d: any) => {
        const s = tempData.find((h: any) => (h["Year"]*1  === d["Year"]*1- 1) && (h["Occupation ID"] === d["Occupation ID"])) || {};
        d["Workforce Prev"] = s["Workforce by Occupation and Gender"];
        d["Workforce Growth"] = ((d["Workforce by Occupation and Gender"] - d["Workforce Prev"]) / d["Workforce Prev"])*100
        d["Median Earnings Prev"] = s["Median Earnings"];
        d["Median Earnings Growth"] = ((d["Median Earnings"] - d["Median Earnings Prev"]) / d["Median Earnings Prev"])*100
      });

      nest()
        .key((d: any) => d["Year"])
        .entries(dataWorkforce)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Workforce by Occupation and Gender"]) 
          group.values.forEach((d: any) => {
              d["Share"] = (d["Workforce by Occupation and Gender"] / total) * 100
          });
        });

      if(growth === "value"){
        return dataWorkforce.filter((d: any) => (!cleanedDataWage.length || d["Median Earnings"] >= 0) && d["Workforce by Occupation and Gender"] >= 0)
      }
      else {
        return dataWorkforce.filter((d: any) => d["Year"] !== 2013 && d["Median Earnings"] && d["Workforce by Occupation and Gender"])
      }
    }
  }
  else {
    config.data = [pumsData, moeData],
    config.dataFormat = (resp: any) => {
      const dataWorkforce = resp[0].data.map((d: any) => Object.assign({}, d));
      const moe = resp[1].data.map((d: any) => Object.assign({}, d));

      const tempData = dataWorkforce.slice()

      dataWorkforce.forEach((d: any) => {
        const s = tempData.find((h: any) => (h["Year"]*1  === d["Year"]*1- 1) && (h["Detailed Occupation ID"]  === d["Detailed Occupation ID"])) || {};
        d["Workforce Prev"] = s["Total Population"];
        d["Workforce Growth"] = ((d["Total Population"] - d["Workforce Prev"]) / d["Workforce Prev"])*100
        d["Wage Prev"] = s["Average Wage"];
        d["Average Wage Growth"] = ((d["Average Wage"] - d["Wage Prev"]) / d["Wage Prev"])*100
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
      
      dataWorkforce.forEach((d: any) => {
        const s = moe.find((h: any) => (h["Year"]*1  === d["Year"]*1- 1) && (h["Detailed Occupation ID"]  === d["Detailed Occupation ID"])) || {};
        d["Total Population MOE Appx"] = s["Total Population MOE Appx"];
      });

      if(growth === "value"){
        return dataWorkforce.filter((d: any) => d["Average Wage"])
      }
      else {
        return dataWorkforce.filter((d: any) => d["Year"]*1 !== 2013 && d["Average Wage"])
      }
    }
  }

  if(growth !== "growth"){
    config.shapeConfig = {
      label: (d: any, i: any, x: any) => measure === "workforce" ? [d[drilldown], `${abbreviate(d.Share)}%`] : [d[drilldown], salary(d[colorWage])]
    }
    if (measure === "workforce"){
      config.shapeConfig.fill = (d: any) => color[d[`${parent_} ID`]]
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
      label: (d: any, i: any, x: any) =>  [d[drilldown], `${abbreviate(d[varColorScale])}%`]
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
