// Converted from legacy canon_cms_generator #518 "[Education] Degrees" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 518,
  name: "[Education] Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree,${attrs.hierarchy},Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {variables}) => {
    const {hierarchy, id} = variables;
    if (!resp.data.length) return {degreesYear: false};
    const d = resp.data[0];

    const degreesAvailable = resp.data.map((d: any) => d["Degree ID"]);

    return {
      degreesYear: d.Year,
      degreesTop: `degree${degreesAvailable[0]}`,
      degreesAvailable,
      ipedsName: d[`${hierarchy}`],
      ipedsSubtitle: d[`${hierarchy} ID`] !== id
        ? `Data not available at the ${hierarchy} level, showing data for ${d[`${hierarchy}`]}.` : false
    }

  }
};

export default generator;
