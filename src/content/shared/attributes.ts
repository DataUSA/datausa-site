/**
 * Attributes shared by every non-geography report family (legacy `api/customAttributes.js`
 * before the per-dimension branch): colour variables, breadcrumbs, API hosts and constants.
 */
import {colorMapping} from "@/content/shared/color-mapping";
import {getMember, getProfile} from "@/lib/dimensions/db";
import {memberParents} from "@/lib/dimensions/parents";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export async function commonAttributes(profileSlug: string, member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const profile = getProfile(profileSlug);
  const full = getMember(member.dimension, member.id, member.cubeName);
  const breadcrumbs = full && profile ? await memberParents(profileSlug, full, profile.levels) : [];
  return {
    ...colorMapping,
    breadcrumbs,
    freightYear: 2024,
    neverShow: false,
    geoservice: ctx.geoservice,
    tesseract: ctx.tesseract,
    url: undefined
  };
}
