// Converted from legacy canon_cms_generator #551 "[Employment] Top States specialization" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 551,
  name: "[Employment] Top States specialization",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=State&activity=${attrs.hierarchy}&measure=Total+Population&time=Year&cuts=${attrs.hierarchy}:${attrs.id};Workforce%20Status:true`,
  logic: (resp, {libs, formatters}) => {
    // /api/data?<hierarchy>=<id>&drilldowns=State&Workforce Status=true&measure=Total Population,Average Wage,ygipop RCA&Year=<pumsLatestYear>
    // <tesseract>complexity/rca_historical.jsonrecords?cube=pums_5&location=State&activity=<hierarchy>&measure=Total+Population&time=Year&cuts=<hierarchy>:<id>;Workforce%20Status:true

    const lastYearEmploymentLocation = libs.d3.max(resp.data, (d: any) => d["Year"])

    const lastData = resp.data.filter((d: any) => d["Year"] === lastYearEmploymentLocation)

    lastData.sort((a: any, b: any) => b["Total Population RCA"] > a["Total Population RCA"] ? 1 : -1);

    const top3_specialization_states = lastData.slice(0,3).map((d: any, i: any) => `<a href='/profile/geo/${d["State ID"]}'>${d.State}</a> (${formatters.abbreviate(d["Total Population RCA"])})`)
    return {
      lastYearEmploymentLocation_v2: lastYearEmploymentLocation,
      top3_specialization_states,
    }
  }
};

export default generator;
