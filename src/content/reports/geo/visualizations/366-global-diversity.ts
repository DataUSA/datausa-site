// Converted from legacy canon_cms_section_visualization #366 "section global_diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorScaleGood, pumsID, pumsHierarchy, tesseract} = variables;
  const {abbreviate, commas} = formatters;

  const data: string = `${tesseract}tesseract/data?cube=pums_5&include=${pumsHierarchy}:${pumsID};Nativity:2&measures=Total+Population&drilldowns=Birthplace,Year&properties=Country%20Code`
  const moe: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Birthplace&measures=+Total+Population+MOE+Appx&locale=en&parents=false&include=${pumsHierarchy}:${pumsID};Nativity:2`

  return {
    colorScale: "Total Population",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title: "Population"
      },
      color: colorScaleGood
    },
    data: [data, moe],
    dataFormat: (resp: any) => {
      const dataPop = resp[0].data;
      const dataMoe = resp[1].data;
    
      dataPop.forEach((popItem: any) => {
        const matchingMoeItem = dataMoe.find((moeItem: any) =>
            moeItem.Year === popItem.Year &&
            moeItem["Birthplace ID"] === popItem["Birthplace ID"]
        );
  
        if (matchingMoeItem) {
          popItem["Total Population MOE Appx"] = matchingMoeItem["Total Population MOE Appx"];
        } else {
          popItem["Total Population MOE Appx"] = null;
        }
      });

      return dataPop;
    },
    groupBy: "Country Code",
    label: (d: any) => d.Birthplace,
    projection: "geoMiller",
    tiles: false,
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Population", (d: any) => commas(d["Total Population"])],
        ["MOE", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    topojson: "/topojson/birthplace.json",
    topojsonFilter: (d: any) => d.id !== "ATA",
    type: "Geomap"
  }
};

export default viz;
