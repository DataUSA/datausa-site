// Converted from legacy canon_cms_profile #1 / canon_cms_profile_meta #1 (ordering 0, visible true).
import type {ProfileMeta} from "@/lib/reports/types";

export const meta: ProfileMeta = {
  "id": 1,
  "slug": "geo",
  "dimension": "Geography",
  "levels": [
    "Nation",
    "State",
    "County",
    "Place",
    "MSA",
    "PUMA",
    "Congressional District"
  ],
  "measure": "Population",
  "cubeName": "acs_yg_total_population_5",
  "title": "<p>{{name}}</p>",
  "subtitle": "",
  "label": "<p>Location</p>"
};
