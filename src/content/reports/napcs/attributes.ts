// Product (NAPCS) attributes: port of the legacy api/customAttributes.js branch.
import napcs2sctg from "@/content/shared/data/nacps2sctg.json";
import {commonAttributes} from "@/content/shared/attributes";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const retObj = await commonAttributes("napcs", member, ctx);
  retObj.sctg = ((napcs2sctg as Record<string, string[]>)[member.id] ?? []).join(",");
  return retObj;
}
