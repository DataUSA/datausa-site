// Converted from legacy canon_cms_generator #743 "Completions" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 743,
  name: "Completions",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&locale=en&measures=Completions&include=${attrs.hierarchy}:${attrs.id}&time=Year.latest.2&sort=Completions.desc`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const prevYear = latestYear - 1
    const data = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : [];
    const dataPrev = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === prevYear) : [];

    const curr: any = data[0] ? data[0]["Completions"] : false;
    const prev: any = dataPrev[0] ? dataPrev[0]["Completions"] : false;

    const currYear = latestYear
    //const prevYear = resp.data[1]["Year"];

    const compGrowth = formatters.growth({curr, prev})

    let subtitle: any = ""

    if (curr > 0 && prev) {
      subtitle = `${formatters.growing(compGrowth)} ${formatters.growthPct(compGrowth)}`
    }

    else {
      subtitle = ""
    }


    return {
      curr,
      compCurrVis: curr >= 0 && curr != false ? true : false,
      compCurr: curr,
      compPrev: prev,
      compGrowth: formatters.growth({curr, prev}),
      compYearCurr: currYear,
      compYearPrev: prevYear,
      compSubtitle: subtitle,
    };
  }
};

export default generator;
