// Converted from legacy canon_cms_section_visualization #135 "section job_growth" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorHighlight, colorGrey, id, tesseract} = variables;
  const {abbreviate, bucket, commas} = formatters;

  const dataURL1: string = `${tesseract}tesseract/data.jsonrecords?Occupation=${id}&cube=bls_growth_occupation&drilldowns=Year%2COccupation&measures=Occupation+Employment`
  const dataURL2: string = `${tesseract}tesseract/data.jsonrecords?cube=bls_growth_occupation&drilldowns=Year&measures=Occupation+Employment`

  return {
    data: [
     // `/api/data?Occupation=${id}&measures=Occupation Employment&year=all`,
     // "/api/data?measures=Occupation Employment&year=all"
     dataURL1,
     dataURL2
    ],
    dataFormat: (responses: any) => {
      responses[1].data.forEach((d: any) => {
        d["Occupation"] = "National";
        d["Occupation Employment National"] = d["Occupation Employment"];
        delete d["Occupation Employment"];
      });
      return responses[0].data.concat(responses[1].data);
    },
    groupBy: "Occupation",
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Occupation"] === "National" ? colorGrey : colorHighlight
      },
      sort: (d: any) => d["Occupation"] === "National" ? -1 : 1
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["People", (d: any) => d["Occupation Employment"] ? abbreviate(d["Occupation Employment"]) : abbreviate(d["Occupation Employment National"])]
      ]
    },
    type: "LinePlot",
    x: "Year",
    xSort: (a: any, b: any) => a["Year"] - b["Year"],
    y: "Occupation Employment",
    y2: "Occupation Employment National",
    yConfig: {
      title: "Employees",
      titleConfig: {
        fontColor: colorHighlight
      }
    },
    y2Config: {
      title: "National Workforce",
      titleConfig: {
        fontColor: "#211f1a"
      }
    }
  }
};

export default viz;
