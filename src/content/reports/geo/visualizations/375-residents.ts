// Converted from legacy canon_cms_section_visualization #375 "section residents" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {commas, abbreviate, abs, lowercase} = formatters;
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {extent, nest, sum} = libs.d3;

  const raceId = swap("[[pums5RacesPyramid]]").replace("pums5Race", "")
  const race = raceId*1 === 0 ? "" : `;Race:${raceId}`

  let dataURL: any = `${tesseract}tesseract/data?cube=pums_5&drilldowns=Year,Gender,Age&measures=Total+Population&include=${hierarchy}:${id}${race}`

  const ageBuckets = 5;

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
    
      const retData = nest()
        .key((d: any) => `${d.Year}_${Math.floor(d.Age / ageBuckets)}`)
        .entries(resp.data)
        .map((group: any) => {
        
          const total = sum(group.values, (d: any) => d["Total Population"])
          const ages = extent(group.values, (d: any) => d.Age);
        
          const dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
          const dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);
        
          const dataMale: Record<string, any> = {...dataMales[0]};
          delete dataMale.Age;
          const mod = ages[0] % ageBuckets;
          dataMale["Starting Age"] = ages[0] - mod;
          dataMale["Ending Age"] = dataMale["Starting Age"] + ageBuckets - 1;
          dataMale["Total Population"] = sum(dataMales, (d: any) => d["Total Population"]);
          dataMale["Percentage"] = (dataMale["Total Population"] / total) * 100;
        
          const dataFemale: Record<string, any> = {...dataFemales[0]};
          delete dataFemale.Age;
          dataFemale["Starting Age"] = dataMale["Starting Age"];
          dataFemale["Ending Age"] = dataMale["Ending Age"];
          dataFemale["Total Population"] = sum(dataFemales, (d: any) => d["Total Population"]);
          dataFemale["Percentage"] = (dataFemale["Total Population"] / total) * 100;
          return [dataMale, dataFemale];
        
        })
        .flat();
      
      return retData;
      
    },

    discrete: "y",
    groupBy: ["Gender"],
    groupPadding: 1,
    height: 500,
    label: (d: any) => `${d["Starting Age"]} to ${d["Ending Age"]}`,
    legend: true,
    legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]]
      }
    },
    /*legendTooltip: {
      tbody: [],
      title: (d: any) => d.Gender,
    },*/
    stacked: true,
    x: (d: any) => d["Gender ID"] === 1 ? d["Total Population"] * -1 : d["Total Population"],
    y: "Ending Age",
    shapeConfig: {
        Bar: {
          labelConfig: {
            padding: 2,
            fontSize: () => 12
          },
          fill: (d: any) => colorGender[d.Gender]
        }
      },
    time: "Year",
    type: "BarChart",
    xConfig: {
      title: false,
      tickFormat: (d: any) => abbreviate(abs(d))
    },
    yConfig: {
      title: false,
      ticks: [],
    },
    tooltipConfig: {
      tbody: [
        ["Age Bucket", (d: any) => `${d["Starting Age"]} to ${d["Ending Age"]}`],
        ["Residents", (d: any) => commas(d["Total Population"])],
        ["Share", (d: any) => `${abbreviate(d["Percentage"])}%`]
      ]
    }
  }
};

export default viz;
