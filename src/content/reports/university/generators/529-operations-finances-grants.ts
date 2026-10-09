// Converted from legacy canon_cms_generator #529 "[Operations] Finances (Grants)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 529,
  name: "[Operations] Finances (Grants)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year&locale=en&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts&include=${attrs.hierarchy}:${attrs.id}&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    ///api/data?university=<id>&measures=Federal Grants And Contracts,State%20Grants%20And%20Contracts,Local%20Grants%20And%20Contracts&order=Year&sort=desc

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear && d["Federal Grants And Contracts"] && d["State Grants And Contracts"] && d["Local Grants And Contracts"]);
    const dataPrev = resp.data.filter((d: any) => d["Year"] === latestYear - 1);
    const {name} = variables;

    if (!data.length) return {
      financeGrants: false
    };

    const financeGrantsYearCurr: any = data.length > 0 ? data[0]["Year"] : false;
    const financeFederalGrants: any = data.length > 0 ? data[0]["Federal Grants And Contracts"] : false;
    const financeStateGrants: any = data.length > 0 ? data[0]["State Grants And Contracts"] : false;
    const financeLocalGrants: any = data.length > 0 ? data[0]["Local Grants And Contracts"] : false;

    return {
      financeGrantsYearCurr,
      financeFederalGrants,
      financeStateGrants,
      financeLocalGrants,
      financeGrants: true,
    }
  }
};

export default generator;
