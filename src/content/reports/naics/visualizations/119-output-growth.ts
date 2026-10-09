// Converted from legacy canon_cms_section_visualization #119 "section output_growth" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {

    //  `/api/data?Industry=${id}&measures=Industry Output&year=all`,
    //  "/api/data?measures=Industry Output&year=all"

  const {colorHighlight, colorGrey, id, tesseract, blsIDsList} = variables;
  const {abbreviate, bucket, commas, dollar} = formatters;

  const dataURL1: string = `${tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&Industry=${blsIDsList}&drilldowns=Year,Industry&measures=Industry Output&filters=Industry Output.gt.0`
  const dataURL2: string = `${tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&drilldowns=Year&measures=Industry Output&filters=Industry Output.gt.0`

  console.log({dataURL1})

  return {
    data: [
      dataURL1,
      dataURL2
    ],
    dataFormat: (responses: any) => {
      responses[1].data.forEach((d: any) => {
        d["Industry"] = "National";
        d["Industry Output National"] = d["Industry Output"];
        delete d["Industry Output"];
      });
      return responses[0].data.concat(responses[1].data);
    },
    discrete: "x",
    groupBy: "Industry",
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Industry"]==="National" ? colorGrey : colorHighlight
      },
      sort: (d: any) => d["Industry"] === "National" ? -1 : 1
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Output", (d: any) => d["Industry Output"] ? dollar(d["Industry Output"]) : dollar(d["Industry Output National"])]
      ]
    },
    type: "LinePlot",
    x: "Year",
    xSort: (a: any, b: any) => a["Year"] - b["Year"],
    y: "Industry Output",
    y2: "Industry Output National",
    yConfig: {
      tickFormat: (d: any) => dollar(d),
      titleConfig: {
        fontColor:colorHighlight
      },
      title: "Labor Productivity"
    },
    y2Config: {
      tickFormat: (d: any) => dollar(d),
      title: "National Total",
      titleConfig: {
        fontColor: "#211f1a"
      }
    }
  }
};

export default viz;
