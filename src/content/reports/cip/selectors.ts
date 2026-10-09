// Converted from legacy canon_cms_selector rows with profile_id = 2.
import type {SelectorDefinition} from "@/lib/reports/types";

export const selectors: SelectorDefinition[] = [
  {
    "id": 12,
    "name": "tuition-measure-tuition_costs",
    "title": "New Selector",
    "type": "single",
    "default": "inStateMeasure",
    "options": [
      {
        "option": "inStateMeasure",
        "allowed": "always"
      },
      {
        "option": "outStateMeasure",
        "allowed": "always"
      },
      {
        "option": "graduatesMeasure",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 13,
    "name": "degree-grads_ethnicity_gender",
    "title": "Degrees",
    "type": "single",
    "default": "{{degreesTop}}",
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
    ]
  },
  {
    "id": 14,
    "name": "birthplace-measure-global_diversity",
    "title": "New Selector",
    "type": "single",
    "default": "popMeasure",
    "options": [
      {
        "option": "popMeasure",
        "allowed": "always"
      },
      {
        "option": "popRCAMeasure",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 15,
    "name": "skill-radar-value-radar",
    "title": "New Selector",
    "type": "single",
    "default": "onetValue",
    "options": [
      {
        "option": "onetValue",
        "allowed": "always"
      },
      {
        "option": "onetRCA",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 16,
    "name": "skill-bar-value-bar",
    "title": "New Selector",
    "type": "single",
    "default": "onetValue",
    "options": [
      {
        "option": "onetValue",
        "allowed": "always"
      },
      {
        "option": "onetRCA",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 117,
    "name": "degrees",
    "title": "Degrees",
    "type": "single",
    "default": "{{degreeDefault}}",
    "options": [],
    "dynamic": "degreesList"
  }
];
