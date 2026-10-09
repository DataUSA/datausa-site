/**
 * Client-side registry of lazily loaded chart modules per profile. Only the small index of import
 * thunks is bundled; each chart's code downloads when its section is about to render.
 */
import type {VizDefinition} from "@/lib/reports/types";
import {vizModules as geo} from "@/content/reports/geo/visualizations";
import {vizModules as cip} from "@/content/reports/cip/visualizations";
import {vizModules as naics} from "@/content/reports/naics/visualizations";
import {vizModules as soc} from "@/content/reports/soc/visualizations";
import {vizModules as university} from "@/content/reports/university/visualizations";
import {vizModules as napcs} from "@/content/reports/napcs/visualizations";

export type VizLoader = () => Promise<{default: VizDefinition}>;

const registries: Record<string, Record<number, VizLoader>> = {geo, cip, naics, soc, university, napcs};

export function getVizLoader(profileSlug: string, vizId: number): VizLoader | undefined {
  return registries[profileSlug]?.[vizId];
}
