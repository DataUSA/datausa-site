// Converted from legacy canon_cms_generator #471 "[Establishments by Size] CBP Industries" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 471,
  name: "[Establishments by Size] CBP Industries",
  allowed: "CBPSection",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Industry&include=${attrs.hierarchy}:${attrs.id};Industry:11,21,22,23,31-33,42,44-45,48-49,51,52,53,54,55,56,61,62,71,72,81&locale=en&measures=Number+of+Establishments`,
  logic: (resp, {libs, variables}) => {
    const {max} = libs.d3;
    const {hierarchy} = variables

    const data = resp.data;

    const cbpIndustries: any = [];

    cbpIndustries.push({"label": "Overall", "option": "industry_0"})

    data.reduce((a: any, b: any) => {
        let key = b["Industry ID"];
          if (!a[key]) {
            a[key] = {"option": `industry_${b["Industry ID"]}`, 
                      "label": b["Industry"],
            };
            cbpIndustries.push(a[key]);
      }
      return a
    }, {});

    return {
      cbpIndustries,
    }
  }
};

export default generator;
