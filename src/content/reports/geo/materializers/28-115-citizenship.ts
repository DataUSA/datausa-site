// Converted from legacy canon_cms_materializer #115 "CitizenShip" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 115,
  name: "CitizenShip",
  ordering: 28,
  allowed: "always",
  logic: (variables) => {
    const {citizenTotal, citizenTotalPrev, foreignbornTotal, foreignbornTotalPrev, foreign, totalCitizen} = variables;

    const foreignbornCurr = foreignbornTotal / citizenTotal * 100;
    const foreignbornPrev = foreignbornTotalPrev / citizenTotalPrev * 100;
    const foreignbornDiff = foreignbornCurr - foreignbornPrev;
    const foreignbornNation =  foreign / totalCitizen * 100

    return {
      foreignbornCurr,
      foreignbornPrev,
      foreignbornDiff,
      foreignbornNation
    }
  }
};

export default materializer;
