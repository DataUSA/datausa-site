// Converted from legacy canon_cms_generator #623 "Occupations (Common PUMS)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 623,
  name: "Occupations (Common PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id}&measures=Total+Population,Record+Count&filters=Record+Count.gte.5&time=Year.latest&drilldowns=Detailed+Occupation&sort=Total+Population.desc&Workforce+Status=true&limit=11`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;

    const commonOccupations = resp.data
      .map((d: any) => d["Detailed Occupation ID"]);
  
    const top5num = commonOccupations.slice(0, 5).length;

    return {
      commonOccupations,
      commonOccupations5text: top5num === 5 && commonOccupations.length > 5 
        ? "5 most common" : "",
      commonOccupationSplitPUMS: resp.data.length === 11,
      commonOccupationPUMSnames: resp.data.slice(0, 3).map((d: any) => `<a href="/profile/soc/${d["Detailed Occupation ID"] || d["Detailed Occupation ID"]}">${d["Detailed Occupation"]}</a>`),
      commonOccupationListPUMS: resp.data.slice(0, 3).map((d: any) => `<a href="/profile/soc/${d["Detailed Occupation ID"] || d["Detailed Occupation ID"]}">${d["Detailed Occupation"]}</a> (${commas(d["Total Population"])} people)`)
    }
  }
};

export default generator;
