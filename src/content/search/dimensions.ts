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
}
