// Converted from legacy canon_cms_section_visualization #420 "section children_in_poverty" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {id, tesseract, hierarchy, lenDataChildrenPoverty} = variables;
  const {growthPct} = formatters;

  const measure: string = "Children In Poverty";

  if(lenDataChildrenPoverty > 1){
    return {
      data: `${tesseract}tesseract/data?cube=county_health_ranking&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year&measures=${measure},${measure} CI Low,${measure} CI High`,
      dataFormat: (resp: any) => {
        const data = resp.data;
        return data.filter((d: any) => d[measure]);
      },
      confidence: [
        (d: any) => d[`${measure} CI Low`], 
        (d: any) => d[`${measure} CI High`], 
       ],
      confidenceConfig: {
          fillOpacity: 0.3,
      },
      groupBy: [`${hierarchy} ID`],
      height: 250,
      label: (d: any) => String(d[hierarchy]),
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d["Year"]],
          [measure, (d: any) => growthPct(d[measure]*100)],
          [`${measure} CI Low`, (d: any) => growthPct(d[`${measure} CI Low`]*100)],
          [`${measure} CI High`, (d: any) => growthPct(d[`${measure} CI High`]*100)]
        ]
      },
      type: "LinePlot",
      x: "Year",
      xConfig: {
        title: ""
      },
      y: measure,
      yConfig: {
        title: measure,
        tickFormat: (d: any) => growthPct(d*100)
      }
    }
  }
  else{
    return {
      data: `${tesseract}tesseract/data?cube=county_health_ranking&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year&measures=${measure},${measure} CI Low,${measure} CI High`,
      dataFormat: (resp: any) => {
        const data = resp.data;
        return data.filter((d: any) => d[measure]);
      },
      /*confidence: [
        (d: any) => d[`${measure} CI Low`], 
        (d: any) => d[`${measure} CI High`], 
       ],
      confidenceConfig: {
          fillOpacity: 0.3,
      },*/
      groupBy: [`${hierarchy} ID`],
      height: 250,
      label: (d: any) => String(d[hierarchy]),
      shapeConfig: {
        width: 200
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d["Year"]],
          [measure, (d: any) => growthPct(d[measure]*100)],
          [`${measure} CI Low`, (d: any) => growthPct(d[`${measure} CI Low`]*100)],
          [`${measure} CI High`, (d: any) => growthPct(d[`${measure} CI High`]*100)]
        ]
      },
      type: "BarChart",
      x: "Year",
      xConfig: {
        title: ""
      },
      y: measure,
      yConfig: {
        title: measure,
        tickFormat: (d: any) => growthPct(d*100)
      }
    }
  }
};

export default viz;
