// Converted from legacy canon_cms_generator #589 "Main Config" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 589,
  name: "Main Config",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&measures=Total Population,Total Population MOE Appx,Record Count&drilldowns=${attrs.hierarchy},Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&filters=Record+Count.gte.5&parents=true&time=Year.latest.2`,
  logic: (resp, {libs, formatters}) => {
    const yearMembers = resp.data.map((d: any) => d["Year"]).sort((a: any, b: any) => a - b);

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);

    const dataCurrYear = resp.data.filter((d: any) => d["Year"] === latestYear)[0];
    const dataPrevYear = resp.data.filter((d: any) => d["Year"] === latestYear - 1)[0];

    const level = "Broad Occupation ID" in dataCurrYear ? 3 : "Minor Occupation Group ID" in dataCurrYear ? 2 : "Major Occupation Group ID" in dataCurrYear ? 1 : 4;

    const occupParentKeys: any = ["Major Occupation Group", "Minor Occupation Group", "Broad Occupation"];
    const occupations: any = ["Major Occupation Group", "Minor Occupation Group", "Broad Occupation", "Detailed Occupation"];
    const rate: any = dataPrevYear ? 1 - dataPrevYear["Total Population"] / dataCurrYear["Total Population"] : false;
    const rateMOE: any = dataPrevYear ? 1 - dataPrevYear["Total Population MOE Appx"] / dataCurrYear["Total Population MOE Appx"] : false;

    const prev: any = dataPrevYear ? dataPrevYear["Total Population"] : false;
    const prevMoe: any = dataPrevYear ? dataPrevYear["Total Population MOE Appx"] : false;
    const curr = dataCurrYear["Total Population"];
    const currMoe = dataCurrYear["Total Population MOE Appx"];

    const parent = dataCurrYear[occupParentKeys[level - 2]];
    const parentId = dataCurrYear[`${occupParentKeys[level - 2]} ID`];

    return {
      socPrevYear: dataPrevYear ? dataPrevYear["Year"] : false,
      socCurrYear: dataCurrYear["Year"],
      socWorkforcePrevYear: dataPrevYear ? dataPrevYear["Total Population"] : false,
      socWorkforceLastYear: dataCurrYear["Total Population"],
      socWorkforceLastYearMoe: dataCurrYear["Total Population MOE Appx"],
      socWorkforceRate: formatters.growth({curr, prev}),
      socWorkforceRateMOE: formatters.growth({curr, prev, currMoe, prevMoe}),
      socWorkforceGrowth: rate >= 0 ? "growing" : "declining",
      socParentName: level > 1 ? `<a href='/profile/soc/${parentId}'>${parent}</a>` : null,
      socParentID: level > 1 ? parentId : null,
      socLevel: level,
      socLevelName: occupations[level - 1]
    }
  }
};

export default generator;
