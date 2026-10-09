// Converted from legacy canon_cms_generator #671 "Main Config" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 671,
  name: "Main Config",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=${attrs.hierarchy},Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&parents=true&time=Year.latest.2&filters=Record+Count.gte.5`,
  logic: (resp, {formatters}) => {
    const yearMembers = resp.data.map((d: any) => d["Year"]).sort((a: any, b: any) => a - b);

    const dataCurrYear = resp.data[1];
    const dataPrevYear = resp.data[0];

    const level = "Industry Group ID" in dataCurrYear ? 3: "Industry Sub-Sector ID" in dataCurrYear ? 2 : 1;

    const industries: any = ["Industry Sector", "Industry Sub-Sector", "Industry Group"];

    const rate: any = dataPrevYear ? 1 - dataPrevYear["Total Population"] / dataCurrYear["Total Population"] : false;

    const prev: any = dataPrevYear ? dataPrevYear["Total Population"] : false;
    const curr = dataCurrYear["Total Population"];

    const parentName: any = level > 1 ? dataCurrYear[industries[level - 2]] : null;
    const parentId: any = level > 1 ? dataCurrYear[`${industries[level - 2]} ID`] : null;

    const topParentName = dataCurrYear["Industry Sector"];
    const topParentId = dataCurrYear["Industry Sector ID"];

    return {
      naicsPrevYear: dataPrevYear ? dataPrevYear["Year"] : false,
      naicsCurrYear: dataCurrYear["Year"],
      naicsWorkforcePrevYear: dataPrevYear ? dataPrevYear["Total Population"] : false,
      naicsWorkforceLastYear: dataCurrYear["Total Population"],
      naicsWorkforceRate: formatters.growth({curr, prev}),
      naicsWorkforceGrowth: rate >= 0 ? "growing" : "declining",
      naicsParentName: parentName? `<span>${parentName}</span>` : null,
      naicsParentID: parentId? parentId : null,
      naicsLevel: level,
      naicsLevelName: industries[level - 1],
      naicsTopParentID: topParentId,
      naicsTopParentName: topParentName
    }
  }
};

export default generator;
