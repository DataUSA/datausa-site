// Converted from legacy canon_cms_section_visualization #324 "section instructors_sex" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {id, colorGender, iconGender, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;

  const {nest, sum} = libs.d3;

  const measure: string = "Total Instructional Employees";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    //data: `/api/data?University=${id}&measures=Total Instructional Employees&drilldowns=Academic%20Rank,Gender`,
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Academic+Rank%2CGender,Year,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=Total+Instructional+Employees`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      
      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      });

      return data;
    },
    discrete: "x",
    groupBy: ["Sex"],
    label: "",
    shapeConfig: {
      fill: (d: any) => colorGender[d.Sex]
    },
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      }
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d[`${hierarchy}`]],
        ["Rank", (d: any) => d["Academic Rank"]],
        ["Number of Employees", (d: any) => commas(d[measure])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    legendTooltip: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d[`${hierarchy}`]],
        ["Number of Employees", (d: any) => commas(d[measure])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    barPadding: 0,
    groupPadding: 40,
    type: "BarChart",
    // legend: false,
    y: "share",
    yConfig: {
      title: "Share",
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    x: "Academic Rank",
    xConfig: {
      title: "",
      labelRotation: false,
      label: (d: any) => d["Academic Rank"]
    },
    xSort: (a: any, b: any) => b["share"] - a["share"]
  }
};

export default viz;
