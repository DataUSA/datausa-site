/**
 * The state a landing page can be limited to (`/locations/counties/massachusetts`), and the states
 * by slug. Apart from `model.ts` so that the proxy can resolve an address without loading the data
 * code.
 */
import {getMember} from "@/lib/dimensions/db";
import {levelMembers} from "@/lib/dimensions/geo-db";

export interface LandingScope {
  /** The state a geography page is limited to. */
  state: {id: string; slug: string; name: string; fips: string};
}

const STATE_SUFFIX = /, [A-Z]{2}$/;

/** The state a `/…/<state>` page is about, from its slug. */
export function stateScope(slug: string): LandingScope | undefined {
  // states only: the same slug could name a place
  const member = stateBySlug().get(slug);
  return member ? {state: member} : undefined;
}

let states: Map<string, LandingScope["state"]> | null = null;

/** States by slug. Read once: the set of states does not change with a data release. */
export function stateBySlug(): Map<string, LandingScope["state"]> {
  if (!states) {
    states = new Map();
    for (const m of levelMembers("Geography", "State")) states.set(m.slug, {id: m.id, slug: m.slug, name: m.name, fips: m.id.slice(7, 9)});
  }
  return states;
}

/** A state by its geoid (`04000US25`). */
export function stateById(id: string): LandingScope["state"] | undefined {
  const member = getMember("Geography", id);
  return member && member.hierarchy === "State" ? stateBySlug().get(member.slug) : undefined;
}

/** A geography's name without its state suffix ("Essex County, MA" → "Essex County"), for lists inside one state. */
export function shortName(name: string): string {
  return name.replace(STATE_SUFFIX, "");
}
