// Converted from legacy canon_cms_section_visualization #280 "section bar" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorGrey, colorHighlight, id, colorOnet, iconOnet, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;

  const title = variables[swap("[[skill-bar-value-bar]]")];
  const measure = title === "Value" ? "LV Value" : "Total Score RCA";

  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_cip&location=${hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&cuts=${hierarchy}:${id}&parents=true`
  const dataValue: string = `${tesseract}tesseract/data.jsonrecords?${hierarchy}=${id}&cube=onet_by_cip&drilldowns=${hierarchy},Year%2CSkill+Element&measures=LV+Value&parents=true`

  //  data: `/api/data?measure=LV Value,RCA&CIP=${id}&drilldowns=Skill%20Element&parents=true`,

  return {
    cache: false,
    //data: `/api/data?measure=LV Value,RCA&CIP=${id}&drilldowns=Skill Element`,
    data: [dataValue, dataRCA],
    dataFormat: (resp: any) => {
      const dataValue = resp[0].data;
      const dataRCA = resp[1].data;
    
      let combinedData: Record<string, any> = {};

      dataValue.forEach((item: any) => {
          let key: any = `${item.Year}-${item['Skill Element ID']}-${item[`${hierarchy} ID`]}`;
          combinedData[key] = { ...item };
      });
    
      dataRCA.forEach((item: any) => {
          let key: any = `${item.Year}-${item['Skill Element ID']}-${item[`${hierarchy} ID`]}`;
          if (combinedData[key]) {
              combinedData[key] = { ...combinedData[key], ...item };
          } else {
              combinedData[key] = { ...item };
          }
      });
      let result = Object.values(combinedData);
      return result
    },
    discrete: "y",
    groupBy: ["Skill Element Group", "Skill Element"],
    groupPadding: 2,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconOnet[d["Skill Element Group ID"]]
      }
    },
    legendTooltip: {
      tbody: () => []
    },
    shapeConfig: {
      fill: (d: any) => colorOnet[d["Skill Element Group ID"]]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Value", (d: any) => abbreviate(d["LV Value"])],
        ["RCA", (d: any) => abbreviate(d["Total Score RCA"])]
      ]
    },
    type: "BarChart",
    x: measure,
    height: 600,
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title
    },
    y: "Skill Element",
    yConfig: {
      shapeConfig: {
        labelConfig: {
          fontSize: () => 10,
          padding: 0
        }
      },
      title: "Skill"
    },
    ySort: (a: any, b: any) => {
      if (a["Skill Element Group ID"] > b["Skill Element Group ID"]) {
          return -1;
      } else if (a["Skill Element Group ID"] < b["Skill Element Group ID"]) {
          return 1;
      } else {
          // When "Skill Element Group ID" is the same, sort by "RCA" value in descending order
          return a[measure] < b[measure] ? -1 : 1;
      }
  }
  }
};

export default viz;
