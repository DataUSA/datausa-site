// Converted from legacy canon_cms_generator #498 "[Operations] Finances (Endowments)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 498,
  name: "[Operations] Finances (Endowments)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Endowment+Value,Investment+Income,Median+Total+Expenses&time=Year.latest.2`,
  logic: (resp, {libs, formatters, variables}) => {
    ///api/data?university=<id>&measures=Median Endowment Value,Investment Income,Median Total Expenses&order=Year&sort=desc

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"]*1 === latestYear*1);
    const dataPrev = resp.data.filter((d: any) => d["Year"] === latestYear - 1);
    const {name} = variables;

    if (data.length === 0) return {
      financeEndowment: false, 
      financeYearCurr: false, 
      financeExpText: "",
      financeEndowmentVis: false,
      financeRatio: false,
    };

    const financeYearCurr: any = data[0] ? data[0]["Year"] : false;
    const financeEndowment: any = data[0]["Median Endowment Value"] !== null ? data[0]["Median Endowment Value"] : false;
    const financeReturn: any = data[0]["Investment Income"] !== null ? data[0]["Investment Income"] : false;
    const financeExpenses: any = data[0]["Median Total Expenses"] !== null ? data[0]["Median Total Expenses"] : false;
    const financeRatio: any = financeEndowment !== null ? (financeReturn / financeEndowment) * 100 : false;

    const financeYearPrev: any = dataPrev.length > 0 ? dataPrev[0]["Year"] : false;
    const financeEndowmentPrev: any = dataPrev.length > 0 ? dataPrev[0]["Median Endowment Value"] : false;
    const financeGrowth: any = (financeEndowment && financeEndowmentPrev) ? formatters.growth({curr: financeEndowment, prev: financeEndowmentPrev}) : false;
    const financeEndowmentDiff: any = financeEndowment ? financeEndowment - financeEndowmentPrev : false;

    const financeExpText: any = financeExpenses ? `In ${financeYearCurr}, ${name} had a total salary expenditure of ${formatters.abbreviate(financeExpenses)}.` : false


    return {
      financeYearCurr,
      financeEndowment: financeEndowment ? financeEndowment : false,
      financeReturn,
      financeExpenses,
      financeRatio:  financeRatio ? `(${formatters.abbreviate(financeRatio)}%)` : "",
      financeYearPrev,
      financeEndowmentPrev,
      financeGrowth,
      financeEndowmentDiff,
      financeExpText,
      financeEndowmentVis: true,
    }
  }
};

export default generator;
