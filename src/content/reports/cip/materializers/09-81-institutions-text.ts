// Converted from legacy canon_cms_materializer #81 "[Institutions] Text" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 81,
  name: "[Institutions] Text",
  ordering: 9,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {degree1ByUniversity, degree1Share, degree2Share, name, degree1ByUniversityValue, degree1SharePct, degree2SharePct} = variables;
    const {commas, abbreviate} = formatters;

    let institutionsText: any = ""

    if (degree2Share) {
      if (degree1ByUniversity == degree1Share) {
        institutionsText = `${degree1ByUniversity} awards the most degrees in ${name} in the US, having also the highest percentage of degrees awarded in ${name}, followed by ${degree2Share}.`
      }
  
      else {
        institutionsText = `${degree1ByUniversity} awards the most degrees in ${name} in the US, but ${degree1Share} and ${degree2Share} have the highest percentage of degrees awarded in ${name}.`
      }
    }

    else if (degree1Share) {
      if (degree1ByUniversity == degree1Share) {
        institutionsText = `${degree1ByUniversity} awards the most degrees in ${name} in the US, having also the highest percentage of degrees awarded in ${name}.`
      }
  
      else {
        institutionsText = `${degree1ByUniversity} awards the most degrees in ${name} in the US, but ${degree1Share} has the highest percentage of degrees awarded in ${name}.`
      }
    }

    else if (degree1ByUniversity) {
      institutionsText = `${degree1ByUniversity} awards the most degrees in ${name} in the US.`
    }

    else {
      institutionsText = ''
    }

    return {
      institutionsText
    }
  }
};

export default materializer;
