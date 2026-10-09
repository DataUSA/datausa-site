// Converted from legacy canon_cms_generator #634 "[Education] No Schooling" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 634,
  name: "[Education] No Schooling",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,Age,Group,Gender&measures=Total Population&include=${attrs.hierarchy}:${attrs.id}&time=Year.latest&Group=No Schooling`,
  logic: (resp, {libs}) => {
    const data = resp.data.filter((d: any) => d["Age"]*1 >= 25)

    const lastYearNoSchooling: any = data[0] ? data[0]["Year"] : false

    const dataWomen = data.filter((d: any) => d["Gender ID"] === 2)
    const dataMen = data.filter((d: any) => d["Gender ID"] === 1)

    const noSchoolingWomen = libs.d3.sum(dataWomen, (d: any) => d["Total Population"]);
    const noSchoolingMen = libs.d3.sum(dataMen, (d: any) => d["Total Population"]);

    return{
      lastYearNoSchooling,
      noSchoolingWomen,
      noSchoolingMen
    }
  }
};

export default generator;
