/**
 * Latest IPEDS figures of every university, for the search page: the rankings a list of universities
 * can be ordered by and the state each one is in. Values come from Tesseract at request time and are
 * cached; nothing is stored in the repository.
 */
import {UNIVERSITY_RANK_OPTIONS} from "@/content/search/dimensions";
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {listMembers} from "@/lib/dimensions/db";

export type UniversityRanking = typeof UNIVERSITY_RANK_OPTIONS[number]["key"];

const byKey: Partial<Record<UniversityRanking, {label: string; ascending: boolean}>> = {};
for (const option of UNIVERSITY_RANK_OPTIONS) byKey[option.key] = option;
/** The rankings of `UNIVERSITY_RANK_OPTIONS` by key: their label and the order they start in. */
export const UNIVERSITY_RANKINGS = byKey as Record<UniversityRanking, {label: string; ascending: boolean}>;

export const DEFAULT_UNIVERSITY_RANKING: UniversityRanking = "enrollment";

export function isUniversityRanking(key: string | undefined): key is UniversityRanking {
  return Boolean(key) && Object.hasOwn(UNIVERSITY_RANKINGS, key as string);
}

export interface UniversityFigure {
  /** Geoid and name of the state the university reports its enrollment in. */
  state?: string;
  stateName?: string;
  enrollment?: number;
  endowment?: number;
  /** Share of applicants admitted, 0 to 1. */
  acceptance?: number;
}

export interface UniversityState {
  id: string;
  name: string;
  /** Universities with a report and an enrollment figure in the state. */
  universities: number;
  enrollment: number;
}

export interface UniversityFigures {
  /** IPEDS year of each figure (the cubes' latest). */
  years: Record<UniversityRanking, number | null>;
  byId: Map<string, UniversityFigure>;
  states: Map<string, UniversityState>;
}

type Row = Record<string, unknown>;

async function latest(cube: string, drilldowns: string, measures: string): Promise<{rows: Row[]; year: number | null}> {
  const result = await fetchData(tesseractDataUrl({cube, drilldowns: `${drilldowns},Year`, measures, time: "Year.latest"}));
  const rows = (result.data?.data ?? []) as Row[];
  const year = rows.length && Number.isFinite(Number(rows[0].Year)) ? Number(rows[0].Year) : null;
  return {rows, year};
}

const positive = (value: unknown): number | undefined => {
  const n = Number(value);
  return value !== null && value !== undefined && Number.isFinite(n) && n > 0 ? n : undefined;
};

const TTL_MS = 60 * 60 * 1000;
let cached: {expires: number; value: Promise<UniversityFigures>} | undefined;

/**
 * Enrollment (with the state), endowment and admissions of every university, from three Tesseract
 * queries of under 1 MB each. The responses are cached like any other data request; the parsed
 * lookup is also kept in memory for an hour because the search page reads it on every keystroke. A
 * failed enrollment request yields an empty lookup and is retried after half a minute.
 */
export function getUniversityFigures(): Promise<UniversityFigures> {
  if (cached && cached.expires > Date.now()) return cached.value;
  const value = (async (): Promise<UniversityFigures> => {
    const [enrollment, endowment, admissions] = await Promise.all([
      latest("ipeds_enrollment", "University,State", "Enrollment"),
      latest("ipeds_finance_financials", "University", "Endowment Value"),
      latest("ipeds_admissions", "University", "Applicants Total,Admissions Total")
    ]);
    const byId = new Map<string, UniversityFigure>();
    const figure = (row: Row): UniversityFigure => {
      const id = String(row["University ID"] ?? "");
      let item = byId.get(id);
      if (!item) byId.set(id, item = {});
      return item;
    };
    for (const row of enrollment.rows) {
      const students = positive(row.Enrollment);
      if (students === undefined) continue;
      const item = figure(row);
      // a university enrolls in one state; should the cube ever split one, the larger part names it
      if (item.enrollment === undefined || students > item.enrollment) {
        item.state = String(row["State ID"] ?? "") || undefined;
        item.stateName = String(row.State ?? "") || undefined;
      }
      item.enrollment = (item.enrollment ?? 0) + students;
    }
    for (const row of endowment.rows) {
      const dollars = positive(row["Endowment Value"]);
      if (dollars !== undefined) figure(row).endowment = dollars;
    }
    for (const row of admissions.rows) {
      // a school that reports applicants and no admissions has no rate worth ranking by
      const applicants = positive(row["Applicants Total"]), admitted = positive(row["Admissions Total"]);
      if (applicants !== undefined && admitted !== undefined) figure(row).acceptance = admitted / applicants;
    }
    // states count the universities that have a report here
    const states = new Map<string, UniversityState>();
    for (const member of listMembers("University", "University", 100000)) {
      const item = byId.get(member.id);
      if (!item?.state || !item.stateName || item.enrollment === undefined) continue;
      let state = states.get(item.state);
      if (!state) states.set(item.state, state = {id: item.state, name: item.stateName, universities: 0, enrollment: 0});
      state.universities++;
      state.enrollment += item.enrollment;
    }
    return {years: {enrollment: enrollment.year, endowment: endowment.year, acceptance: admissions.year}, byId, states};
  })();
  const entry = cached = {expires: Date.now() + TTL_MS, value};
  value.then(({states}) => { if (!states.size) entry.expires = Date.now() + 30 * 1000; }, () => { entry.expires = 0; });
  return value;
}
