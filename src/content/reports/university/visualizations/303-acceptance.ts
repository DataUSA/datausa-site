// Converted from legacy canon_cms_section_visualization #303 "section acceptance" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGender, id, iconGender, applicantsYearCurr, hierarchy, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=Applicants+Men%2CApplicants+Women%2CAdmissions+Men%2CAdmissions+Women`

  return {
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data.reduce((all: any, d: any) => {
        all.push(Object.assign({}, d, {
          "Gender": "Men",
          "Gender ID": 1,
          "Admissions": d["Admissions Men"],
          "Applicants": d["Applicants Men"],
          "Rate": d["Admissions Men"] / d["Applicants Men"]
        }));
        all.push(Object.assign({}, d, {
          "Gender": "Women",
          "Gender ID": 2,
          "Admissions": d["Admissions Women"],
          "Applicants": d["Applicants Women"],
          "Rate": d["Admissions Women"] / d["Applicants Women"]
        }));
        return all;
      }, []);
    
      let data_ = data.filter((d: any) => d["Year"] <= applicantsYearCurr)
    
      return data_;
    },
    height: 210,
    discrete: "y",
    groupBy: ["Gender"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => colorGender[d["Gender"]]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Applicants", (d: any) => `${commas(d["Applicants"])}`],
        ["Admissions", (d: any) => `${commas(d["Admissions"])}`],
        ["Acceptance Rate", (d: any) => `${abbreviate(d["Rate"] * 100)}%`]
      ]
    },
    barPadding: 0,
    groupPadding: 0,
    type: "BarChart",
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Gender]
      }
    },
    x: "Rate",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Acceptance Rate by Gender"
    },
    y: "Gender",
    yConfig: {
      labelRotation: false,
      title: "",
      ticks: []
    },
    ySort: (a: any, b: any) => b["Gender ID"] - a["Gender ID"]
  }
};

export default viz;
