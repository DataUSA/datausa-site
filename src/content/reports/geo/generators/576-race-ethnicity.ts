// Converted from legacy canon_cms_generator #576 "Race/Ethnicity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 576,
  name: "Race/Ethnicity",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_race_with_hispanic_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Race,Ethnicity,Year&measures=Hispanic%20Population,Hispanic%20Population%20Moe`,
  logic: (resp, {libs, formatters}) => {
    const {abbreviate} = formatters;
    const {max, sum} = libs.d3;

    const pop: string = "Hispanic Population";
    const moe: string = `${pop} Moe`;

    const latestYear = max(resp.data, (d: any) => d.Year);

    const data = resp.data
      .filter((d: any) => d.Year === latestYear)
      .sort((a: any, b: any) => b[pop] - a[pop]);

    const total = sum(data, (d: any) => d[pop]);
    data.forEach((d: any) => d.share = d[pop] / total);
    const hispanic = data.filter((d: any) => !d.Ethnicity.includes("Not"));
    const hispanicPop = sum(hispanic, (d: any) => d[pop]);
    const hispanicPopShare = hispanicPop / total * 100;

    const cleanRace = (d: any) => d
      .replace(" Alone", "")
      .replace("Some Other Race", "Other")
      .replace("Two or More Races", "Two+");
  
    const createName = (d: any) => `${cleanRace(d.Race)} (${d.Ethnicity.includes("Not") ? "Non-" : ""}Hispanic)`;

    const raceCutoff = 5;

    const retObj: Record<string, any> = {
      hispanicPop,
      hispanicPopShare,
      raceCutoff,
      raceData: data.slice(0, raceCutoff).map((d: any) => ({name: createName(d), share: d.share})),
      raceCurrYear: latestYear,
      raceTopRatio: data[0] ? data[0][pop] / data[1][pop] : false,
      raceNum: Array.from(new Set(data.map((d: any) => d.Race))).length,
      raceNumRaw: data.length
    };

    data.slice(0, 3)
      .forEach((d: any, i: any) => {
        retObj[`race${i + 1}Name`] = createName(d);
        retObj[`race${i + 1}Value`] = d[pop];
        retObj[`race${i + 1}Pct`] = d.share * 100;
        retObj[`race${i + 1}Moe`] = d[moe];
      });

    return retObj;
  }
};

export default generator;
