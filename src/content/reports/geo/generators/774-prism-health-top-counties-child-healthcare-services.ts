// Converted from legacy canon_cms_generator #774 "[Prism-Health] Top counties Child Healthcare Services" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 774,
  name: "[Prism-Health] Top counties Child Healthcare Services",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=prism_service_access&drilldowns=County&include=Health+Provider:4;State+County:${attrs.id}&locale=en&measures=Average+estimated+driving+distance+(miles),Household+Count&sort=Average+estimated+driving+distance+(miles).desc&limit=3&slugs=Geography:County`,
  logic: (resp, {formatters}) => {
    const data = resp.data.filter((d: any) => d["Average estimated driving distance (miles)"]);

    //const top1CountyName_health_4: any = data[0] ? data[0]["County"] : false;
    const top1CountyName_health_4: any = data[0] ? `<a href="/profile/geo/${data[0]["County Slug"]}#location-of-health-services-facilities" target="_blank">${data[0]["County"]}</a>` : false;
    const top1CountyHousehols_health_4: any = data[0] ? data[0]["Household Count"] : false;
    const top1CountyAvgDistance_health_4: any = data[0] ? data[0]["Average estimated driving distance (miles)"] : false;

    //const top2CountyName_health_4: any = data[1] ? data[1]["County"] : false;
    const top2CountyName_health_4: any = data[1] ? `<a href="/profile/geo/${data[1]["County Slug"]}#location-of-health-services-facilities" target="_blank">${data[1]["County"]}</a>` : false;
    const top2CountyHousehols_health_4: any = data[1] ? data[1]["Household Count"] : false;
    const top2CountyAvgDistance_health_4: any = data[1] ? data[1]["Average estimated driving distance (miles)"] : false;

    //const top3CountyName_health_4: any = data[2] ? data[2]["County"] : false;
    const top3CountyName_health_4: any = data[2] ? `<a href="/profile/geo/${data[2]["County Slug"]}#location-of-health-services-facilities" target="_blank">${data[2]["County"]}</a>` : false;
    const top3CountyHousehols_health_4: any = data[2] ? data[2]["Household Count"] : false;
    const top3CountyAvgDistance_health_4: any = data[2] ? data[2]["Average estimated driving distance (miles)"] : false;


    return{
      top1CountyName_health_4,
      top1CountyHousehols_health_4: formatters.commas(top1CountyHousehols_health_4),
      top1CountyAvgDistance_health_4: formatters.commas(top1CountyAvgDistance_health_4),
      top2CountyName_health_4,
      top2CountyHousehols_health_4: formatters.commas(top2CountyHousehols_health_4),
      top2CountyAvgDistance_health_4: formatters.commas(top2CountyAvgDistance_health_4),
      top3CountyName_health_4,
      top3CountyHousehols_health_4: formatters.commas(top3CountyHousehols_health_4),
      top3CountyAvgDistance_health_4: formatters.commas(top3CountyAvgDistance_health_4),
    }
  }
};

export default generator;
