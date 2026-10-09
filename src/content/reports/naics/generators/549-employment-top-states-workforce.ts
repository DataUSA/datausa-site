// Converted from legacy canon_cms_generator #549 "[Employment] Top States workforce" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 549,
  name: "[Employment] Top States workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=State,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population&sort=Total+Population.desc&time=Year.latest&limit=4`,
  logic: (resp, {formatters}) => {
    const lastData = resp.data;
    const lastYearEmploymentLocation = lastData[0].Year

    lastData.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);
    const top3_workforce_states = lastData.slice(0,3).map((d: any, i: any) => `<a href='/profile/geo/${d["State ID"]}'>${d.State}</a> (${formatters.abbreviate(d["Total Population"])})`)
    const top1_workforce_states = lastData.slice(0,1).map((d: any, i: any) => `<a href='/profile/geo/${d["State ID"]}'>${d.State}</a> (${formatters.commas(d["Total Population"])} workers)`)


    return {
      lastYearEmploymentLocation,
      top1_workforce_states,
      top3_workforce_states,
    }
  }
};

export default generator;
