// Converted from legacy canon_cms_materializer #61 "[Education] No Schooling" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 61,
  name: "[Education] No Schooling",
  ordering: 19,
  allowed: "always",
  logic: (variables) => {
    const {dataNoSchooling, dataResidentsByGender, stateParentId, electionStateIDs, isMSA} = variables;

    const dataNoSchooling_ = isMSA ? dataNoSchooling.filter((d: any) => {return electionStateIDs.includes(d["State ID"])}) 
                                   : dataNoSchooling.filter((d: any) => d["State ID"] === stateParentId)
                               
    const dataResidentsByGender_ = isMSA ? dataResidentsByGender.filter((d: any) => {return electionStateIDs.includes(d["State ID"])}) 
                                         : dataResidentsByGender.filter((d: any) => d["State ID"] === stateParentId)

    const lastYearNoSchooling_ = dataNoSchooling[0]["Year"]


    const noSchoolingWomen_ = dataNoSchooling_.filter((d: any) => d["Gender ID"] === 2)
    const noSchoolingWomen = noSchoolingWomen_.reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)

    const noSchoolingMen_ = dataNoSchooling_.filter((d: any) => d["Gender ID"] === 1)
    const noSchoolingMen = noSchoolingMen_.reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)

    const womenResidents_ = dataResidentsByGender_.filter((d: any) => d["Gender ID"] === 2)
    const womenResidents = womenResidents_.reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)

    const menResidents_ = dataResidentsByGender_.filter((d: any) => d["Gender ID"] === 1)
    const menResidents = menResidents_.reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)

    const noSchoolingWomenPct_ = (noSchoolingWomen / womenResidents) * 100
    const noSchoolingMenPct_ = (noSchoolingMen / menResidents) * 100

    return {
      lastYearNoSchooling_,
      noSchoolingWomenPct_,
      noSchoolingMenPct_
    }
  }
};

export default materializer;
