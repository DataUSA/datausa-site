/**
 * Client-side registry of lazily loaded chart modules per profile. Only the small index of import
 * thunks is bundled; each chart's code downloads when its section is about to render.
 */
import type {VizDefinition} from "@/lib/reports/types";
import {vizModules as geo} from "@/content/reports/geo/visualizations";

export type VizLoader = () => Promise<{default: VizDefinition}>;

const registries: Record<string, Record<number, VizLoader>> = {geo};

export function getVizLoader(profileSlug: string, vizId: number): VizLoader | undefined {
  return registries[profileSlug]?.[vizId];
}
