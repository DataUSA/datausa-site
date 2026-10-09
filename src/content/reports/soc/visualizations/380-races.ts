// Converted from legacy canon_cms_section_visualization #380 "section races" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {hierarchy, id, colorGrey, colorHighlight, colorGender, iconGender, name, tesseract} = variables;
  const {abbreviate, growth, growthPct, dollar, abs, commas, salary} = formatters;
  const {max, nest, sum} = libs.d3;

  const chartSelector = swap("[[races-filter]]") // genderraceR, racesR, shareR
  const measure = chartSelector === "genderraceR" ? "Total Population" : "share"

  const selector = swap("[[races-employment]]") // employedR, unemployedR
  const selectorName = swap("{{[[races-employment]]}}")
  const workstatus = selector === "employedR" ? "true" : "false"

  const dataGender: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year%2CRace,Gender&include=${hierarchy}:${id};Workforce+Status:${workstatus}&locale=en&measures=Record+Count%2CTotal+Population,Total+Population+MOE+Appx&filters=Record+Count.gte.5`
  const dataShare: any = [`${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year%2CRace&include=${hierarchy}:${id};Workforce+Status:${workstatus}&locale=en&measures=Record+Count%2CTotal+Population,Total+Population+MOE+Appx&filters=Record+Count.gte.5`,
                     `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year%2CRace&include=Workforce+Status:${workstatus}&locale=en&measures=Record+Count%2CTotal+Population,Total+Population+MOE+Appx&filters=Record+Count.gte.5`]

  const dataURL = chartSelector === "genderraceR" ? dataGender : dataShare

  return{
    data: dataURL,
    dataFormat: (resp: any) => {
      if (chartSelector === "shareR"){
      
        const dataRaces = resp[0].data;
        const dataCountry = resp[1].data;
      
        dataRaces.forEach((d: any) => {
          d["title"] = name
          d["Race"] = d["Race ID"] === 5 ? "Other Native" : d["Race ID"] === 7 ? "Native Hawaiian or Pacific Islander" : d["Race"]
        })
      
        dataCountry.forEach((d: any) => {
          d["title"] = "USA"
          d["Race"] = d["Race ID"] === 5 ? "Other Native" : d["Race ID"] === 7 ? "Native Hawaiian or Pacific Islander" : d["Race"]
        })
      
        const dataFinal = dataRaces.concat(dataCountry)

        libs.d3.nest()
          .key((d: any) => `${d.Year}_${d.title}`)
          .entries(dataFinal)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d["Total Population"]);
            group.values.forEach((d: any) => d.share = d["Total Population"] / total);
          });

        return dataFinal;
      }
      else{
        const data = resp.data;
        data.forEach((d: any) => {
          d["Race"] = d["Race ID"] === 5 ? "Other Native" : d["Race ID"] === 7 ? "Native Hawaiian or Pacific Islander" : d["Race"]
        })
        return data; 
      }
    },
    barPadding: 0,
    discrete: "x",
    groupBy: chartSelector === "genderraceR" ? "Gender ID" : "title",
    groupPadding: 5,
    label: chartSelector === "genderraceR" ? (d: any) => String(d["Gender"]) : "",
    legend: true,
    legendConfig: {
      label: chartSelector === "genderraceR" ? (d: any) => d.Gender : (d: any) => d["title"],
      shapeConfig: {
        backgroundImage: chartSelector === "genderraceR" ? (d: any) => iconGender[d["Gender"]] : ""
      }
    },
    legendTooltip: {
      tbody: []
    },
    shapeConfig: chartSelector === "shareR" ? { 
        fill: (d: any) => d.title === "USA" ? colorGrey : colorHighlight 
      } : { 
        fill: (d: any) => colorGender[d.Gender]
    },
    time: "Year",
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        chartSelector === "genderraceR" ?
          customTooltip = [
            ["Race", d["Race"]],
            ["Gender", d["Gender"]],
            [selectorName, commas(d["Total Population"])]
          ] : 
          customTooltip = [
            ["Race", d["Race"]],
            [selectorName, commas(d["Total Population"])],
          ]
        return customTooltip;
      }
    },
    type: "BarChart",
    x: "Race",
    xConfig: { 
      title: "" 
    },
    y: measure,
    yConfig: { 
      tickFormat: chartSelector === "genderraceR" ? (d: any) => `${abbreviate(d)}` : (d: any) => `${abbreviate(d * 100)}%`,
      title: chartSelector === "genderraceR" ? "Total Population" : "Share"
    },
  }
};

export default viz;
