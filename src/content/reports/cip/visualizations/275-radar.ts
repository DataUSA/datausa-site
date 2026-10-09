// Converted from legacy canon_cms_section_visualization #275 "section radar" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, id, tesseract, hierarchy} = variables;
  const {abbreviate} = formatters;

  const title = variables[swap("[[skill-radar-value-radar]]")];
  const measure = title === "Value" ? "LV Value" : "Total Score RCA";

  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_cip&location=${hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&cuts=${hierarchy}:${id}`
  const dataValue: string = `${tesseract}tesseract/data.jsonrecords?${hierarchy}=${id}&cube=onet_by_cip&drilldowns=${hierarchy},Year%2CSkill+Element&measures=LV+Value`

  return {
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
    shapeConfig: {
      Path: {
        stroke: colorHighlight,
        strokeOpacity: 1,
        strokeWidth: 2,
        fill: "transparent"
      }
    },
    legendTooltip: {
      tbody: () => []
    },
    time: "Year",
    metric: "Skill Element",
    groupBy: hierarchy,
    label: (d: any) => d["Skill Element"],
    tooltipConfig: {
      title: (d: any) => d["Skill Element"] ? d["Skill Element"] : false,
      tbody: (d: any) => [
        ["Value", abbreviate(d["LV Value"])],
        ["RCA", abbreviate(d["Total Score RCA"])]
      ]
    },
    value: measure,
    height: 600,
    type: "Radar"
  };
};

export default viz;
