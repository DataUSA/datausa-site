// Occupation (PUMS Occupation) attributes: port of the legacy api/customAttributes.js branch.
import blsOccs from "@/content/shared/data/pums_bls_occupation_crosswalk.json";
import {commonAttributes} from "@/content/shared/attributes";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const retObj = await commonAttributes("soc", member, ctx);
  retObj.blsIds = (blsOccs as Record<string, unknown>)[member.id] || false;
  return retObj;
}
