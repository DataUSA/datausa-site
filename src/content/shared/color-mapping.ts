import colors from "@/content/shared/data/colors.json";
import type {Variables} from "@/lib/reports/types";

/**
 * `colors.json` keys become `color<Name>` variables (`Gender` -> `colorGender`, `ACS Race` ->
 * `colorRaceACS`, i.e. words reversed and joined), exactly as the legacy mapping did. Every report
 * family receives these.
 */
export const colorMapping: Variables = Object.keys(colors).reduce((obj, k) => {
  const newKey = k.split(" ").reverse().join("");
  obj[newKey.startsWith("color") ? newKey : `color${newKey.charAt(0).toUpperCase()}${newKey.slice(1)}`] = (colors as Record<string, unknown>)[k];
  return obj;
}, {} as Variables);
