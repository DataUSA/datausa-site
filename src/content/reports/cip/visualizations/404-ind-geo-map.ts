// Converted from legacy canon_cms_section_visualization #404 "section ind_geo_map" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, albersUsaPr}) => {
  const {cip2, tesseract} = variables;
  const {abbreviate, salary} = formatters;

  const data: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=PUMA&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce%20Status:true&filters=Record+Count.gte.5`
  const data2: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,PUMA&measures=Total+Population,Total+Population+MOE+Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record+Count&include=CIP2:${cip2};Workforce+Status:true&locale=en&filters=Record+Count.gte.5`

  return {
    colorScale: "Total Population RCA",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title: "People in Workforce (RCA)"
      }
    },
    data: [data, data2],
    dataFormat: (resp: any) => {
      const data = resp[0].data.filter((d: any) => d["PUMA ID"] !== "")
      const dataMeasures = resp[1].data.filter((d: any) => d["PUMA ID"] !== "")
    
      const rcaLookup = new Map();
      data.forEach((item: any) => {
        const key: string = `${item.Year}-${item["PUMA ID"]}`;
        rcaLookup.set(key, item["Total Population RCA"]);
      });
    
      dataMeasures.forEach((obj: any) => {
        const key: string = `${obj.Year}-${obj["PUMA ID"]}`;
        if (rcaLookup.has(key)) {
          obj["Total Population RCA"] = rcaLookup.get(key);
        }
      });
      console.log(dataMeasures)
      return dataMeasures
    },
    groupBy: "PUMA ID",
    height: 500,
    label: (d: any) => d["PUMA"],
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce (RCA)", (d: any) => abbreviate(d["Total Population RCA"])],
        ["People in Workforce", (d: any) => abbreviate(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${abbreviate(d["Total Population MOE Appx"])}`],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± $${abbreviate(d["Average Wage Appx MOE"])}`]
      ]
    },
    ocean: "transparent",
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoAlbersUsa",
    topojson: `/topojson/PUMA.json`,
    time: "Year",
    type: "Geomap",
    topojsonId: (d: any) => d.id
  };

};

export default viz;
