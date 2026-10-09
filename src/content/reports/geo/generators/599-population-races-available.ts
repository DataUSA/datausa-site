// Converted from legacy canon_cms_generator #599 "[Population] Races Available" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 599,
  name: "[Population] Races Available",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Race&measures=Total+Population`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const data = resp.data;

    let pums5RaceSelector: any = [];

    data.reduce((a: any, b: any) => {
        let key = b["Race ID"];
          if (!a[key]) {
            a[key] = {"option": `pums5Race${b["Race ID"]}`, 
                      "label": b["Race"],
                      "allowed": "always"
            };
            pums5RaceSelector.push(a[key]);
      }
      return a
    }, {});

    pums5RaceSelector.push({"label": "All", "option": "pums5Race0", "allowed": "always"})


    return {
      pums5RaceSelector,
    }
  }
};

export default generator;
