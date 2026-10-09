/**
 * Typed client for the Data USA geoservice (geographic relations). Responses are cached under the
 * `geoservice` tag via the shared data client.
 */
import {fetchData, GEOSERVICE_URL} from "@/lib/api/tesseract";

export interface GeoRelation {
  geoid: string;
  name: string;
  level: string;
  overlap_size?: number;
}

export interface GeoNeighbor {
  geoid: string;
  name: string;
}

function unwrap<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && "error" in (data as Record<string, unknown>)) {
    console.error("[geoservice error]", (data as Record<string, unknown>).error);
    return [];
  }
  return [];
}

/** Geographies that intersect `geoid`, optionally limited to target levels (e.g. "state,county"). */
export async function intersects(geoid: string, targetLevels?: string, overlapSize = false): Promise<GeoRelation[]> {
  const params = new URLSearchParams();
  if (targetLevels) params.set("targetLevels", targetLevels);
  if (overlapSize) params.set("overlapSize", "true");
  const qs = params.toString();
  const result = await fetchData<unknown>(`${GEOSERVICE_URL}relations/intersects/${encodeURIComponent(geoid)}${qs ? `?${qs}` : ""}`);
  return unwrap<GeoRelation>(result.data);
}

/** Neighbouring geographies of the same level. */
export async function neighbors(geoid: string): Promise<GeoNeighbor[]> {
  const result = await fetchData<unknown>(`${GEOSERVICE_URL}neighbors/${encodeURIComponent(geoid)}`);
  return unwrap<GeoNeighbor>(result.data);
}

/** Maps a geoid prefix to its summary level name (legacy `geographyLevels`). */
export function geoLevel(id: string): string | undefined {
  const prefix = id.slice(0, 3);
  return ({
    "010": "Nation",
    "040": "State",
    "050": "County",
    "310": "MSA",
    "160": "Place",
    "860": "Zip",
    "140": "Tract",
    "795": "PUMA",
    "500": "Congressional District"
  } as Record<string, string>)[prefix];
}
