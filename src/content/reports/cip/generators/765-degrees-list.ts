// Converted from legacy canon_cms_generator #765 "Degrees list" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 765,
  name: "Degrees list",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree&${attrs.hierarchy}=${attrs.id}&locale=en&measures=Completions&exclude=Degree:20,21`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Completions"] > 0);

    const degreesList = data.reduce((acc: any, d: any) => {
      acc.push({
        option: `degree${d[`Degree ID`]}`,
        label: d["Degree"],
      })
      return acc
    }, [])

    degreesList.unshift({"label": "All", "option": "degree0"})

    return{
      degreesList,
      degreeDefault: "degree0"
    }
  }
};

export default generator;
