/**
 * Placeholder report for school districts: a Census geography the site lists, maps and links to,
 * but that Tesseract has no data for yet. It is the location report cut down to what is known
 * without data: the hero, and an About section with a locator map (the location report's own About
 * map, which knows the level). Nothing here asks Tesseract or the geoservice for anything; the
 * figures come from the Census boundary file (`scripts/school-districts/build.sh`).
 *
 * `src/content/registry.ts` serves this template for the levels in `PENDING_LEVELS`. When the data
 * is available the level leaves that set and its members get the full location report.
 */
import {colorMapping} from "@/content/shared/color-mapping";
import {stateOf} from "@/lib/api/geoservice";
import {getMember, getSchoolDistrict, schoolDistrictLandArea} from "@/lib/dimensions/db";
import {gradeSpan, schoolDistrictKind, schoolDistrictMapPrefixes} from "@/lib/geo/school-districts";
import type {MemberAttributes, ReportTemplate, SectionDefinition, Variables} from "@/lib/reports/types";
import {meta} from "./profile";
import {visualizations as geoVisualizations} from "./visualizations/manifest";

// Section and text ids are local to this template; they sit above the ids the CMS export uses.
const HERO = 9001;
const ABOUT = 9002;
/** The location report's About map (`visualizations/1-about.ts`). */
const ABOUT_MAP = 1;

const sections: SectionDefinition[] = [
  {
    id: HERO,
    slug: "hero",
    type: "Hero",
    ordering: 0,
    allowed: "always",
    position: "default",
    icon: "",
    title: "<p>{{name}}</p>",
    short: "",
    subtitles: [{id: 9001, allowed: "always", text: "<p>{{hierarchyTitle}}</p>"}],
    descriptions: [],
    stats: [
      {id: 9001, allowed: "gradesShort", title: "<p>Grades Served</p>", value: "<p>{{gradesShort}}</p>", subtitle: "<p>{{gradesLongUpper}}</p>", tooltip: ""},
      {id: 9002, allowed: "landArea", title: "<p>Land Area</p>", value: "<p>{{landArea}} sq mi</p>", subtitle: "<p>Census Bureau boundaries</p>", tooltip: ""}
    ],
    selectors: [],
    visualizations: []
  },
  {
    id: ABOUT,
    slug: "about",
    type: "About",
    ordering: 1,
    allowed: "always",
    position: "default",
    icon: "",
    title: "About",
    short: "",
    subtitles: [],
    descriptions: [
      {id: 9003, allowed: "always", text: "<p>{{name}} is {{kindPhrase}}{{stateClause}}{{gradesClause}}.{{areaSentence}}</p>"},
      {id: 9004, allowed: "always", text: "<p>Data USA does not have data for school districts yet. This report will be filled in when it does.{{stateSentence}}</p>"}
    ],
    stats: [],
    selectors: [],
    visualizations: [ABOUT_MAP]
  }
];

const KIND_PHRASES = {unified: "a unified school district", elementary: "an elementary school district", secondary: "a secondary school district"};
const KIND_TITLES = {unified: "Unified School District", elementary: "Elementary School District", secondary: "Secondary School District"};

/**
 * Share of its state's land below which a district is too small to make out on the About map (about
 * a twentieth of the state's width) and gets a ring drawn around it.
 */
const SMALL_ON_MAP = 0.0025;

const area = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1});
const wholeArea = new Intl.NumberFormat("en-US", {maximumFractionDigits: 0});

async function attributes(member: MemberAttributes): Promise<Variables> {
  const kind = schoolDistrictKind(member.id);
  const facts = getSchoolDistrict(member.id);
  const stateId = stateOf(member.id);
  const state = stateId ? getMember("Geography", stateId) : undefined;
  const nation = getMember("Geography", "01000US");
  const grades = gradeSpan(facts?.lowGrade, facts?.highGrade);
  const landArea = typeof facts?.landSqMi === "number" && facts.landSqMi > 0 ? (facts.landSqMi >= 100 ? wholeArea : area).format(facts.landSqMi) : undefined;
  // the districts drawn on the map together cover the state, so their land is the state's
  const mapArea = schoolDistrictLandArea(schoolDistrictMapPrefixes(member.id));
  const small = Boolean(facts?.lonlat) && typeof facts?.landSqMi === "number" && mapArea > 0 && facts.landSqMi / mapArea < SMALL_ON_MAP;
  const stateLink = state ? `<a href="/profile/geo/${state.slug}">${state.name}</a>` : "";

  return {
    ...colorMapping,
    breadcrumbs: [nation, state].filter(m => m !== undefined).map(m => ({id: m.id, slug: m.slug, name: m.name, hierarchy: m.hierarchy, dimension: m.dimension})),
    neverShow: false,
    /** No data yet: nothing on the page may suggest otherwise. */
    pendingData: true,
    nameLower: member.name,
    nameUpper: member.name,
    hierarchyTitle: kind ? KIND_TITLES[kind] : member.hierarchy,
    kindPhrase: kind ? KIND_PHRASES[kind] : "a school district",
    stateClause: stateLink ? ` in ${stateLink}` : "",
    stateSentence: stateLink ? ` In the meantime, explore ${stateLink}.` : "",
    gradesShort: grades?.short,
    gradesLongUpper: grades ? `${grades.long.charAt(0).toUpperCase()}${grades.long.slice(1)}` : undefined,
    gradesClause: grades ? `, serving ${grades.long}` : "",
    landArea,
    areaSentence: landArea ? ` Its boundaries cover ${landArea} square miles of land.` : "",
    /** `[longitude, latitude]` to ring on the About map, for a district too small to see there. */
    mapMarker: small ? facts!.lonlat : undefined
  };
}

export const schoolDistrictTemplate: ReportTemplate = {
  meta,
  sections,
  selectors: [],
  generators: [],
  materializers: [],
  visualizations: geoVisualizations.filter(v => v.id === ABOUT_MAP).map(v => ({...v, sectionId: ABOUT, usedVariables: [...(v.usedVariables ?? []), "mapMarker"]})),
  attributes
};
