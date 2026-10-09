// Converted from legacy canon_cms_generator #454 "[Tuition Costs] Tuition (Sector)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 454,
  name: "[Tuition Costs] Tuition (Sector)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition_by_cip&drilldowns=Year%2CSector&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=State+Tuition%2COut+Of+State+Tuition`,
  logic: (resp, {libs, formatters, variables}) => {
    const {name} = variables;
    const {commas, salary, growing, growthPct} = formatters;
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const dataPrev = resp.data.filter((d: any) => d["Year"] === latestYear - 1);

    const pubCurr = data.filter((d: any) => d["Sector ID"] === 1)[0];
    const pvtCurr = data.filter((d: any) => d["Sector ID"] === 2)[0];
    const pubPrev = dataPrev.filter((d: any) => d["Sector ID"] === 1)[0];
    const pvtPrev = dataPrev.filter((d: any) => d["Sector ID"] === 2)[0];

    const tuitionPublicOOSCurr: any = pubCurr ? pubCurr["Out Of State Tuition"] : false;
    const tuitionPublicStateCurr: any = pubCurr ? pubCurr["State Tuition"] : false;
    const tuitionPrivateCurr: any = pvtCurr ? pvtCurr["Out Of State Tuition"] : false;
    const tuitionPublicOOSPrev: any = pubPrev ? pubPrev["Out Of State Tuition"] : false;
    const tuitionPublicStatePrev: any = pubPrev ? pubPrev["State Tuition"] : false;
    const tuitionPrivatePrev: any = pvtPrev ? pvtPrev["Out Of State Tuition"] : false;

    let tuitionText: any = "";

    if (tuitionPublicStateCurr && tuitionPrivateCurr){
      tuitionText = `Tuition costs for ${name} majors are, on average, ${salary(tuitionPublicStateCurr)} for in-state public colleges, and ${salary(tuitionPrivateCurr)} for out of state private colleges.`;
    }

    else if (tuitionPublicStateCurr){
      tuitionText = `Tuition costs for ${name} majors are, on average, ${salary(tuitionPublicStateCurr)} for in-state public colleges.`;
    }

    else if (tuitionPrivateCurr) {
      tuitionText = `Tuition costs for ${name} majors are, on average, ${salary(tuitionPrivateCurr)} for out of state private colleges.`;
    }

    const tuitionPrivateGrowth = formatters.growth({curr: tuitionPrivateCurr, prev: tuitionPrivatePrev})

    let statSubtitle: any = ""

    if (tuitionPrivateCurr && tuitionPrivatePrev) {
      statSubtitle = `${growing(tuitionPrivateGrowth)} ${growthPct(tuitionPrivateGrowth)}`
    }

    return {
      tuitionPublicOOSCurr: tuitionPublicOOSCurr,
      tuitionPublicStateCurr: tuitionPublicStateCurr ? `$${commas(tuitionPublicStateCurr)}` : false,
      tuitionPrivateCurr: tuitionPrivateCurr ? `$${commas(tuitionPrivateCurr)}` : false,
      tuitionPublicOOSPrev: tuitionPublicOOSPrev,
      tuitionPublicStatePrev: tuitionPublicStatePrev,
      tuitionPrivatePrev: tuitionPrivatePrev,
      tuitionPublicOOSGrowth: formatters.growth({curr: tuitionPublicOOSCurr, prev: tuitionPublicOOSPrev}),
      tuitionPublicStateGrowth: formatters.growth({curr: tuitionPublicStateCurr, prev: tuitionPublicStatePrev}),
      tuitionPrivateGrowth,
      tuitionText: tuitionText,
      tuitionCostsVis: data[0] ? true : false,
      tuitionStatSubtitle: statSubtitle
    }




  }
};

export default generator;
