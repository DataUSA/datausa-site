// Converted from legacy canon_cms_materializer #55 "Visibility & Text" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 55,
  name: "Visibility & Text",
  ordering: 14,
  allowed: "always",
  logic: (variables) => {
    return {
      hidden: false,
      textNotNation_propertyTaxes: "pay taxes",
      textNotNation_propertyValue: "have a property value",
      textTaxValue1_propertyTaxes: "property tax",
      textTaxValue1_propertyValue: "property value",
      textTaxValue2_propertyTaxes: "owner-occupied housing units",
      textTaxValue2_propertyValue: "the households",
      textRentMortgage_homeownersMortgage: "homeowners with mortgage",
      textRentMortgage_rentOwn: "owner",
      crimesText_socialNeed_opt1 : "number of reported violent crimes offenses per 100,000 population",
      crimesText_socialNeed_opt2 : "number of deaths due to injury per 100,000 population",
      crimesText_socialNeed_opt3 : "number of deaths due to homicides per 100,000 population",
      crimesText_socialNeed_opt4 : "number of deaths due to firearm per 100,000 population",
      crimesText_socialNeed_opt5 : "number of motor vehicle crash deaths per 100,000 population"
    }
  }
};

export default materializer;
