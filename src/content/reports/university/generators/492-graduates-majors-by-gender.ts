// Converted from legacy canon_cms_generator #492 "[Graduates] Majors by Gender" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 492,
  name: "[Graduates] Majors by Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,CIP6,Gender&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {

    ///api/data?university=<id>&measures=Completions&drilldowns=CIP6,Gender&order=Completions&sort=desc

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const {name} = variables;
    const {commas } = formatters;

    if (!data.length) return {
      commonMaleMajorsText: "",
      commonFemaleMajorsText: ""
    };
    const men = data.filter((d: any) => d["Gender"] == "Men");
    const women = data.filter((d: any) => d["Gender"] == "Women");

    const url = (d: any) => `<a href='/profile/cip/${d["CIP6 ID"]}'>${d["CIP6"]}</a>`;

    const majorMaleTop1Name = url(men[0]);
    const majorMaleTop1Count = men[0]["Completions"];
    const majorFemaleTop1Name = url(women[0]);
    const majorFemaleTop1Count = women[0]["Completions"];

    const majorFemaleOtherCount = women.find((d: any) => url(d) == majorMaleTop1Name)["Completions"];
    const majorMaleOtherCount = men.find((d: any) => url(d) == majorFemaleTop1Name)["Completions"];

    const majorMaleRatio = majorMaleTop1Count / majorFemaleOtherCount;
    const majorMaleRatioDiff = majorMaleTop1Count - majorFemaleOtherCount;
    const majorFemaleRatio = majorFemaleTop1Count / majorMaleOtherCount;
    const majorFemaleRatioDiff = majorFemaleTop1Count - majorMaleOtherCount;

    let textFemale: any = ""
    let textMale: any = ""


    // Male

    if (majorMaleTop1Count > 0 && majorFemaleOtherCount > 0) {
      textMale = `In ${latestYear}, ${commas(majorMaleTop1Count)} degrees were awarded to men at ${name} in ${majorMaleTop1Name}, which is ${formatters.abbreviate(majorMaleRatio)} times ${formatters.moreWord(majorMaleRatioDiff)} the ${commas(majorFemaleOtherCount)} female recipients with that same degree.`
    }

    else if (majorMaleTop1Count > 0 && majorFemaleOtherCount == 0) {
      textMale = `In ${latestYear}, ${commas(majorMaleTop1Count)} degrees were awarded to men at ${name} in ${majorMaleTop1Name}. There were no female recipients with the same degree.`
    }

    // Female

    if (majorFemaleTop1Count > 0 && majorMaleOtherCount > 0) {
      textFemale = `In ${latestYear}, ${commas(majorFemaleTop1Count)} degrees were awarded to men at ${name} in ${majorFemaleTop1Name}, which is ${formatters.abbreviate(majorFemaleRatio)} times ${formatters.moreWord(majorFemaleRatioDiff)} the ${commas(majorMaleOtherCount)} male recipients with that same degree.`
    }

    else if (majorFemaleTop1Count > 0 && majorMaleOtherCount == 0) {
      textFemale = `In ${latestYear}, ${commas(majorFemaleTop1Count)} degrees were awarded to women at ${name} in ${majorFemaleTop1Name}. There were no male recipients with the same degree.`
    }

    return {
      majorMaleTop1Name: majorMaleTop1Name,
      majorMaleTop1Count: majorMaleTop1Count,
      majorFemaleTop1Name: majorFemaleTop1Name,
      majorFemaleTop1Count: majorFemaleTop1Count,
      majorMaleRatio: majorMaleRatio,
      majorFemaleRatio: majorFemaleRatio,
      majorMaleOtherCount: majorMaleOtherCount,
      majorFemaleOtherCount: majorFemaleOtherCount,
      majorMaleRatioDiff: majorMaleRatioDiff,
      majorFemaleRatioDiff: majorFemaleRatioDiff,
      majorGenderYear: latestYear,
      commonMaleMajorsText: textMale,
      commonFemaleMajorsText: textFemale
    }
  }
};

export default generator;
