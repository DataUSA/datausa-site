/**
 * Report for school districts. Tesseract has seven ACS 5-year cubes for the level (population, age,
 * race and ethnicity, household income, property value, poverty, occupations; one vintage so far),
 * so a district gets the parts of the location report those cubes feed, not the whole report:
 * most of its sections read cubes without districts and would show "N/A" or empty charts.
 *
 * The sections are the location report's own (`./sections.ts`), copied by id and changed only where
 * they would say something untrue for a district; they run on the location report's generators,
 * limited to the ones the kept sections need (13 requests instead of 171), and on all its
 * materializers. The hero and About add what the Census boundary file says about the district
 * (`scripts/school-districts/build.sh`): kind, grades served, land area, and a locator map.
 *
 * On a Tesseract server without district data the generators come back empty, every data section
 * hides itself, and the page is the hero and About text it was before the data existed.
 */
import {colorMapping} from "@/content/shared/color-mapping";
import {stateOf} from "@/lib/api/geoservice";
import {getMember, getSchoolDistrict, schoolDistrictLandArea} from "@/lib/dimensions/db";
import {gradeSpan, schoolDistrictKind, schoolDistrictMapPrefixes} from "@/lib/geo/school-districts";
import type {MaterializerDefinition, MemberAttributes, ReportTemplate, SectionDefinition, Variables} from "@/lib/reports/types";
import {generators as geoGenerators} from "./generators";
import {materializers as geoMaterializers} from "./materializers";
import {meta} from "./profile";
import {sections as geoSections} from "./sections";
import {selectors} from "./selectors";
import {visualizations as geoVisualizations} from "./visualizations/manifest";

// Section and text ids of this template's own blocks; they sit above the ids the CMS export uses.
const HERO = 9001;
const ABOUT = 9002;
/** The location report's About map (`visualizations/1-about.ts`). */
const ABOUT_MAP = 1;

/**
 * The location report's generators the kept sections read, by legacy id. All of them ask for the
 * district itself or for the nation (for comparisons) in a cube that has the level.
 */
const GENERATORS = new Set([
  672, // Population
  673, // Median Age
  576, // Race/Ethnicity
  650, // Household Income
  665, // Household Income (Nation)
  660, // Property Value
  687, // Property Value (Nation)
  643, // Poverty
  644, // Poverty (Nation)
  645, // Poverty (Age & Gender)
  69, // Poverty (Race)
  611, // Employees (ACS)
  622 // Occupations (Common ACS)
]);

/** Charts of the kept sections: race and ethnicity, occupations, poverty. */
const VISUALIZATIONS = new Set([ABOUT_MAP, 365, 386, 403]);

function geoSection(id: number, changes: Partial<SectionDefinition> = {}): SectionDefinition {
  const section = geoSections.find(s => s.id === id);
  if (!section) throw new Error(`Location report section ${id} not found`);
  return {...structuredClone(section), ...changes};
}

function geoStat(sectionId: number, statId: number) {
  const stat = geoSections.find(s => s.id === sectionId)?.stats.find(s => s.id === statId);
  if (!stat) throw new Error(`Location report stat ${sectionId}/${statId} not found`);
  return structuredClone(stat);
}

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
      geoStat(1, 6), // population
      // the location report shows the median age only with a change on the year; districts have one year
      {id: 9003, allowed: "ageCurr", title: "<p>{{ageCurrYear}} Median Age</p>", value: "<p>{{ageCurr}}</p>", subtitle: "", tooltip: ""},
      geoStat(1, 5), // median household income
      geoStat(1, 2), // median property value
      {id: 9001, allowed: "gradesShort", title: "<p>Grades Served</p>", value: "<p>{{gradesShort}}</p>", subtitle: "<p>{{gradesLongUpper}}</p>", tooltip: ""},
      {id: 9002, allowed: "landAreaStat", title: "<p>Land Area</p>", value: "<p>{{landArea}} sq mi</p>", subtitle: "<p>Census Bureau boundaries</p>", tooltip: ""}
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
      {id: 9005, allowed: "districtData", text: "<p>In {{popYearCurr}}, the {{popCurrWords}} people living within its boundaries had a median age of {{ageCurr}} and a median household income of Salary{{incomeCurr}}, against Salary{{incomeNation}} for the nation. The median property value was Salary{{propertyCurr}}, and Abbreviate{{povertyRate}}% of residents lived below the poverty line.</p>"},
      {id: 9006, allowed: "districtData", text: "<p>The figures describe everyone who lives in the district, not only its students: they are the Census Bureau's American Community Survey 5-year estimates for {{acsPeriod}}, tabulated for school district boundaries.</p>"},
      {id: 9004, allowed: "noDistrictData", text: "<p>Data USA does not have data for this school district yet. This report will be filled in when it does.{{stateSentence}}</p>"}
    ],
    stats: [],
    selectors: [],
    visualizations: [ABOUT_MAP]
  },
  // Population & Diversity: the race and ethnicity text, without the citizenship, birthplace and
  // language sentences (no district data)
  geoSection(42, {descriptions: geoSection(42).descriptions.filter(d => d.id === 103)}),
  geoSection(201),
  geoSection(47),
  // Economy: the location report's summary sentences need industries, wages and the Gini index
  geoSection(15, {
    descriptions: [{id: 9007, allowed: "empCurr", text: "<p>{{nameUpper}} has Abbreviate{{empCurr}} employed residents. They are counted where they live, by the job they hold, wherever they work.</p>"}]
  }),
  geoSection(203),
  // only the workforce figure (wages and yearly growth need more cubes and years); men and women stay
  geoSection(23, {selectors: ["genderOccupations"]}),
  // Housing & Living: no housing chart (property value buckets and taxes are not in the district
  // cubes), so the grouping text carries the property value and poverty follows
  geoSection(55, {
    allowed: "districtData",
    descriptions: [{id: 9008, allowed: "propertyCurr", text: "<p>The median property value in {{nameLower}} was Salary{{propertyCurr}} in {{propertyCurrYear}}, which is Abbreviate{{propertyRatio}} times LargerThan{{propertyDiff}} the national average of Salary{{propertyNation}}.</p>"}]
  }),
  geoSection(215),
  geoSection(21)
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
const commas = new Intl.NumberFormat("en-US");

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
    // visibility flags the location report's attributes set (the poverty text is written for below the nation)
    isNation: false,
    notNation: true,
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

/**
 * Runs after the location report's materializers: whether Tesseract had the district's population
 * (the switch between the data report and the boundary-file page) and the About text's wording.
 */
const districtMaterializer: MaterializerDefinition = {
  id: 9001,
  name: "School district data",
  ordering: Number.MAX_SAFE_INTEGER,
  allowed: "always",
  logic: variables => {
    const districtData = typeof variables.popCurr === "number" && variables.popCurr > 0;
    const year = Number(variables.popYearCurr);
    return {
      districtData,
      noDistrictData: !districtData,
      // with figures, the land area is in the About text; without, it is one of the hero's two facts
      landAreaStat: districtData ? undefined : variables.landArea,
      popCurrWords: districtData ? commas.format(variables.popCurr) : undefined,
      acsPeriod: Number.isFinite(year) ? `${year - 4}-${year}` : undefined
    };
  }
};

export const schoolDistrictTemplate: ReportTemplate = {
  meta,
  sections,
  selectors,
  generators: geoGenerators.filter(g => GENERATORS.has(g.id)),
  materializers: [...geoMaterializers, districtMaterializer],
  visualizations: geoVisualizations
    .filter(v => VISUALIZATIONS.has(v.id))
    .map(v => v.id === ABOUT_MAP ? {...v, sectionId: ABOUT, usedVariables: [...(v.usedVariables ?? []), "mapMarker"]} : v),
  attributes
};
