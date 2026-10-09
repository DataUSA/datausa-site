// Converted from legacy canon_cms_materializer #8 "Subtitles" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 8,
  name: "Subtitles",
  ordering: 4,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy, giniSubId, giniSubName, healthSpendGeoID, healthSpendGeoName, id, nameLower, providerGeoIDs, providerGeoNames} = variables;

    const pumaName = giniSubName || nameLower;
    const pumaId = giniSubId || id;

    const providerSub: any = !(providerGeoIDs || [id]).includes(id) ? `Data is only available at the ${providerGeoIDs.some((d: any) => d.includes("04000US")) ? "state" : "country"} level. Showing data for ${providerGeoNames}.` : false;
    const healthSpendSub: any = healthSpendGeoID !== id ? `Data is only available at the state level. Showing data for ${healthSpendGeoName}.` : false;
    const educationLowerLevels: string = `Data is only available at the state level. Showing data for ${healthSpendGeoName}.`

    return {
      providerSub,
      healthSpendSub,
      riskName: id === "01000US" ? nameLower : healthSpendGeoName,
      pumaName,
      pumaId,
      subtitlePums: !["Nation", "State", "PUMA"].includes(hierarchy)
        ? `The PUMS dataset is not available at the ${hierarchy} level, so we are showing data for ${pumaName.replace("PUMA", "public use microdata area")}.`
        : false,
      subtitleCounty: "Data available at the county level.",
      subtitleState: "Data only available at the state level.",
      subtitleTract: "Data available at the tract level.",
      subtitlePUMA: "Data available at the public use microdata area level (PUMA).",
      subtitlePlace: "Data available at the census designated place level.",
      subtitleMSA: "Data available at the metropolitan statistical area level (MSA)."
    }
  }
};

export default materializer;
