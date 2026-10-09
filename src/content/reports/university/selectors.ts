// Converted from legacy canon_cms_selector rows with profile_id = 5.
import type {SelectorDefinition} from "@/lib/reports/types";

export const selectors: SelectorDefinition[] = [
  {
    "id": 20,
    "name": "degree-majors",
    "title": "New Selector",
    "type": "single",
    "default": "{{degreeDefault}}",
    "options": [
      {
        "option": "degree1",
        "allowed": "degree1"
      },
      {
        "option": "degree2",
        "allowed": "degree2"
      },
      {
        "option": "degree3",
        "allowed": "degree3"
      },
      {
        "option": "degree4",
        "allowed": "degree4"
      },
      {
        "option": "degree5",
        "allowed": "degree5"
      },
      {
        "option": "degree6",
        "allowed": "degree6"
      },
      {
        "option": "degree7",
        "allowed": "degree7"
      },
      {
        "option": "degree8",
        "allowed": "degree8"
      },
      {
        "option": "degree17",
        "allowed": "degree17"
      },
      {
        "option": "degree18",
        "allowed": "degree18"
      },
      {
        "option": "degree19",
        "allowed": "degree19"
      }
    ],
    "dynamic": "degreesList"
  }
];
