/**
 * Site-wide SEO constants: the canonical origin, the brand lines and what the head tags and share
 * images need to know about each report family (labels, brand colour, the topics a report covers).
 */
export const SITE_URL = (process.env.SITE_URL ?? "https://datausa.io").replace(/\/$/, "");
export const SITE_NAME = "Data USA";
/** The proposition shown on the home page. */
export const SITE_TAGLINE = "The definitive place to explore US public data";
export const SITE_DESCRIPTION = "Explore, map, compare, and download U.S. public data. Data USA turns government datasets into free reports on more than 47,000 locations, industries, occupations, degrees, universities and products.";

export interface ReportFamily {
  /** Profile slug (`/profile/<slug>/…`). */
  slug: string;
  dimension: string;
  /** Plural name used in the navigation and breadcrumbs. */
  label: string;
  /** Short plural name of the brand kit's category tiles. */
  tile: string;
  singular: string;
  /** Brand category colour. */
  color: string;
  /** Appended to a report's `<title>` after its name; the short form is used when the long one would not fit. */
  topics: [long: string, short: string];
  /** Closing sentence of the meta description: what the report lets a visitor explore. */
  explore: (name: string) => string;
}

export const REPORT_FAMILIES: ReportFamily[] = [
  {
    slug: "geo", dimension: "Geography", label: "Locations", tile: "Locations", singular: "Location", color: "#879BF5",
    topics: ["Population, Income & Demographics", "Population & Demographics"],
    explore: name => `Explore demographics, economy, housing, education and health data for ${name}.`
  },
  {
    slug: "naics", dimension: "PUMS Industry", label: "Industries", tile: "Industries", singular: "Industry", color: "#E2CFE6",
    topics: ["Industry Workforce, Wages & Jobs", "Industry Workforce & Wages"],
    explore: () => "Explore the industry's occupations, wages, workforce demographics and locations."
  },
  {
    slug: "soc", dimension: "PUMS Occupation", label: "Occupations", tile: "Jobs", singular: "Occupation", color: "#5CB3AA",
    topics: ["Salary, Jobs & Workforce Data", "Salary & Workforce"],
    explore: () => "Explore wages, employers, education, demographics and locations for this occupation."
  },
  {
    slug: "cip", dimension: "CIP", label: "Degrees", tile: "Degrees", singular: "Degree", color: "#EF7760",
    topics: ["Degrees, Graduates & Salaries", "Degrees & Salaries"],
    explore: () => "Explore institutions, tuition, graduates and career outcomes for this field of study."
  },
  {
    slug: "university", dimension: "University", label: "Universities", tile: "Universities", singular: "University", color: "#E2D993",
    topics: ["Tuition, Admissions & Enrollment", "Tuition & Admissions"],
    explore: () => "Explore costs, financial aid, admissions, enrollment and graduates."
  },
  {
    slug: "napcs", dimension: "NAPCS", label: "Products & Services", tile: "Products", singular: "Product", color: "#EEA86C",
    topics: ["Federal Spending & Purchasing Agencies", "Federal Spending"],
    explore: () => "Explore federal spending over time and the agencies that purchase it."
  }
];

export function familyBySlug(slug: string): ReportFamily | undefined {
  return REPORT_FAMILIES.find(f => f.slug === slug);
}

export function familyByDimension(dimension: string): ReportFamily | undefined {
  return REPORT_FAMILIES.find(f => f.dimension === dimension);
}

/** Search page URL for a report family, optionally narrowed to one of its levels. */
export function searchPath(dimension: string, hierarchy?: string): string {
  const params = new URLSearchParams({dimension});
  if (hierarchy) params.set("hierarchy", hierarchy);
  return `/search?${params.toString()}`;
}

/** Lower-cases a label for use inside a sentence, leaving acronyms alone ("2-digit CIP Fields" → "2-digit CIP fields"). */
export function inSentence(label: string): string {
  return label.replace(/\b[A-Z][a-z]+\b/g, word => word.toLowerCase());
}

/**
 * Plural, readable name of a classification level ("County" → "Counties", "CIP2" → "2-digit CIP
 * Fields"), for headings and titles of the pages that list a level.
 */
export function levelPlural(hierarchy: string): string {
  const special: Record<string, string> = {
    "Nation": "Nation", "County": "Counties", "MSA": "Metropolitan Areas", "PUMA": "PUMAs", "Place": "Cities & Places",
    "University": "Universities", "Carnegie Parent": "Carnegie Classification Groups", "Carnegie": "Carnegie Classifications",
    "CIP2": "2-digit CIP Fields", "CIP4": "4-digit CIP Fields", "CIP6": "6-digit CIP Fields"
  };
  if (special[hierarchy]) return special[hierarchy];
  return /(s|x|ch|sh)$/i.test(hierarchy) ? `${hierarchy}es` : /[^aeiou]y$/i.test(hierarchy) ? `${hierarchy.slice(0, -1)}ies` : `${hierarchy}s`;
}
