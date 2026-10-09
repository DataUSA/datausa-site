// Converted from legacy canon_cms_section_visualization #95 "section enrolled_sex" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGrey, colorGender, iconGender, id, universityTop5, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;

  const measure: string = "Completions";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const universities = (universityTop5 || []).join(",");

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Gender,Year,University&include=${hierarchy}:${id};University:${universities}&locale=en&measures=Completions&sort=Completions.desc`

  return {
    barPadding: 0,
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      });
    
      return data;
    },
    groupBy: "Sex",
    groupPadding: 25,
    shapeConfig: {
      Bar: {
        label: ""
      },
      fill: (d: any) => colorGender[d.Sex]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d.University],
        ["Degrees Awarded", (d: any) => commas(d[measure])]
      ]
    },
    legendConfig: {
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      }
    },
    legendTooltip: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d[measure])]
      ]
    },
    type: "BarChart",
    y: measure,
    yConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title: "Degrees Awarded"
    },
    x: "University",
    xConfig: {
      title: "University",
      labelRotation: false,
      label: (d: any) => d.University
    },
    xSort: (a: any, b: any) => b["Completions"] - a["Completions"]
  };

};

export default viz;
