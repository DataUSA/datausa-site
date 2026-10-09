// Converted from legacy canon_cms_section_visualization #318 "section rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGender, id, iconGender, hierarchy, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  return {
    //data: `/api/data?University=${id}&measures=Graduation Rate,Number Of Finishers&drilldowns=Gender&Number Of Finishers>=5&IPEDS Race=nonresident`,
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year,Gender&include=IPEDS+Race:nonresident;${hierarchy}:${id}&locale=en&measures=Number+Of+Finishers%2CGraduation+Rate&filters=Number Of Finishers.gte.5`,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      })
 
      return data
    },
    height: 180,
    discrete: "y",
    groupBy: ["Sex"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => colorGender[d["Sex"]]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Sex", (d: any) => d.Sex],
        ["Graduation Rate", (d: any) => `${abbreviate(d["Graduation Rate"] * 100)}%`],
        ["Number of Students", (d: any) => commas(d["Number Of Finishers"])]
      ]
    },
    barPadding: 0,
    groupPadding: 0,
    type: "BarChart",
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      }
    },
    x: "Graduation Rate",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Non-resident Aliens"
    },
    y: "Sex",
    yConfig: {
      labelRotation: false,
      title: "",
      ticks: []
    },
    ySort: (a: any, b: any) => b["Sex ID"] - a["Sex ID"]
  }
};

export default viz;
