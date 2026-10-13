// New in the rewrite (no legacy canon_cms_generator): men and women per race, so the text and stats
// of the "Residents by Gender and Age" section follow its race selector the way its chart does.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 779,
  name: "[Population] Residents by Sex and Race",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Gender,Race&measures=Total+Population&time=Year.latest&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {libs}) => {
    const {sum} = libs.d3;
    const data = resp.data;
    if (!data.length) return {};

    // One set of variables per option of the `pums5RacesPyramid` selector: `pums5Race1`...`pums5Race9`
    // (the nine PUMS race groups; one a place has no residents of gets zeros) and `pums5Race0` for all.
    const variables: Record<string, any> = {};
    for (let raceId = 0; raceId <= 9; raceId++) {
      const option = `pums5Race${raceId}`;
      const rows = raceId ? data.filter((d: any) => d["Race ID"] === raceId) : data;
      const men = sum(rows.filter((d: any) => d["Gender ID"] === 1), (d: any) => d["Total Population"]);
      const women = sum(rows.filter((d: any) => d["Gender ID"] === 2), (d: any) => d["Total Population"]);
      const total = men + women;

      variables[`residentPopulation_${option}`] = total;
      variables[`menResidents_${option}`] = men;
      variables[`womenResidents_${option}`] = women;
      variables[`menResidentsPct_${option}`] = total ? men / total * 100 : 0;
      variables[`womenResidentsPct_${option}`] = total ? women / total * 100 : 0;
      // which of the section's three sentences applies to this option
      variables[`residentsAllRaces_${option}`] = !raceId;
      variables[`residentsOneRace_${option}`] = Boolean(raceId && total);
      variables[`residentsNoRace_${option}`] = Boolean(raceId && !total);
    }
    return variables;
  }
};

export default generator;
