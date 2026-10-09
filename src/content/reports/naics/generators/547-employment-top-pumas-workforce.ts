// Converted from legacy canon_cms_generator #547 "[Employment] Top PUMAS workforce" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 547,
  name: "[Employment] Top PUMAS workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=PUMA,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population&sort=Total+Population.desc&time=Year.latest&limit=4`,
  logic: (resp, {formatters}) => {
    // /api/data?<hierarchy>=<id>&drilldowns=PUMA&Workforce Status=true&measure=Total Population&order=Total Population&sort=desc&Year=<pumsLatestYear>&limit=3
    const currData = resp.data;

    const top3_workforce_pumas = currData.slice(0,3).map((d: any, i: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d.PUMA}</a> (${formatters.abbreviate(d["Total Population"])})`)

    return {
      top3_workforce_pumas
    }
  }
};

export default generator;
