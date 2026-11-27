/**
 * The landing pages: one hub per report family (`/locations`) and one page per level of its
 * hierarchy (`/locations/counties`, `/industries/sub-sectors`), which geography levels inside a
 * state repeat for that state (`/locations/counties/massachusetts`).
 *
 * This file names the pages and says which figures each level is compared on. The figures are read
 * from Tesseract for the whole level at once (`src/lib/landing/data.ts`).
 */

export type MeasureFormat = "number" | "dollars" | "compactDollars" | "age" | "percent";

export interface LandingMeasure {
  key: string;
  /** Column and chart title ("Median Household Income"). */
  label: string;
  /** Short column heading ("Income"). */
  short: string;
  /** How a sentence refers to it ("median household income"). */
  phrase: string;
  cube: string;
  measure: string;
  /** Extra cuts, in Tesseract's `include` syntax. */
  include?: string;
  /** Name of the cube's time level (default "Year"). */
  time?: string;
  format: MeasureFormat;
  /** Whether members add up to a meaningful total (population does, a median does not). */
  additive: boolean;
  /** Years between the latest figure and the one its change is measured from; none when left out. */
  lag?: number;
  source: string;
  /** Rankings start from the largest figure unless this is set. */
  ascending?: boolean;
}

const ACS = "Census Bureau, ACS 5-year estimates";
const PUMS = "Census Bureau, ACS PUMS 5-year estimates";
const IPEDS = "NCES IPEDS";

const DEFINITIONS = {
  population: {key: "population", label: "Population", short: "Population", phrase: "population", cube: "acs_yg_total_population_5", measure: "Population", format: "number", additive: true, lag: 5, source: ACS},
  income: {key: "income", label: "Median Household Income", short: "Income", phrase: "median household income", cube: "acs_ygr_median_household_income_race_5", measure: "Household Income by Race", include: "Race:0", format: "dollars", additive: false, source: ACS},
  age: {key: "age", label: "Median Age", short: "Age", phrase: "median age", cube: "acs_ygs_median_age_total_5", measure: "Median Age", format: "age", additive: false, source: ACS},
  propertyValue: {key: "propertyValue", label: "Median Property Value", short: "Home Value", phrase: "median property value", cube: "acs_yg_housing_median_value_5", measure: "Property Value", format: "dollars", additive: false, source: ACS},
  workforce: {key: "workforce", label: "Workforce", short: "Workforce", phrase: "workforce", cube: "pums_5", measure: "Total Population", include: "Workforce Status:true", format: "number", additive: true, lag: 5, source: PUMS},
  wage: {key: "wage", label: "Average Wage", short: "Avg. Wage", phrase: "average wage", cube: "pums_5", measure: "Average Wage", include: "Workforce Status:true", format: "dollars", additive: false, source: PUMS},
  completions: {key: "completions", label: "Degrees Awarded", short: "Degrees", phrase: "degrees awarded", cube: "ipeds_completions", measure: "Completions", format: "number", additive: true, lag: 5, source: IPEDS},
  obligation: {key: "obligation", label: "Federal Contract Spending", short: "Spending", phrase: "federal contract spending", cube: "usa_spending", measure: "Obligation Amount", time: "Fiscal Year", format: "compactDollars", additive: true, lag: 1, source: "USAspending.gov"},
  // universities: read together by `getUniversityFigures`, which also knows each one's state
  enrollment: {key: "enrollment", label: "Enrollment", short: "Enrollment", phrase: "enrollment", cube: "ipeds_enrollment", measure: "Enrollment", format: "number", additive: true, source: IPEDS},
  endowment: {key: "endowment", label: "Endowment", short: "Endowment", phrase: "endowment", cube: "ipeds_finance_financials", measure: "Endowment Value", format: "compactDollars", additive: false, source: IPEDS},
  acceptance: {key: "acceptance", label: "Acceptance Rate", short: "Acceptance", phrase: "acceptance rate", cube: "ipeds_admissions", measure: "Admissions Total", format: "percent", additive: false, source: IPEDS, ascending: true}
} satisfies Record<string, LandingMeasure>;

export type MeasureKey = keyof typeof DEFINITIONS;

export const MEASURES: Record<MeasureKey, LandingMeasure> = DEFINITIONS;

export interface LandingLevel {
  /** URL segment (`counties`). */
  slug: string;
  /** Level name in the dimensions database and in Tesseract. */
  hierarchy: string;
  /** Heading ("Counties"). */
  plural: string;
  /** One member, inside a sentence ("county"). */
  singular: string;
  /** What the level is, for people who do not know the classification. */
  blurb: string;
  /**
   * A longer answer for a level few people know (PUMAs, metro areas), shown under the heading: a
   * question ("What is a PUMA?"), paragraphs, and a page that defines it.
   */
  explainer?: {question: string; answer: string[]; source: {label: string; href: string}};
  /** The figures members are compared on; the first sizes charts and orders lists. */
  measures: MeasureKey[];
  /** Geography: whether the level also has a page per state. */
  byState?: boolean;
  /** Geography: the national shape file of the level's map, when there is one. */
  shapes?: string;
  /** Geography: prefix of the per-state shape files (`Place` for `Place_25.json`). */
  stateShapes?: string;
  /** The level's members are grouped under members of this level (its parent in the hierarchy). */
  parent?: string;
}

export interface LandingFamily {
  /** URL segment (`locations`). */
  slug: string;
  /** Report family (`/profile/<profile>/…`). */
  profile: string;
  dimension: string;
  /** Heading of the hub ("Locations"). */
  label: string;
  /** What the hub's reports are about, completing "Data USA has reports on …". */
  about: string;
  /** A few words on what is inside, under the name in the navigation's Reports menu. */
  tagline: string;
  levels: LandingLevel[];
  /**
   * Slug of the level the hub's address shows in place of a hub (universities open on the
   * universities themselves): that level's national page is the family's address, and its own
   * address redirects there (`src/proxy.ts`).
   */
  home?: string;
}

const GEO: MeasureKey[] = ["population", "income", "age", "propertyValue"];
const WORK: MeasureKey[] = ["workforce", "wage"];

export const LANDING_FAMILIES: LandingFamily[] = [
  {
    slug: "locations", profile: "geo", dimension: "Geography", label: "Locations",
    about: "every state, county, city, metropolitan area, congressional district and school district in the United States",
    tagline: "States, counties, cities and metro areas",
    levels: [
      {slug: "states", hierarchy: "State", plural: "States", singular: "state", measures: GEO, shapes: "State",
        blurb: "The 50 states, the District of Columbia and Puerto Rico."},
      {slug: "counties", hierarchy: "County", plural: "Counties", singular: "county", measures: GEO, byState: true, shapes: "Counties_2023",
        blurb: "Counties and their equivalents: parishes in Louisiana, boroughs in Alaska, independent cities and Puerto Rico's municipios."},
      {slug: "cities", hierarchy: "Place", plural: "Cities & Places", singular: "city or place", measures: GEO, byState: true, stateShapes: "Place",
        blurb: "Census places: incorporated cities, towns and villages, and the census-designated places that stand in for unincorporated communities."},
      {slug: "metro-areas", hierarchy: "MSA", plural: "Metropolitan Areas", singular: "metropolitan area", measures: GEO, shapes: "Msa",
        blurb: "Metropolitan and micropolitan statistical areas: a city and the counties whose residents commute to it.",
        explainer: {
          question: "What is a metropolitan area?",
          answer: [
            "A metropolitan statistical area (MSA) is a city of at least 50,000 people together with the surrounding counties whose residents commute into it. The federal Office of Management and Budget defines them from Census commuting data, and they are the usual way to compare regional economies and job markets, because they follow where people live and work rather than city limits.",
            "Micropolitan areas are the same idea built around a smaller city of 10,000 to 50,000 people; both kinds are listed here. A metro area can cross state lines: Boston-Cambridge-Newton, MA-NH takes in Boston, its Massachusetts suburbs and two counties in southern New Hampshire."
          ],
          source: {label: "Census Bureau: Metropolitan and Micropolitan Areas", href: "https://www.census.gov/programs-surveys/metro-micro.html"}
        }},
      {slug: "congressional-districts", hierarchy: "Congressional District", plural: "Congressional Districts", singular: "congressional district", measures: GEO, byState: true, shapes: "Districts",
        blurb: "The districts of the U.S. House of Representatives, each with one member."},
      {slug: "school-districts", hierarchy: "School District", plural: "School Districts", singular: "school district", measures: GEO, byState: true, stateShapes: "SchoolDistrict",
        blurb: "Unified, elementary and secondary public school districts, with figures for everyone who lives inside their boundaries."},
      {slug: "pumas", hierarchy: "PUMA", plural: "PUMAs", singular: "PUMA", measures: GEO, byState: true, shapes: "PUMA",
        blurb: "Public Use Microdata Areas: Census regions of at least 100,000 people that cover each state without gaps, the smallest areas with detailed survey data.",
        explainer: {
          question: "What is a PUMA?",
          answer: [
            "A Public Use Microdata Area (PUMA) is a region the Census Bureau draws to hold at least 100,000 people. PUMAs fit together to cover every state without gaps and never cross a state line. In a large city a PUMA is a group of neighborhoods (Boston has several, such as Mattapan & Roxbury); in the countryside one can span several counties.",
            "They exist because the Census Bureau publishes individual, anonymized answers to the American Community Survey only for areas this large. That makes PUMAs the smallest places for which detailed breakdowns, such as the jobs, wages and degrees of the people who live there, can be calculated. They are redrawn after each decennial census."
          ],
          source: {label: "Census Bureau: Public Use Microdata Areas", href: "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/pumas.html"}
        }}
    ]
  },
  {
    slug: "industries", profile: "naics", dimension: "PUMS Industry", label: "Industries",
    about: "U.S. industries, from broad sectors down to specific industry groups",
    tagline: "From broad sectors to specific industries",
    levels: [
      {slug: "sectors", hierarchy: "Industry Sector", plural: "Industry Sectors", singular: "industry sector", measures: WORK,
        blurb: "The broadest grouping of the economy, such as manufacturing or health care."},
      {slug: "sub-sectors", hierarchy: "Industry Sub-Sector", plural: "Industry Sub-Sectors", singular: "industry sub-sector", measures: WORK, parent: "Industry Sector",
        blurb: "The two-digit NAICS sectors that make up each industry sector."},
      {slug: "groups", hierarchy: "Industry Group", plural: "Industry Groups", singular: "industry group", measures: WORK, parent: "Industry Sub-Sector",
        blurb: "Specific industries, such as hospitals, restaurants or software publishers."}
    ]
  },
  {
    slug: "occupations", profile: "soc", dimension: "PUMS Occupation", label: "Occupations",
    about: "U.S. occupations, from major occupation groups down to detailed jobs",
    tagline: "From job families to detailed occupations",
    levels: [
      {slug: "major-groups", hierarchy: "Major Occupation Group", plural: "Major Occupation Groups", singular: "major occupation group", measures: WORK,
        blurb: "The broadest grouping of jobs, such as service occupations."},
      {slug: "minor-groups", hierarchy: "Minor Occupation Group", plural: "Minor Occupation Groups", singular: "minor occupation group", measures: WORK, parent: "Major Occupation Group",
        blurb: "Groups of related jobs within a major group, such as healthcare practitioners."},
      {slug: "broad-occupations", hierarchy: "Broad Occupation", plural: "Broad Occupations", singular: "broad occupation", measures: WORK, parent: "Minor Occupation Group",
        blurb: "Families of jobs, such as business and financial operations occupations."},
      {slug: "detailed-occupations", hierarchy: "Detailed Occupation", plural: "Detailed Occupations", singular: "detailed occupation", measures: WORK, parent: "Broad Occupation",
        blurb: "Individual jobs, such as registered nurses or software developers."}
    ]
  },
  {
    slug: "degrees", profile: "cip", dimension: "CIP", label: "Degrees",
    about: "college degrees and fields of study, from broad fields down to specific programs",
    tagline: "Fields of study, majors and programs",
    levels: [
      {slug: "fields", hierarchy: "CIP2", plural: "Fields of Study", singular: "field of study", measures: ["completions"],
        blurb: "The broadest fields (2-digit CIP codes), such as engineering or the health professions."},
      {slug: "majors", hierarchy: "CIP4", plural: "Majors", singular: "major", measures: ["completions"], parent: "CIP2",
        blurb: "Groups of related programs (4-digit CIP codes), such as mechanical engineering."},
      {slug: "programs", hierarchy: "CIP6", plural: "Degree Programs", singular: "degree program", measures: ["completions"], parent: "CIP4",
        blurb: "Specific instructional programs (6-digit CIP codes), the level colleges report their degrees at."}
    ]
  },
  {
    slug: "universities", profile: "university", dimension: "University", label: "Universities",
    about: "U.S. colleges and universities and the Carnegie classifications that group them",
    tagline: "Every college, mapped by state",
    home: "colleges",
    levels: [
      {slug: "colleges", hierarchy: "University", plural: "Colleges & Universities", singular: "college or university", measures: ["enrollment", "endowment", "acceptance"], byState: true,
        blurb: "Every degree-granting institution that reports to the Department of Education."},
      {slug: "carnegie-groups", hierarchy: "Carnegie Parent", plural: "Carnegie Classification Groups", singular: "Carnegie classification group", measures: ["completions"],
        blurb: "The broad kinds of institution in the Carnegie Classification, such as doctoral universities."},
      {slug: "carnegie-classifications", hierarchy: "Carnegie", plural: "Carnegie Classifications", singular: "Carnegie classification", measures: ["completions"], parent: "Carnegie Parent",
        blurb: "The detailed Carnegie Classification of each institution by the degrees it awards."}
    ]
  },
  {
    slug: "products", profile: "napcs", dimension: "NAPCS", label: "Products & Services",
    about: "the products and services the federal government buys, by product classification",
    tagline: "What the federal government buys",
    levels: [
      {slug: "sections", hierarchy: "NAPCS Section", plural: "Product Sections", singular: "product section", measures: ["obligation"],
        blurb: "The broadest NAPCS groupings of goods and services."},
      {slug: "groups", hierarchy: "NAPCS Group", plural: "Product Groups", singular: "product group", measures: ["obligation"], parent: "NAPCS Section",
        blurb: "Groups of related products and services within a section."},
      {slug: "classes", hierarchy: "NAPCS Class", plural: "Product Classes", singular: "product class", measures: ["obligation"], parent: "NAPCS Group",
        blurb: "Specific kinds of product or service."}
    ]
  }
];

export function landingFamily(slug: string): LandingFamily | undefined {
  return LANDING_FAMILIES.find(f => f.slug === slug);
}

export function landingFamilyByDimension(dimension: string): LandingFamily | undefined {
  return LANDING_FAMILIES.find(f => f.dimension === dimension);
}

/** The landing page of a level, wherever its family is. */
export function landingLevel(dimension: string, hierarchy: string): {family: LandingFamily; level: LandingLevel} | undefined {
  const family = landingFamilyByDimension(dimension);
  const level = family?.levels.find(l => l.hierarchy === hierarchy);
  return family && level ? {family, level} : undefined;
}

/** A level's plural inside a sentence: lower case, except an acronym ("PUMAs", not "pumas"). */
export function pluralInSentence(level: Pick<LandingLevel, "plural">): string {
  return /^[A-Z]{2}/.test(level.plural) ? level.plural : level.plural.toLowerCase();
}

/** Path of a hub (`/locations`), a level page (`/locations/counties`) or a level in one state. */
export function landingPath(family: LandingFamily, level?: LandingLevel, stateSlug?: string): string {
  if (level && !stateSlug && level.slug === family.home) return `/${family.slug}`;
  return `/${family.slug}${level ? `/${level.slug}` : ""}${level && stateSlug ? `/${stateSlug}` : ""}`;
}

/** What a level's state pages append the state's slug to (`/universities/colleges/`), home level or not. */
export function landingStateBase(family: LandingFamily, level: LandingLevel): string {
  return `/${family.slug}/${level.slug}/`;
}

/** Path of the landing page for a level by its names, or undefined when it has none (the nation). */
export function levelLandingPath(dimension: string, hierarchy: string, stateSlug?: string): string | undefined {
  const found = landingLevel(dimension, hierarchy);
  if (!found) return undefined;
  return landingPath(found.family, found.level, found.level.byState ? stateSlug : undefined);
}
