// Converted from legacy canon_cms_section_visualization #281 "section skills" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, id, colorOnet, iconOnet, hierarchy, tesseract} = variables;
  const {abbreviate, salary, commas} = formatters;
  const selector = swap("[[skills-chart-type]]") // radarSkills, barchartSkills

  const measureSelector = swap("[[skills-measure]]") // valueSkills, rcaSkills
  const measure = measureSelector === "valueSkills" ? "LV Value" : "Total Score RCA"

  if (selector == "radarSkills") {

    const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_pums&location=${hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&cuts=${hierarchy}:${id}`
    const dataValue: string = `${tesseract}tesseract/data.jsonrecords?cube=onet_by_pums&drilldowns=Year,Skill+Element,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=LV+Value`
  
    return {
      data: [dataRCA, dataValue],
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
      label: (d: any) => d["Skill Element"],
      legendTooltip: {
        tbody: () => []
      },
      tooltipConfig: {
        tbody: (d: any) => [
          ["Value", abbreviate(d["LV Value"])],
          ["RCA", abbreviate(d["Total Score RCA"])]
        ]
      },
      time: "Year",
      metric: "Skill Element",
      groupBy: hierarchy,
      value: measure,
      height: 600,
      type: "Radar"
    };
  }

  else {

    const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_pums&location=${hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&parents=true&cuts=${hierarchy}:${id}`
    const dataValue: string = `${tesseract}tesseract/data.jsonrecords?cube=onet_by_pums&drilldowns=Year,Skill+Element,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=LV+Value&parents=true`
  
    return {
      data: [dataRCA, dataValue],
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
        measure
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
  }
};

export default viz;
