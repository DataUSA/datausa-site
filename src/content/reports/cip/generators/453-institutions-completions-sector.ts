// Converted from legacy canon_cms_generator #453 "[Institutions] Completions (Sector)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 453,
  name: "[Institutions] Completions (Sector)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,Sector&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    //const data = resp.data

    if(!resp.data[0]){
      return {
        topSector: false,
        topSectorValue: false,
        topSectorYear: false,
        topSectorText: false,
      }
    }

    let string: any = ""

    if (data[0].Completions == 0) {
      string = ""
    }

    else {
      string = `The most common sector, by number of degrees awarded, is ${data[0].Sector} (${formatters.abbreviateBig(data[0].Completions)} completions).`
    }

    return {
      topSector: data[0].Sector,
      topSectorValue: data[0].Completions,
      topSectorYear: data[0].Year,
      topSectorText: string,
    }
  }
};

export default generator;
