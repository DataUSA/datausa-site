/**
 * School districts as the Census Bureau defines them: three summary levels, told apart by the id
 * prefix (`97000US2502790` is a unified district in Massachusetts). The site treats them as one
 * geography level, "School District".
 *
 * Unified districts serve every grade. Elementary and secondary districts split the grades between
 * them and cover the same ground, so the two kinds overlap each other but never a unified district.
 * Members and shapes are built by `scripts/school-districts/build.sh`.
 */
export type SchoolDistrictKind = "unified" | "elementary" | "secondary";

const KIND_BY_PREFIX: Record<string, SchoolDistrictKind> = {"950": "elementary", "960": "secondary", "970": "unified"};
const PREFIX_BY_KIND: Record<SchoolDistrictKind, string> = {elementary: "95000US", secondary: "96000US", unified: "97000US"};

export const isSchoolDistrictId = (id: string) => id.slice(0, 3) in KIND_BY_PREFIX && id.slice(3, 7) === "00US";

export function schoolDistrictKind(id: string): SchoolDistrictKind | undefined {
  return isSchoolDistrictId(id) ? KIND_BY_PREFIX[id.slice(0, 3)] : undefined;
}

/**
 * Id prefixes of the districts that share one state's map with `id` without overlapping it: its own
 * kind, plus the unified districts (for an elementary or secondary district) or the elementary ones
 * (for a unified district, which they surround where a state has both).
 */
export function schoolDistrictMapPrefixes(id: string): string[] {
  const kind = schoolDistrictKind(id);
  if (!kind) return [];
  const state = id.slice(7, 9);
  const kinds: SchoolDistrictKind[] = kind === "unified" ? ["unified", "elementary"] : [kind, "unified"];
  return kinds.map(k => `${PREFIX_BY_KIND[k]}${state}`);
}

const ORDINALS: Record<string, string> = {"1": "1st", "2": "2nd", "3": "3rd"};
const ordinal = (grade: string) => ORDINALS[grade] ?? `${grade}th`;

/**
 * A grade span as the Census files code it ("PK", "KG", "01" to "12"): `short` for a statistic
 * ("PK–12", "K–8"), `long` for a sentence ("pre-kindergarten through 12th grade").
 */
export function gradeSpan(low: string | null | undefined, high: string | null | undefined): {short: string; long: string} | undefined {
  if (!low || !high) return undefined;
  const number = (grade: string) => String(Number(grade));
  const short = (grade: string) => grade === "PK" ? "PK" : grade === "KG" ? "K" : number(grade);
  const long = (grade: string) => grade === "PK" ? "pre-kindergarten" : grade === "KG" ? "kindergarten" : ordinal(number(grade));
  if (![low, high].every(g => g === "PK" || g === "KG" || /^\d{2}$/.test(g))) return undefined;
  return {short: `${short(low)}–${short(high)}`, long: `${long(low)} through ${long(high)} grade`};
}
