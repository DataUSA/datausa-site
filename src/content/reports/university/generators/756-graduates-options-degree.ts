// Converted from legacy canon_cms_generator #756 "[Graduates] Options Degree" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 756,
  name: "[Graduates] Options Degree",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree&${attrs.hierarchy}=${attrs.id}&locale=en&measures=Completions&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d.Completions > 0); 

    const degreesList = data.reduce((acc: any, d: any) => {
      acc.push({
        option: `degree${d["Degree ID"]}`,
        label: d.Degree,
        allowed: "always"
      })
      return acc
    }, []);

    const degreeDefault: any = degreesList[0] ? degreesList[0].option : false; 

    return {
      degreesList,
      degreeDefault
    }

  }
};

export default generator;
