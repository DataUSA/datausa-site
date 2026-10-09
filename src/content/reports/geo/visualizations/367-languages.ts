// Converted from legacy canon_cms_section_visualization #367 "section languages" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {id, colorHighlight, languageCount, tesseract, hierarchy} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, commas} = formatters;

  const measure: string = "Languages Spoken";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    data: `${tesseract}tesseract/data?cube=acs_ygl_language_spoken_at_home_by_english_ability_2016_5&include=${hierarchy}:${id}&measures=${measureEncoded}&drilldowns=Year,Language+Spoken+at+Home`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.Share = d[measure] / total);
        });
      return data.filter((d: any) => d["Language Spoken at Home ID"] !== 0);
    },
    groupBy: "Language Spoken at Home",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Households", (d: any) => commas(d["Languages Spoken"])],
        ["Share", (d: any) => `${abbreviate(d["Share"] * 100)}%`]
      ]
    },
    type: "Treemap",
    shapeConfig: {
      fill: (d: any) => colorHighlight
    },
    sum: "Share"
  }
};

export default viz;
