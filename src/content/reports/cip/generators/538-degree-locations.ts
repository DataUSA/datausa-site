// Converted from legacy canon_cms_generator #538 "Degree Locations" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 538,
  name: "Degree Locations",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Place,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs, formatters, variables}) => {
    ///api/data?CIP=<id>&measures=Completions&drilldowns=Place&order=Completions&sort=desc

    const {max} = libs.d3;
    const {name} = variables;
    const {list} = formatters;

    const data_ = resp.data.filter((d: any) => d["Place ID"] != "None");

    const latestYear = max(data_, (d: any) => d["Year"]);
    const data = data_.filter((d: any) => d["Year"] === latestYear);
    //const data = resp.data

    const locations = data.filter((loc: any) => loc["Place"] !== "None");
    const url = (d: any) => `<a href='/profile/geo/${d["Place ID"]}'>${d["Place"]}</a>`;
    const degreeTopLocations = locations.slice(0, 3).map(url);


    let string: any = "";

    if (degreeTopLocations.length > 1) {
      string = `In ${latestYear}, the locations with the highest concentration of ${name} degree recipients are ${list(degreeTopLocations)}.`
    }

    else if (degreeTopLocations.length === 1) {
      string = `In ${latestYear}, the locations with the highest concentration of ${name} degree recipients is ${degreeTopLocations}.`
    }

    else {
      string = ""
    }

    return {
      degreeTopLocationsText: string,
      degreeTopLocations: degreeTopLocations,
      degreeTopLocationsYear: latestYear
    }
  }
};

export default generator;
