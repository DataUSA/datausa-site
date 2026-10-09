// Converted from legacy canon_cms_generator #469 "[Establishments] By Size" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 469,
  name: "[Establishments] By Size",
  allowed: "CBPSection",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,Industry,Size,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id};Industry:11,21,22,23,31-33,42,44-45,48-49,51,52,53,54,55,56,61,62,71,72,81&locale=en&measures=Number+of+Establishments&time=Year.latest`,
  logic: (resp, {formatters}) => {

    ///api/data?Geography=<id>&year=latest&drilldowns=Industry Sector&measures=Total Number of Establishments

    const data = resp.data;
    const {commas} = formatters;

    const industryNameShort: Record<string, any> = {
      "11-21" : "Agriculture & Mining",
      "48-49, 22" : "Transportation & Utilities",
      "51" : "Information",
      "23" : "Construction",
      "42" : "Wholesale Trade",
      "71-72" : "Arts, Recreation & Food Services",
      "81" : "Other Services",
      "31-33" : "Manufacturing",
      "44-45" : "Retail Trade",
      "54-56" : "Professional, Scientific & Waste Management",
      "52-53" : "Finance, Insurance & Real Estate",
      "61-62" : "Education, Health & Social Assistance"
    }

    const lastYearEstablishments: any = data[0] ? data[0]["Year"] : false;

    data.sort((a: any, b: any) => b["Number of Establishments"] > a["Number of Establishments"] ? 1 : -1);

    const establishmentValue1: any = data[0] ? data[0]["Number of Establishments"] : false
    const establishmentIndustry1: any = data[0] ? data[0]["Industry"] : false

    const establishmentValue2: any = data[1] ? data[1]["Number of Establishments"] : false
    const establishmentIndustry2: any = data[1] ? data[1]["Industry"] : false

    const establishmentValue3: any = data[2] ? data[2]["Number of Establishments"] : false
    const establishmentIndustry3: any = data[2] ? data[2]["Industry"] : false

    return {
      lastYearEstablishments,
      establishmentValue1,
      establishmentIndustry1,
      establishmentValue2,
      establishmentIndustry2,
      establishmentValue3,
      establishmentIndustry3
    };
  }
};

export default generator;
