// Converted from legacy canon_cms_section_visualization #118 "section job_growth" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorHighlight, colorGrey, id, blsIDsList, tesseract} = variables;
  const {abbreviate, bucket, commas} = formatters;

  const dataURL1: string = `${tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&Industry=${blsIDsList}&drilldowns=Year,Industry&measures=Industry Jobs`
  const dataURL2: string = `${tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&drilldowns=Year&measures=Industry Jobs`

  // `/api/data?Industry=${id}&measures=Industry Jobs&year=all`,
  // "/api/data?measures=Industry Jobs&year=all"

  return {
    data: [
      dataURL1,
      dataURL2
    ],
    dataFormat: (responses: any) => {
      responses[1].data.forEach((d: any) => {
        d["Industry"] = "National";
        d["Industry Jobs National"] = d["Industry Jobs"];
        delete d["Industry Jobs"];
      });
    
      console.log(responses[0].data.concat(responses[1].data))
      return responses[0].data.concat(responses[1].data);
    },
    groupBy: "Industry",
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Industry"] === "National" ? colorGrey : colorHighlight
      },
      sort: (d: any) => d["Industry"] === "National" ? -1 : 1
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["People", (d: any) => d["Industry Jobs"] ? abbreviate(d["Industry Jobs"]) : abbreviate(d["Industry Jobs National"])]
      ]
    },
    type: "LinePlot",
    x: "Year",
    xSort: (a: any, b: any) => a["Year"] - b["Year"],
    y: "Industry Jobs",
    y2: "Industry Jobs National",
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
