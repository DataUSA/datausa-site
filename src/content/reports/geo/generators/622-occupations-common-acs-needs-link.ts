// Converted from legacy canon_cms_generator #622 "Occupations (Common ACS) ⚠️ Needs Link" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 622,
  name: "Occupations (Common ACS) ⚠️ Needs Link",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygso_gender_by_occupation_c_5&include=${attrs.hierarchy}:${attrs.id}&measures=Workforce+by+Occupation+and+Gender&drilldowns=Occupation&sort=Workforce+by+Occupation+and+Gender.desc&time=Year.latest&limit=11`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;

    const measure: string = "Workforce by Occupation and Gender";

    const text = resp.data.slice(0, 3).map((d: any) => `${d["Occupation"]} (${commas(d[measure])} people)`);

    return {
      commonOccupationSplitACS: resp.data.length === 11,
      commonOccupationListACS: text
    }
  }
};

export default generator;
