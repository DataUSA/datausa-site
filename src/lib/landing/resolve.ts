/**
 * Which landing page an address names. Read by the pages and, before anything renders, by the proxy
 * (`src/proxy.ts`), so that an unknown level or state answers a real 404.
 */
import {landingFamily, type LandingFamily, type LandingLevel} from "@/content/landing/levels";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {stateScope, type LandingScope} from "./scope";

export interface ResolvedLanding {family: LandingFamily; level?: LandingLevel; scope?: LandingScope}

/** What a landing address names, or undefined when it names nothing (also used by the proxy for the 404). */
export function resolveLanding(familySlug: string, path: string[] = []): ResolvedLanding | undefined {
  const family = landingFamily(familySlug);
  if (!family || path.length > 2) return undefined;
  if (!path.length) {
    const home = family.levels.find(l => l.slug === family.home);
    return home ? {family, level: home} : {family};
  }
  const level = family.levels.find(l => l.slug === path[0]);
  if (!level || !memberTotalsByHierarchy()[family.dimension]?.[level.hierarchy]) return undefined;
  if (path.length === 1) return {family, level};
  const scope = level.byState ? stateScope(path[1]) : undefined;
  return scope ? {family, level, scope} : undefined;
}
