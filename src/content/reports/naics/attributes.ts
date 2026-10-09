// Industry (PUMS Industry) attributes: port of the legacy api/customAttributes.js branch.
import iocodes from "@/content/shared/data/pums_naics_to_iocode.json";
import blsInds from "@/content/shared/data/pums_bls_industry_crosswalk.json";
import {commonAttributes} from "@/content/shared/attributes";
import {blsMonthlyIndustries} from "@/lib/content/lookups";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

/** PUMS industry prefix → BLS supersector id, checked from the highest prefix down (legacy table). */
const BLS_INDUSTRY_MAP: [number, string][] = [[11, "15"], [30, "30"], [42, "40"], [51, "50"], [52, "55"], [54, "60"], [61, "65"], [71, "70"], [81, "80"], [92, "90"]].reverse() as [number, string][];

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const {id} = member;
  const retObj = await commonAttributes("naics", member, ctx);
  const monthly = await blsMonthlyIndustries();
  if (monthly[id]) {
    retObj.blsMonthlyID = monthly[id];
    retObj.blsMonthlyDimension = "Industry";
  }
  else {
    let prefix = parseFloat(id.slice(0, 2));
    if (prefix < 10) prefix = parseFloat(`${prefix}9`);
    const mapped = BLS_INDUSTRY_MAP.find(d => prefix >= d[0]);
    retObj.blsMonthlyID = mapped ? mapped[1] : false;
    retObj.blsMonthlyDimension = "Supersector";
  }
  const beaIds = (iocodes as unknown as Record<string, {L0?: string | null; L1?: string | null}>)[id];
  retObj.beaL0 = beaIds?.L0 ? beaIds.L0 : false;
  retObj.beaL1 = beaIds?.L1 ? beaIds.L1 : false;
  const bls = (blsInds as Record<string, unknown[]>)[id];
  retObj.blsIds = bls || false;
  retObj.blsIdsStr = bls ? bls.flat().join(",") : false;
  return retObj;
}
