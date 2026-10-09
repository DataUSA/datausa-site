// Converted from legacy canon_cms_generator #494 "[Graduates] Graduation Rate by Race and Gender" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 494,
  name: "[Graduates] Graduation Rate by Race and Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year,Gender,IPEDS+Race&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Number+Of+Finishers,Graduation+Rate&sort=Graduation+Rate.desc&time=Year.latest&filters=Number+Of+Finishers.gte.5`,
  logic: (resp, {libs}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    let data = resp.data.filter((d: any) => d["Year"] === latestYear);

    data.sort((a: any, b: any) => {
        if (b["Graduation Rate"] !== a["Graduation Rate"]) {
            // Sort by Graduation Rate in descending order
            return b["Graduation Rate"] - a["Graduation Rate"];
        } else {
            // For same Graduation Rate, sort by Number Of Finishers in descending order
            return b["Number Of Finishers"] - a["Number Of Finishers"];
        }
    });

    if (!data.length) return {gradRateByRaceVis: false};
    const gradsUnknownCount = data.find((d: any) => d["IPEDS Race"] == "Unknown" && d["Gender"] == "Women")["Number Of Finishers"] + data.find((d: any) => d["IPEDS Race"] == "Unknown" && d["Gender"] == "Men")["Number Of Finishers"];

    const totalGrads = data.reduce((acc: any, d: any) => acc + d["Number Of Finishers"], 0);
    const gradsUnknownPercent = (gradsUnknownCount / totalGrads) * 100;

    const filteredResults = data.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");

    const top = filteredResults[0];
    const gradRateRGTop1Gender = top["Gender"] === "Women" ? "Female" : "Male";
    const gradRateRGTop1Race = top["IPEDS Race"];
    const gradRateRGTop1Name: string = `${gradRateRGTop1Race} ${gradRateRGTop1Gender}`;
    const gradRateRGTop1Percent = top["Graduation Rate"] * 100;

    return {
      gradRateRGTop1Gender,
      gradRateRGTop1Race,
      gradRateRGTop1Name,
      gradRateRGTop1Percent,
      gradsUnknownCount,
      gradsUnknownPercent,
      gradRateByRaceVis: true,
      gradRateRGYear: latestYear
    }
  }
};

export default generator;
