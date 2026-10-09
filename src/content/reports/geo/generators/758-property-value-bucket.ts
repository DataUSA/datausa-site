// Converted from legacy canon_cms_generator #758 "Property Value (Bucket)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 758,
  name: "Property Value (Bucket)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygo_housing_value_bucket_5&include=${attrs.hierarchy}:${attrs.id}&measures=Property+Value+by+Bucket&drilldowns=Year,Value+Bucket&sort=Property+Value+by+Bucket.desc&time=Year.latest`,
  logic: (resp) => {
    return {
      propertyBucket_propertyValue: resp.data[0]["Value Bucket"]
    }
  }
};

export default generator;
