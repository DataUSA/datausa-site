/**
 * Synchronous URL → member resolution, run before any streaming so the response can carry a real
 * 301/404 status. Includes the legacy crosswalk redirects (`/profile/sctg/:id` → napcs, old geo ids).
 */
import {getTemplate} from "@/content/registry";
import oldGeos from "@/content/shared/data/oldgeos.json";
import napcs2sctg from "@/content/shared/data/nacps2sctg.json";
import {getProfile, resolveMember, type MemberRow, type ProfileRow} from "@/lib/dimensions/db";

const sctg2napcs: Record<string, string> = Object.entries(napcs2sctg as Record<string, string[]>).reduce((obj, [napcs, sctgs]) => {
  sctgs.forEach(sctg => { obj[sctg] = napcs; });
  return obj;
}, {} as Record<string, string>);

export type ResolvedReport =
  | {status: "unknown-profile"}
  | {status: "not-found"}
  | {status: "redirect"; to: string}
  | {status: "ok"; profile: ProfileRow; member: MemberRow};

export function resolveReportUrl(profileSlug: string, idOrSlug: string): ResolvedReport {
  if (profileSlug === "sctg") {
    const napcs = sctg2napcs[idOrSlug];
    return napcs ? {status: "redirect", to: `/profile/napcs/${napcs}`} : {status: "not-found"};
  }
  if (profileSlug === "geo" && (oldGeos as Record<string, string>)[idOrSlug]) {
    return {status: "redirect", to: `/profile/geo/${(oldGeos as Record<string, string>)[idOrSlug]}`};
  }
  const template = getTemplate(profileSlug);
  const profile = getProfile(profileSlug);
  if (!template || !profile) return {status: "unknown-profile"};
  const member = resolveMember(profile, idOrSlug);
  if (!member) return {status: "not-found"};
  if (member.slug !== idOrSlug) return {status: "redirect", to: `/profile/${profileSlug}/${member.slug}`};
  return {status: "ok", profile, member};
}
