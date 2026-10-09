// Converted from legacy canon_cms_section_visualization #299 "section netprice" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGrey, colorHighlight, id, idCarnegie, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Median Average Net Price Grant Or Scholarship Aid";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`


  return {
    data: dataCarnegieParent,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD")

      return data;
    },
    discrete: "y",
    groupBy: ["Carnegie Parent"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Average Net Price", (d: any) => `$${commas(d[measure])}`]
      ]
    },
    barPadding: 5,
    groupPadding: 10,
    type: "BarChart",
    legend: false,
    x: measure,
    xConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: "Average Net Price"
    },
    y: "Carnegie Parent",//"University" "Carnegie Parent",
    yConfig: {
      labelRotation: false,
      title: "University",
      ticks: []
    },
    ySort: (a: any, b: any) => a[measure] - b[measure]
  }
};

export default viz;
