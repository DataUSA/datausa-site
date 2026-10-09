// Degree (CIP) attributes: port of the legacy api/customAttributes.js branch.
import stems from "@/content/shared/data/stem-cips.json";
import {commonAttributes} from "@/content/shared/attributes";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const {id} = member;
  const retObj = await commonAttributes("cip", member, ctx);
  retObj.stem = id.length === 6 ? ((stems as string[]).includes(id) ? "Stem Major" : false) : "Contains Stem Majors";
  retObj.cip2 = id.slice(0, 2);
  retObj.cip4 = id.length >= 4 ? id.slice(0, 4) : false;
  return retObj;
}
