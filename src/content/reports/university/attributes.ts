// University attributes: port of the legacy api/customAttributes.js branch (similar universities,
// OPEID ids and the institution URL shown in the hero).
import universitySimilar from "@/content/shared/data/similar_universities_with_dist.json";
import {commonAttributes} from "@/content/shared/attributes";
import {universityOpeids, universityUrls} from "@/lib/content/lookups";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const {id} = member;
  const retObj = await commonAttributes("university", member, ctx);
  const [opeid, urls] = await Promise.all([universityOpeids(), universityUrls()]);
  const similarID = ((universitySimilar as Record<string, {university: string}[]>)[id] ?? []).map(d => d.university);
  retObj.opeid = opeid[id] ? opeid[id] : false;
  retObj.similarID = similarID.join(",");
  retObj.similarOpeidId = similarID.map(d => opeid[d]).filter(Boolean).join(",");
  retObj.url = urls[id];
  return retObj;
}
