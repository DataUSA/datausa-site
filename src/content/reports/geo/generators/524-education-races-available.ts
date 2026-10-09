// Converted from legacy canon_cms_generator #524 "[Education] Races Available" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 524,
  name: "[Education] Races Available",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    const {max} = libs.d3;
    const {hierarchy, id} = variables
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] * 1 === currYear * 1);

    const prefix = id.slice(0, 3)
    const notDistrict = prefix !== "500"

    const educationRaceSelector: any = [];


    data.reduce((a: any, b: any) => {
        let key = b["IPEDS Race ID"];
          if (!a[key]) {
            a[key] = {"option": `ipedsRace${b["IPEDS Race ID"]}`, 
                      "label": b["IPEDS Race"],
                      "allowed": notDistrict ? "always" : false
            };
            educationRaceSelector.push(a[key]);
      }
      return a
    }, {});

    educationRaceSelector.unshift({"label": "All", "option": "ipedsRace0", "allowed": notDistrict ? "always" : false})

    //const pums5RaceDefault = pums5RaceSelector[0] ? pums5RaceSelector[0].option : "pums5Race0"; 

    return {
      educationRaceSelector: educationRaceSelector,
    }
  }
};

export default generator;
