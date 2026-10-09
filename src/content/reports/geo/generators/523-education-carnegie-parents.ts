// Converted from legacy canon_cms_generator #523 "[Education] Carnegie Parents" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 523,
  name: "[Education] Carnegie Parents",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Carnegie+Parent&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Applicants+Total&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    const {max} = libs.d3;
    const {hierarchy} = variables

    const data = resp.data.filter((d: any) => d["Carnegie Parent"] !== "Unknown");

    const carnegieParents: any = [];

    //const visible = hierarchy === "Nation" || hierarchy === "State" || hierarchy === "PUMA"

    data.reduce((a: any, b: any) => {
        let key = b["Carnegie Parent ID"];
          if (!a[key]) {
            a[key] = {"option": `carnegie_${b["Carnegie Parent ID"]}`, 
                      "label": b["Carnegie Parent"],
                      //"allowed": visible ? "always" : false
            };
            carnegieParents.push(a[key]);
      }
      return a
    }, {});

    carnegieParents.push({"label": "All", "option": "carnegie_0"})

    //const pums5RaceDefault = pums5RaceSelector[0] ? pums5RaceSelector[0].option : "pums5Race0"; 

    return {
      carnegieParents: carnegieParents,
    }
  }
};

export default generator;
