// Converted from legacy canon_cms_selector rows with profile_id = 3.
import type {SelectorDefinition} from "@/lib/reports/types";

export const selectors: SelectorDefinition[] = [
  {
    "id": 23,
    "name": "monthly-employment",
    "title": "Y-Axis",
    "type": "single",
    "default": "latestEmploymentGrowthYoY",
    "options": [
      {
        "option": "latestEmploymentValue",
        "allowed": "always"
      },
      {
        "option": "latestEmploymentGrowthYoY",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 24,
    "name": "bls-start-year",
    "title": "Start Year",
    "type": "single",
    "default": "2008",
    "options": [],
    "dynamic": "latestEmploymentStartYears"
  },
  {
    "id": 81,
    "name": "workforceByStates",
    "title": "",
    "type": "single",
    "default": "workforce",
    "options": [
      {
        "option": "workforce",
        "allowed": "always"
      },
      {
        "option": "wage",
        "allowed": "always"
      },
      {
        "option": "specialization",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 82,
    "name": "geoOption",
    "title": "",
    "type": "single",
    "default": "states",
    "options": [
      {
        "option": "states",
        "allowed": "always"
      },
      {
        "option": "pumas",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 83,
    "name": "genderWage",
    "title": "",
    "type": "single",
    "default": "allOption",
    "options": [
      {
        "option": "allOption",
        "allowed": "always"
      },
      {
        "option": "womenOption",
        "allowed": "always"
      },
      {
        "option": "menOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 84,
    "name": "occupationOption",
    "title": "",
    "type": "single",
    "default": "workforce",
    "options": [
      {
        "option": "workforce",
        "allowed": "always"
      },
      {
        "option": "wage",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 85,
    "name": "changeOccupation",
    "title": "",
    "type": "single",
    "default": "valueOption",
    "options": [
      {
        "option": "valueOption",
        "allowed": "always"
      },
      {
        "option": "growthOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 87,
    "name": "workforcePyramid",
    "title": "",
    "type": "single",
    "default": "workforce",
    "options": [
      {
        "option": "workforce",
        "allowed": "always"
      },
      {
        "option": "wage",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 88,
    "name": "genderRacePoverty",
    "title": "",
    "type": "single",
    "default": "genderRace",
    "options": [
      {
        "option": "genderRace",
        "allowed": "always"
      },
      {
        "option": "races",
        "allowed": "hidden"
      }
    ]
  },
  {
    "id": 89,
    "name": "genderMajors",
    "title": "",
    "type": "single",
    "default": "allOption",
    "options": [
      {
        "option": "allOption",
        "allowed": "always"
      },
      {
        "option": "womenOption",
        "allowed": "always"
      },
      {
        "option": "menOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 90,
    "name": "educationWorkforceWage",
    "title": "",
    "type": "single",
    "default": "workforce",
    "options": [
      {
        "option": "workforce",
        "allowed": "always"
      },
      {
        "option": "wage",
        "allowed": "always"
      }
    ]
  }
];
