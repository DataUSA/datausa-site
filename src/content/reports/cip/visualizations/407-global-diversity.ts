// Converted from legacy canon_cms_section_visualization #407 "section global_diversity" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {id, tesseract, cip2} = variables;
  const {abbreviate, abbreviateBig} = formatters;

  const title = variables[swap("[[birthplace-measure-global_diversity]]")];
  const measure = title === "People in Workforce" ? "Total Population" : "Total Population RCA";

  const data: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=Birthplace&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce%20Status:true;Nativity:2&filters=Record+Count.gte.5&properties=Country+Code`
  //const dataCodes  = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Birthplace&locale=en&measures=Total+Population&properties=Country+Code`

  return {
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title
      }
    },
    data: data,
    downloadData: data,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Country Code"] !== "" && d["Country Code"] !== null)
      //const dataCodes = resp[1].data.filter((d: any) => d["Country Code"] !== "" && d["Country Code"] !== null)
    
      // data.forEach((d: any) => {
      //   const countryMatch = dataCodes.find((s: any) => s["Birthplace"] === d["Birthplace"])
      
      //   d["Country Code"] = countryMatch ? countryMatch["Country Code"] : ""
      // })
    
      data.filter((d: any) => d["Country Code"] !== "")
      return data
    },
    groupBy: "Country Code",
    label: (d: any) => d["Birthplace"],
    ocean: "#d4dadc",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => `${abbreviateBig(d["Total Population"])}`],
        ["People in Workforce (RCA)", (d: any) => `${abbreviate(d["Total Population RCA"])}`]
      ]
    },
    topojson: `/topojson/Birthplace.json`,
    topojsonFilter: (d: any) => !["ATA"].includes(d.id),
    type: "Geomap"
  };

};

export default viz;
