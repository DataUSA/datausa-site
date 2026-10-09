// Converted from legacy canon_cms_section_visualization #374 "section gender-and-age" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {commas, abbreviate, abs, lowercase, dollar, salary} = formatters;
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {extent, nest, sum, mean} = libs.d3;

  const selector = swap("[[gender-and-age-employment]]") //employedGA, unemployedGA
  const workforceStatus = selector === "employedGA" ? "true" : "false"

  const measure = swap("[[gender-and-age-measure]]") // workforce: indicator_1, wage: indicator_2
  let valueMeasure: any = ""//measure === "indicator_1" ? "Total Population" : "Average Wage"

  let dataURL: any = []
  if (measure === "indicator_2" && selector === "employedGA"){
    dataURL = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Age,Year&include=Workforce+Status:true;${hierarchy}:${id}&locale=en&measures=Record+Count,Average+Wage&filters=Record+Count.gte.5`
    valueMeasure = "Average Wage"
  }

  else{
    dataURL = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Age,Year&include=Workforce+Status:${workforceStatus};${hierarchy}:${id}&locale=en&measures=Record+Count,Total+Population&filters=Record+Count.gte.5`
    valueMeasure = "Total Population"
  }

  const ageBuckets = 5;

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      let dataWomen: any = [];
      let dataMen: any = [];
      const {data} = resp;
      nest()
        .key((d: any) => `${d.Year}_${Math.floor(d.Age / ageBuckets)}`)
        .entries(data.filter((d: any) => d["Age"] < 90))
        .map((group: any) => {
      
          const year = group.key.substring(0, 4)
          const total = sum(group.values, (d: any) => d[valueMeasure])
          const ages = extent(group.values, (d: any) => d.Age);
        
          const dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
          const dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);

          const dataMale: Record<string, any> = {...dataMales[0]};
          delete dataMale.Age;
          dataMale["Starting Age"] = ages[0];
          dataMale["Ending Age"] = ages[1];
          dataMale[valueMeasure] = dataMales.length === 0 ? 0 : (valueMeasure === "Total Population" ? sum(dataMales, (d: any) => d[valueMeasure]) : mean(dataMales, (d: any) => d[valueMeasure]));
          dataMale["Percentage"] = dataMales.length === 0 ? 0 : (dataMale[valueMeasure] / total) * 100;
    
  
          const dataFemale: Record<string, any> = {...dataFemales[0]};
          delete dataFemale.Age;
          dataFemale["Starting Age"] = ages[0];
          dataFemale["Ending Age"] = ages[1];
          dataFemale[valueMeasure] = dataFemales.length === 0 ? 0 : (valueMeasure === "Total Population" ? sum(dataFemales, (d: any) => d[valueMeasure]) : mean(dataFemales, (d: any) => d[valueMeasure]));
          dataFemale["Percentage"] = dataFemales.length === 0 ? 0 : (dataFemale[valueMeasure] / total) * 100;
        
          if (dataFemales.length === 0) {
            dataFemale["Year"] = year*1;
            dataFemale["Gender"] = "Female"
          }
        
          if (dataMales.length === 0) {
            dataMale["Year"] = year*1;
            dataMale["Gender"] = "Male"
          }
        
          dataMen.push(dataMale)
          dataWomen.push(dataFemale)

        });
      return dataWomen.concat(dataMen)
    },

    discrete: "y",
    groupBy: ["Gender"],
    groupPadding: 3,
    label: "",
    legend: true,
    legendConfig: {
      label: (d: any) => d.Gender,

      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]]
      }
    },
    legendTooltip: {
      tbody: [],
      //title: (d: any) => d.Gender,
    },
    stacked: true,
    x: (d: any) => d["Gender ID"] === 1 ? d[valueMeasure] * -1 : d[valueMeasure],
    y: "Starting Age",

    time: "Year",
    timeline: true,
    type: "BarChart",
    xConfig: {
      title: false,
      tickFormat: (measure === "indicator_1" || selector === "unemployedGA") ? (d: any) => abbreviate(abs(d)) : (d: any) => salary(abs(d))
    },
    yConfig: {
      title: false,
      ticks: [],
    },
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        (measure === "indicator_1" || selector === "unemployedGA") ?
          customTooltip = [
            ["Age Bucket", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Gender", d["Gender"]],
            ["Workforce", commas(d["Total Population"])],
            ["Share", `${abbreviate(d["Percentage"])}%`]
          ] : 
          customTooltip = [
            ["Age Bucket", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Gender", d["Gender"]],
            ["Average Wage", salary(d["Average Wage"])],
          ];
        return customTooltip;
      }
    },
    shapeConfig: {
      Bar: {
          fill: (d: any) => colorGender[d.Gender]
        }
      },
  }
};

export default viz;
