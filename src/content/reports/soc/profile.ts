// Converted from legacy canon_cms_profile #4 / canon_cms_profile_meta #4 (ordering 3, visible true).
import type {ProfileMeta} from "@/lib/reports/types";

export const meta: ProfileMeta = {
  "id": 4,
  "slug": "soc",
  "dimension": "PUMS Occupation",
  "levels": [
    "Broad Occupation",
    "Detailed Occupation",
    "Major Occupation Group",
    "Minor Occupation Group"
  ],
  "measure": "Total Population",
  "cubeName": "pums_5",
  "title": "<p>{{name}}</p>",
  "subtitle": "<p>{{hierarchy}}</p>",
  "label": "<p>Occupation</p>"
};
