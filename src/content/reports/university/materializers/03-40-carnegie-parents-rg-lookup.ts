// Converted from legacy canon_cms_materializer #40 "Carnegie Parents RG Lookup" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 40,
  name: "Carnegie Parents RG Lookup",
  ordering: 3,
  allowed: "always",
  logic: (variables, {libs, formatters}) => {
    const {_nameCarnegieParent, carnegieParentsRGList, nameCarnegieParent} = variables;
    const {sum} = libs.d3;
    const {abbreviate} = formatters;

    let rgs = carnegieParentsRGList.filter((d: any) => d["Carnegie Parent"] == _nameCarnegieParent);
    const rgTotal = sum(rgs, (d: any) => d["Enrollment"]);
    rgs = rgs.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");

    const carnegieParentsRGSentences = rgs.slice(0, 3).map((d: any) => `${abbreviate((d["Enrollment"] / rgTotal) * 100)}% ${d["IPEDS Race"]}`);

    let enrollmentCarnegieText: any = ""

    if(nameCarnegieParent && carnegieParentsRGSentences){
      enrollmentCarnegieText = `By comparison, enrollment for all ${nameCarnegieParent} is ${formatters.list(carnegieParentsRGSentences)}.`
    }

    return {
      carnegieParentsRGSentences,
      enrollmentCarnegieText
    }
  }
};

export default materializer;
