// Converted from legacy canon_cms_generator #659 "Commute (Vehicles)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 659,
  name: "Commute (Vehicles)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygsv_gender_of_workers_by_vehicles_available_5&measures=Commute+Means+by+Gender&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Vehicles+Available,Year&time=Year.latest&sort=Vehicles+Available.desc`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    data.sort((a: any, b: any) => {return b["Commute Means by Gender"] > a["Commute Means by Gender"] ? 1 : -1})

    const first: any = data[0] ? data[0]["Vehicles Available ID"] : false;
    const second: any = data.length > 1 ? data[1]["Vehicles Available ID"] : false;
    const text = (n: any) => `${n} car${n === 1 ? "" : "s"}`;

    return {
      vehiclesNum: first,
      vehicles: text(first),
      vehicles2nd: second ? text(second) : false
    }
  }
};

export default generator;
