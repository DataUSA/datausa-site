// Converted from legacy canon_cms_generator #732 "Health Section (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 732,
  name: "Health Section (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State&measures=Patient to Dentist Ratio,Patient to Primary Care Physician Ratio&drilldowns=State,Year&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    const dentistsMeasure: string = "Patient to Dentist Ratio";
    const dentists = data.sort((a: any, b: any) => b[dentistsMeasure] > a[dentistsMeasure] ? 1 : -1);

    const physiciansMeasure: string = "Patient to Primary Care Physician Ratio";
    const physicians = data.sort((a: any, b: any) => b[physiciansMeasure] > a[physiciansMeasure] ? 1 : -1);


    return {
      dentists1Name: `<a href="/profile/geo/${dentists[0]["State ID"]}">${dentists[0]["State"]}</a>`,
      dentists1Value: dentists[0][dentistsMeasure],
      dentists2Name: `<a href="/profile/geo/${dentists[1]["State ID"]}">${dentists[1]["State"]}</a>`,
      dentists2Value: dentists[1][dentistsMeasure],
      dentists3Name: `<a href="/profile/geo/${dentists[2]["State ID"]}">${dentists[2]["State"]}</a>`,
      dentists3Value: dentists[2][dentistsMeasure],
  
      physicians1Name: `<a href="/profile/geo/${physicians[0]["State ID"]}">${physicians[0]["State"]}</a>`,
      physicians1Value: physicians[0][physiciansMeasure],
      physicians2Name: `<a href="/profile/geo/${physicians[1]["State ID"]}">${physicians[1]["State"]}</a>`,
      physicians2Value: physicians[1][physiciansMeasure],
      physicians3Name: `<a href="/profile/geo/${physicians[2]["State ID"]}">${physicians[2]["State"]}</a>`,
      physicians3Value: physicians[2][physiciansMeasure],

      yearPhysicians: physicians[0]["Year"],
      yearDentists: dentists[0]["Year"]
    }
  }
};

export default generator;
