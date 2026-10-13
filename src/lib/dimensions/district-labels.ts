/**
 * Familiar names for congressional districts, shown beside the official one: "Congressional
 * District 5, KY" is "Appalachian Kentucky". Most are the geographic descriptions written by Daily
 * Kos Elections for its district naming guide; a district redrawn since that guide gets a label
 * computed from the 2020 Census (its largest places, or counties where no place stands out).
 * `scripts/districts/build-labels.py` builds the data file and documents the rules.
 */
import data from "@/content/geo/district-labels.json";

interface Entry {label: string | null; source: "dailykos" | "computed" | null}

/**
 * Editorial corrections, keyed by district id (`50000US` + state FIPS + district number). They win
 * over the generated file and survive a rebuild.
 */
const OVERRIDES: Record<string, string> = {};

const labels = data.labels as Record<string, Entry>;

/** The familiar name of a district, or undefined (at-large districts and other geographies). */
export function districtLabel(id: string): string | undefined {
  return OVERRIDES[id] ?? labels[id]?.label ?? undefined;
}
