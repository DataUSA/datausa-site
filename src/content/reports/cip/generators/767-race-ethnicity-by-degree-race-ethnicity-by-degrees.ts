// Converted from legacy canon_cms_generator #767 "[Race & Ethnicity by Degree] Race & Ethnicity by Degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 767,
  name: "[Race & Ethnicity by Degree] Race & Ethnicity by Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?${attrs.hierarchy}=${attrs.id}&cube=ipeds_completions&drilldowns=Year,IPEDS+Race&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest&limit=3`,
  logic: (resp) => {
    const data = resp.data;

    if(data.length === 0) {
  
      return{
        raceByDegrees0: false
      }
    }

    else {
      const degree0RaceName1: any = data[0] ? data[0]["IPEDS Race"] : false;
      const degree0RaceValue1: any = data[0] ? data[0]["Completions"] : false;
      const degree0RaceVisible1 = data[0]["Completions"] === 0 ? false : true;
      const degree0RaceYear1: any = data[0] ? data[0]["Year"] : false;
  
      const degree0RaceName2: any = data[1] ? data[1]["IPEDS Race"] : false;
      const degree0RaceValue2: any = data[1] ? data[1]["Completions"] : false;
      const degree0RaceVisible2 = data[1]["Completions"] === 0 ? false : true;
      const degree0RaceYear2: any = data[1] ? data[1]["Year"] : false;
  
      const degree0RaceName3: any = data[2] ? data[2]["IPEDS Race"] : false;
      const degree0RaceValue3: any = data[2] ? data[2]["Completions"] : false;
      const degree0RaceVisible3 = data[2]["Completions"] === 0 ? false : true;
      const degree0RaceYear3: any = data[2] ? data[2]["Year"] : false;
  
      return{
        degree0RaceName1,
        degree0RaceValue1,
        degree0RaceVisible1,
        degree0RaceName2,
        degree0RaceValue2,
        degree0RaceVisible2,
        degree0RaceName3,
        degree0RaceValue3,
        degree0RaceVisible3,
        degree0RaceYear1,
        degree0RaceYear2,
        degree0RaceYear3
      }
    }
  }
};

export default generator;
