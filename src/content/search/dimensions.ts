/** Report families shown in the search filters and classification pages (legacy `SearchPage.jsx`). */
export interface SearchDimension {key: string; label: string; icon: string; cls: string}

export const SEARCH_DIMENSIONS: SearchDimension[] = [
  {key: "Geography", label: "Locations", icon: "Geography", cls: "geo"},
  {key: "PUMS Industry", label: "Industries", icon: "PUMS Industry", cls: "naics"},
  {key: "PUMS Occupation", label: "Occupations", icon: "PUMS Occupation", cls: "soc"},
  {key: "CIP", label: "Degrees", icon: "CIP", cls: "cip"},
  {key: "University", label: "Universities", icon: "University", cls: "university"},
  {key: "NAPCS", label: "Products & Services", icon: "NAPCS", cls: "napcs"}
];

export interface SearchPageResult {
  id: string; slug: string; name: string; dimension: string; hierarchy: string; profile: string;
  /** Latest ACS population of a geography (null: no figure). */
  population?: number | null;
  /** Familiar name of a congressional district. */
  label?: string;
  /** A point in a place or school district, when its level is selected. */
  lonlat?: [number, number];
  /** A university's figure in the ranking of the list (null: none reported). */
  value?: number | null;
  /** State a university is in. */
  state?: string;
}

/**
 * What a list of universities can be ranked by on the search page, and the order each ranking
 * starts in. There is no editorial ranking in the data (the published ones are proprietary), so
 * these are the IPEDS figures people rank by themselves.
 */
export const UNIVERSITY_RANK_OPTIONS = [
  {key: "enrollment", label: "Enrollment", ascending: false},
  {key: "endowment", label: "Endowment", ascending: false},
  // admitted applicants over applicants: the lowest rates, the most selective schools, come first
  {key: "acceptance", label: "Acceptance Rate", ascending: true}
] as const;

/** The figure the listed universities carry: its ranking key, column title, IPEDS year and the order of the list. */
export interface SearchMetric {key: string; label: string; year: number | null; ascending: boolean}
