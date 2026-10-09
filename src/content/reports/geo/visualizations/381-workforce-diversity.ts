// Converted from legacy canon_cms_section_visualization #381 "section workforce_diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  let dataMales: any; let dataFemales: any;
  const {commas, abbreviate, abs, lowercase, dollar} = formatters;
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {extent, nest, sum} = libs.d3;

  const raceId = swap("[[pums5WorkforcePyramid]]").replace("pums5Race", "")
  const raceName = swap("{{[[pums5WorkforcePyramid]]}}")
  const race = raceId*1 === 0 ? "" : `&Race=${raceId}`

  const measure = swap("[[measureWorkforcePyramid]]") //workforce, wage
  const valueMeasure = measure === "workforce" ? "Total Population" : "Average Wage"
  const measureURL = measure === "workforce" ? "Total+Population" : "Average+Wage"

  let dataURL: any = `${tesseract}tesseract/data?cube=pums_5&drilldowns=Year,Gender,Age&measures=${measureURL}&include=${hierarchy}:${id}${race}&Workforce+Status=true`

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
        
          const total = sum(group.values, (d: any) => d[valueMeasure])
          const ages = extent(group.values, (d: any) => d.Age);
        
          dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
          dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);
          const mod = ages[0] % ageBuckets;
        
          if (dataMales.length) {
            const dataMale: Record<string, any> = {...dataMales[0]};
            delete dataMale.Age;
            dataMale["Starting Age"] = ages[0] - mod;
            dataMale["Ending Age"] = dataMale["Starting Age"] + ageBuckets - 1;
            dataMale[valueMeasure] = sum(dataMales, (d: any) => d[valueMeasure]);
            dataMale["Percentage"] = (dataMale[valueMeasure] / total) * 100;
            dataMen.push(dataMale)
          }
    
          if (dataFemales.length) {
            const dataFemale: Record<string, any> = {...dataFemales[0]};
            delete dataFemale.Age;
            dataFemale["Starting Age"] = ages[0] - mod;
            dataFemale["Ending Age"] = dataFemale["Starting Age"] + ageBuckets - 1;
            dataFemale[valueMeasure] = sum(dataFemales, (d: any) => d[valueMeasure]);
            dataFemale["Percentage"] = (dataFemale[valueMeasure] / total) * 100;
            dataWomen.push(dataFemale)
          }

        });
      
      return dataWomen.concat(dataMen)

    },
    discrete: "y",
    groupBy: ["Gender"],
    groupPadding: 2,
    height: 500,
    label: (d: any) => `${d["Starting Age"]} to ${d["Ending Age"]}`,
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
      tickFormat: measure === "workforce" ? (d: any) => abbreviate(abs(d)) : (d: any) => dollar(abs(d)) 
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
            ["Race", raceName],
            ["Age Bucket", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Workforce", commas(d["Total Population"])],
            ["Share", `${abbreviate(d["Percentage"])}%`]
          ] :
          customTooltip = [
            ["Race", raceName],
            ["Age", `${d["Starting Age"]} to ${d["Ending Age"]}`],
            ["Average Wage", dollar(d["Average Wage"])],
          ]
        return customTooltip;
      }
    },
    shapeConfig: {
      Bar: {
        labelConfig: {
          padding: 2,
          fontSize: () => 12
        },
        fill: (d: any) => colorGender[d.Gender]
      }
    }
  }

};

export default viz;
