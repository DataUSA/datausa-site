// Converted from legacy canon_cms_section_visualization #384 "section majors" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorCIP, iconCIP, id, hierarchy, tesseract} = variables;
  const {abbreviateBig, commas, abbreviate} = formatters;

  const degree = swap("[[degree-majors]]") // bachelorsDegree, mastersDegree, professionalDegree, doctorateDegree
  const degreeID = degree === "bachelorsDegree" ? "21" : degree === "mastersDegree" ? "22" : degree === "professionalDegree" ? "23" : "24" 
  const addDegree = degree === "allDegree" ? "" :`;Degree:${degreeID}`

  const selector = swap("[[majors-select]]") // commonMajors, specializedMajors

  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=${hierarchy}&activity=CIP2&measure=Total+Population&time=Year&cuts=${hierarchy}:${id};Workforce%20Status:true${addDegree}&complementary_drilldowns=Workforce%20Status&filters=Record+Count.gte.5`

  let colorScaleMeasure: any = "";
  if (selector === "commonMajors"){ colorScaleMeasure = false  }
  else {colorScaleMeasure = "Total Population RCA"}

  const config: Record<string, any> = {
    data: dataRCA,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["CIP2 ID"] !== "");
      return data;
    },
    groupBy: ["CIP2"],
    legend: true,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconCIP[d["CIP2 ID"]]
      }
    },
    sum: "Total Population",
    time: "Year",
    colorScale: colorScaleMeasure,
    colorScaleConfig: {
        scale: "linear",
        axisConfig: {
          shapeConfig: {
            labelConfig: {fontsize: () => 14}
          }
        }
      },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
       // ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["People in Workforce (RCA)", (d: any) => abbreviate(d["Total Population RCA"])]
      ]
    },
    total: "Total Population",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap",
  //  height: 500
  }


  if (colorScaleMeasure) {
    config.shapeConfig = {
      fill: "D3PLUS-COMMON-RESET",
      label: (d: any) => [ String(d["CIP2"]), abbreviate(d["Total Population RCA"])]
    }
  }

  else {  
    config.shapeConfig = {
      fill: (d: any) => colorCIP[d["CIP2 ID"]] || "#ef6145",
      label: (d: any) => [ String(d["CIP2"]), abbreviate(d["Total Population"])]
    }
  }


  return config;

};

export default viz;
