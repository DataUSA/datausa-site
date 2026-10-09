// Converted from legacy canon_cms_profile #3 / canon_cms_profile_meta #3 (ordering 2, visible true).
import type {ProfileMeta} from "@/lib/reports/types";

export const meta: ProfileMeta = {
  "id": 3,
  "slug": "naics",
  "dimension": "PUMS Industry",
  "levels": [
    "Industry Sector",
    "Industry Sub-Sector",
    "Industry Group"
  ],
  "measure": "Total Population",
  "cubeName": "pums_5",
  "title": "<p>{{name}}</p>",
  "subtitle": "<p>{{hierarchy}}</p>",
  "label": "<p>Industry</p>"
};
