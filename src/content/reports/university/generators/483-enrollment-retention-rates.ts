// Converted from legacy canon_cms_generator #483 "[Enrollment] Retention Rates" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 483,
  name: "[Enrollment] Retention Rates",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Full+Time+Retention+Rate&time=Year.latest`,
  logic: (resp, {libs}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const retentionYearCurr: any = data.length > 0 ? data[0]["Year"] : false
    const retentionRate: any = data.length > 0 ? data[0]["Full Time Retention Rate"] : false

    //if (!data.length) return {};

    return {
      retentionYearCurr: retentionYearCurr ? retentionYearCurr : false,
      retentionRate: retentionRate ? retentionRate : false
    }
  }
};

export default generator;
