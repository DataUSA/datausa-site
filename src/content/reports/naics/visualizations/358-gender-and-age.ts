// Converted from legacy canon_cms_section_visualization #358 "section gender_and_age" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {commas, abbreviate, abs, lowercase, dollar, salary} = formatters;
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {extent, nest, sum, mean} = libs.d3;

  const measure = swap("[[workforcePyramid]]") //workforce, wage
  const valueMeasure = measure === "workforce" ? "Total Population" : "Average Wage"
  const mathOp = measure === "workforce" ? sum : mean

  //let dataURL = `/api/data?drilldowns=Year,Gender,Age&measures=${valueMeasure}&${hierarchy}=${id}&Workforce Status=true&Record Count>=5`
  let dataURL: any = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Age,Year&include=${hierarchy}:${id};Workforce+Status:true&locale=en&measures=${valueMeasure}&filters=Record+Count.gte.5`

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
          //dataFemale[valueMeasure] = valueMeasure === "Total Population" ? sum(dataFemales, (d: any) => d[valueMeasure]) : mean(dataFemales, (d: any) => d[valueMeasure]) ;
          //dataFemale["Percentage"] = (dataFemale[valueMeasure] / total) * 100;
          dataFemale[valueMeasure] = dataFemales.length === 0 ? 0 : (valueMeasure === "Total Population" ? sum(dataFemales, (d: any) => d[valueMeasure]) : mean(dataFemales, (d: any) => d[valueMeasure]));
          dataFemale["Percentage"] = dataFemales.length === 0 ? 0 : (dataFemale[valueMeasure] / total) * 100;
        
          if (dataFemales.length === 0) {
            dataFemale["Year"] = year;
            dataFemale["Gender"] = "Female"
          }
        
          if (dataMales.length === 0) {
            dataMale["Year"] = year;
            dataMale["Gender"] = "Male"
          }
        
          dataMen.push(dataMale)
          dataWomen.push(dataFemale)

        });
    
      return dataWomen.concat(dataMen)
    },
  
    discrete: "y",
    groupBy: ["Gender"],
    groupPadding: 0,
    label: (d: any) => "", //(d: any) => `${d["Starting Age"]} to ${d["Ending Age"]}`,
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
    x: (d: any) => d["Gender ID"] === 1 ? d[valueMeasure] * -1 : d[valueMeasure], //tempName,
    y: "Starting Age",

    time: "Year",
    type: "BarChart",
    xConfig: {
      title: measure === "workforce" ? "Workforce" : "Average Wage",
      tickFormat: measure === "workforce" ? (d: any) => abbreviate(abs(d)) : (d: any) => salary(abs(d)) 
    },
    yConfig: {
      title: false,
      ticks: [],
    },

    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        measure === "workforce" ?
          customTooltip = [
            ["Age Bucket", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Workforce", commas(d["Total Population"])],
            ["Share", `${abbreviate(d["Percentage"])}%`]
          ] :
          customTooltip = [
            ["Age", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Average Wage", salary(d["Average Wage"])],
          ]
        return customTooltip;
      }
    },
    shapeConfig: {
      Bar: {
        fill: (d: any) => colorGender[d.Gender]
      }
    }
  }

};

export default viz;
