// Converted from legacy canon_cms_generator #452 "[Institutions] Degrees by University" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 452,
  name: "[Institutions] Degrees by University",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=University,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    let degreeUniversityCount: any;
    const {max} = libs.d3;
    const {commas} = formatters;
    const latestYear: any = resp.data[0] ? max(resp.data, (d: any) => d["Year"]) : false;
    const data: any = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : false;
    //const data = resp.data

    const url = (d: any) => `<a href='/profile/university/${d["University ID"]}'>${d["University"]}</a>`;

    degreeUniversityCount = data ? data.length >= 5 ? 5 : data.length : false;

    return {
      degree1ByUniversity: data[0] ? data[0] && url(data[0]) : false,
      degree1ByUniversityCompletions: data[0] ? commas(data[0]['Completions']) : false,
      degree2ByUniversity: data[1] ? data[1] && url(data[1]) : false,
      degree2ByUniversityCompletions:  data[1] ? commas(data[1]['Completions']) : false,
      degree3ByUniversity: data[2] ? data[2] && url(data[2]) : false,
      degree3ByUniversityCompletions:  data[2] ? commas(data[2]['Completions']) : false,
      degree1ByUniversityValue:  data[0] ? data[0] && data[0].Completions : false,
      degree1ByUniversityViz:  data[0] ? data[0].Completions === 0 ? false : true : false,
      degree1ByUniversityYear: data[0] ? data[0] && data[0].Year : false,
      degreeUniversityCount: degreeUniversityCount,
      institutionsSubSectionVis: data[0] ? true : false
    }
  }
};

export default generator;
