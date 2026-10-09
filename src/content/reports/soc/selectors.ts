// Converted from legacy canon_cms_selector rows with profile_id = 4.
import type {SelectorDefinition} from "@/lib/reports/types";

export const selectors: SelectorDefinition[] = [
  {
    "id": 17,
    "name": "degree-majors",
    "title": "Degree",
    "type": "single",
    "default": "allDegree",
    "options": [
      {
        "option": "allDegree",
        "allowed": "always"
      },
      {
        "option": "bachelorsDegree",
        "allowed": "always"
      },
      {
        "option": "mastersDegree",
        "allowed": "always"
      },
      {
        "option": "professionalDegree",
        "allowed": "always"
      },
      {
        "option": "doctorateDegree",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 18,
    "name": "skills-measure",
    "title": "Value",
    "type": "single",
    "default": "valueSkills",
    "options": [
      {
        "option": "valueSkills",
        "allowed": "showValueSkills"
      },
      {
        "option": "rcaSkills",
        "allowed": "showRCASkills"
      }
    ]
  },
  {
    "id": 19,
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
    "id": 93,
    "name": "gender-options",
    "title": "Gender",
    "type": "single",
    "default": "",
    "options": [
      {
        "option": "sex0",
        "allowed": "always"
      },
      {
        "option": "sex1",
        "allowed": "always"
      },
      {
        "option": "sex2",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 97,
    "name": "employment-measures",
    "title": "Metric",
    "type": "single",
    "default": "workforceEOT",
    "options": [
      {
        "option": "workforceEOT",
        "allowed": "always"
      },
      {
        "option": "avgWageEOT",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 98,
    "name": "employment-ot-filter",
    "title": "Grouping",
    "type": "single",
    "default": "genderEOT",
    "options": [
      {
        "option": "simOccupationsEOT",
        "allowed": "always"
      },
      {
        "option": "genderEOT",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 99,
    "name": "employment-bl-geo",
    "title": "Level",
    "type": "single",
    "default": "statesEBL",
    "options": [
      {
        "option": "statesEBL",
        "allowed": "always"
      },
      {
        "option": "pumasEBL",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 100,
    "name": "employment-bl-measure",
    "title": "Metric",
    "type": "single",
    "default": "avgWageEBL",
    "options": [
      {
        "option": "workforceEBL",
        "allowed": "always"
      },
      {
        "option": "avgWageEBL",
        "allowed": "always"
      },
      {
        "option": "specializationEBL",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 101,
    "name": "occupation-by-industry-measure",
    "title": "Metric",
    "type": "single",
    "default": "workforceOBI",
    "options": [
      {
        "option": "workforceOBI",
        "allowed": "always"
      },
      {
        "option": "avgWageOBI",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 102,
    "name": "occupation-by-industry-metric",
    "title": "Value",
    "type": "single",
    "default": "valueOBI",
    "options": [
      {
        "option": "valueOBI",
        "allowed": "always"
      },
      {
        "option": "yearlyChangeOBI",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 103,
    "name": "gender-and-age-employment",
    "title": "",
    "type": "single",
    "default": "employedGA",
    "options": [
      {
        "option": "employedGA",
        "allowed": "always"
      },
      {
        "option": "unemployedGA",
        "allowed": "unemploymentOption"
      }
    ]
  },
  {
    "id": 104,
    "name": "gender-and-age-measure",
    "title": "Metric",
    "type": "single",
    "default": "indicator_1",
    "options": [
      {
        "option": "workforceGA",
        "allowed": "employedGA"
      },
      {
        "option": "avgWageGA",
        "allowed": "employedGA"
      }
    ],
    "dynamic": "visEmployedGA"
  },
  {
    "id": 105,
    "name": "ethnicity-employment",
    "title": "",
    "type": "single",
    "default": "employedE",
    "options": [
      {
        "option": "employedE",
        "allowed": "always"
      },
      {
        "option": "unemployedE",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 106,
    "name": "ethnicity-gender",
    "title": "Gender",
    "type": "single",
    "default": "genderAllE",
    "options": [
      {
        "option": "genderAllE",
        "allowed": "always"
      },
      {
        "option": "genderFemaleE",
        "allowed": "always"
      },
      {
        "option": "genderMaleE",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 107,
    "name": "races-employment",
    "title": "",
    "type": "single",
    "default": "employedR",
    "options": [
      {
        "option": "employedR",
        "allowed": "always"
      },
      {
        "option": "unemployedR",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 108,
    "name": "races-filter",
    "title": "",
    "type": "single",
    "default": "genderraceR",
    "options": [
      {
        "option": "genderraceR",
        "allowed": "always"
      },
      {
        "option": "racesR",
        "allowed": "neverShow"
      },
      {
        "option": "shareR",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 109,
    "name": "education-levels",
    "title": "Metric",
    "type": "single",
    "default": "workforceEL",
    "options": [
      {
        "option": "workforceEL",
        "allowed": "always"
      },
      {
        "option": "wageEL",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 110,
    "name": "skills-chart-type",
    "title": "Chart",
    "type": "single",
    "default": "radarSkills",
    "options": [
      {
        "option": "radarSkills",
        "allowed": "always"
      },
      {
        "option": "barchartSkills",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 111,
    "name": "majors-select",
    "title": "Type of Majors",
    "type": "single",
    "default": "commonMajors",
    "options": [
      {
        "option": "commonMajors",
        "allowed": "always"
      },
      {
        "option": "specializedMajors",
        "allowed": "always"
      }
    ]
  }
];
