// Converted from legacy canon_cms_selector rows with profile_id = 1.
import type {SelectorDefinition} from "@/lib/reports/types";

export const selectors: SelectorDefinition[] = [
  {
    "id": 2,
    "name": "race-income-income_geo",
    "title": "Race/Ethnicity",
    "type": "single",
    "default": "incomeRace0",
    "options": [
      {
        "option": "incomeRace0",
        "allowed": "incomeRace0"
      },
      {
        "option": "incomeRace1",
        "allowed": "incomeRace1"
      },
      {
        "option": "incomeRace2",
        "allowed": "incomeRace2"
      },
      {
        "option": "incomeRace3",
        "allowed": "incomeRace3"
      },
      {
        "option": "incomeRace4",
        "allowed": "incomeRace4"
      },
      {
        "option": "incomeRace5",
        "allowed": "incomeRace5"
      },
      {
        "option": "incomeRace6",
        "allowed": "incomeRace6"
      },
      {
        "option": "incomeRace7",
        "allowed": "incomeRace7"
      },
      {
        "option": "incomeRace8",
        "allowed": "incomeRace8"
      },
      {
        "option": "incomeRace9",
        "allowed": "incomeRace9"
      }
    ],
    "dynamic": "incomeRaceSelector"
  },
  {
    "id": 3,
    "name": "trade-flow-domestic_trade",
    "title": "",
    "type": "single",
    "default": "ExportDollar",
    "options": [
      {
        "option": "ExportDollar",
        "allowed": "always"
      },
      {
        "option": "ExportWeight",
        "allowed": "always"
      },
      {
        "option": "ImportDollar",
        "allowed": "always"
      },
      {
        "option": "ImportWeight",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 4,
    "name": "trade-flow-trade_growth",
    "title": "",
    "type": "single",
    "default": "ExportDollar",
    "options": [
      {
        "option": "ExportDollar",
        "allowed": "always"
      },
      {
        "option": "ExportWeight",
        "allowed": "always"
      },
      {
        "option": "ImportDollar",
        "allowed": "always"
      },
      {
        "option": "ImportWeight",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 5,
    "name": "trade-flow-interstate_trade",
    "title": "",
    "type": "single",
    "default": "ExportDollar",
    "options": [
      {
        "option": "ExportDollar",
        "allowed": "always"
      },
      {
        "option": "ExportWeight",
        "allowed": "always"
      },
      {
        "option": "ImportDollar",
        "allowed": "always"
      },
      {
        "option": "ImportWeight",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 6,
    "name": "provider-clinician_patient_ratio",
    "title": "",
    "type": "single",
    "default": "provider1",
    "options": [
      {
        "option": "provider1",
        "allowed": "always"
      },
      {
        "option": "provider2",
        "allowed": "always"
      },
      {
        "option": "provider3",
        "allowed": "always"
      },
      {
        "option": "provider4",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 8,
    "name": "social-social_needs",
    "title": "",
    "type": "single",
    "default": "homeless",
    "options": [
      {
        "option": "homeless",
        "allowed": "homelessYear"
      },
      {
        "option": "exercise",
        "allowed": "exerciseYear"
      },
      {
        "option": "food",
        "allowed": "foodYear"
      },
      {
        "option": "plumbing",
        "allowed": "plumbingYear"
      },
      {
        "option": "kitchen",
        "allowed": "kitchenYear"
      },
      {
        "option": "internet",
        "allowed": "internetYear"
      }
    ]
  },
  {
    "id": 11,
    "name": "degree-majors",
    "title": "",
    "type": "single",
    "default": "{{degreesTop}}",
    "options": [
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
    "id": 25,
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
    "id": 29,
    "name": "pums5RacesPyramid",
    "title": "RACE/ETHNICITY",
    "type": "single",
    "default": "pums5Race0",
    "options": [],
    "dynamic": "pums5RaceSelector"
  },
  {
    "id": 30,
    "name": "pums5RacesResident",
    "title": "RACE/ETHNICITY",
    "type": "single",
    "default": "pums5Race0",
    "options": [],
    "dynamic": "pums5RaceSelector"
  },
  {
    "id": 31,
    "name": "genderResidents",
    "title": "Sex",
    "type": "single",
    "default": "sex0",
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
    "id": 32,
    "name": "pums5WorkforcePyramid",
    "title": "RACE/ETHNICITY",
    "type": "single",
    "default": "pums5Race0",
    "options": [],
    "dynamic": "pums5RaceSelector"
  },
  {
    "id": 33,
    "name": "measureWorkforcePyramid",
    "title": "Measure",
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
    "id": 34,
    "name": "pums5RacesWorkforce",
    "title": "RACE/ETHNICITY",
    "type": "single",
    "default": "pums5Race0",
    "options": [],
    "dynamic": "pums5RaceSelector"
  },
  {
    "id": 35,
    "name": "measureWorkforceGeomap",
    "title": "Measure",
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
    "id": 36,
    "name": "yearlyChangeWorkforceGeomap",
    "title": "",
    "type": "single",
    "default": "value",
    "options": [
      {
        "option": "value",
        "allowed": "always"
      },
      {
        "option": "growth",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 37,
    "name": "genderOccupations",
    "title": "",
    "type": "single",
    "default": "sex0",
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
    "id": 38,
    "name": "measureOccupations",
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
    "id": 39,
    "name": "growthOccupations",
    "title": "",
    "type": "single",
    "default": "value",
    "options": [
      {
        "option": "value",
        "allowed": "always"
      },
      {
        "option": "growth",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 40,
    "name": "measureTreemapIndustries",
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
    "id": 41,
    "name": "genderTreemapIndustries",
    "title": "",
    "type": "single",
    "default": "sex0",
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
    "id": 42,
    "name": "yearlyChangeTreemapIndustries",
    "title": "",
    "type": "single",
    "default": "valueMeasure",
    "options": [
      {
        "option": "valueMeasure",
        "allowed": "always"
      },
      {
        "option": "growth",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 43,
    "name": "establishmentSize",
    "title": "",
    "type": "single",
    "default": "numberOfEstablishments",
    "options": [
      {
        "option": "numberOfEstablishments",
        "allowed": "always"
      },
      {
        "option": "numberOfEmployees",
        "allowed": "isState"
      }
    ]
  },
  {
    "id": 44,
    "name": "carnegieParents1",
    "title": "University",
    "type": "single",
    "default": "carnegie_0",
    "options": [],
    "dynamic": "carnegieParents"
  },
  {
    "id": 45,
    "name": "enrolledOptions",
    "title": "Measure",
    "type": "single",
    "default": "applicants",
    "options": [
      {
        "option": "applicants",
        "allowed": "always"
      },
      {
        "option": "admitted",
        "allowed": "always"
      },
      {
        "option": "enrolled",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 46,
    "name": "enrollmentsDiversity",
    "title": "",
    "type": "single",
    "default": "raceGenderOption",
    "options": [
      {
        "option": "raceGenderOption",
        "allowed": "always"
      },
      {
        "option": "genderOption",
        "allowed": "always"
      },
      {
        "option": "raceOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 48,
    "name": "carnegieParents2",
    "title": "Universities",
    "type": "single",
    "default": "carnegie_0",
    "options": [],
    "dynamic": "carnegieParents"
  },
  {
    "id": 50,
    "name": "genderUniversities",
    "title": "Gender",
    "type": "single",
    "default": "sex0",
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
    "id": 51,
    "name": "racesUniversities",
    "title": "Race",
    "type": "single",
    "default": "ipedsRace0",
    "options": [],
    "dynamic": "educationRaceSelector"
  },
  {
    "id": 52,
    "name": "completionsUniversities",
    "title": "University",
    "type": "single",
    "default": "carnegie_0",
    "options": [],
    "dynamic": "carnegieParents"
  },
  {
    "id": 53,
    "name": "genderRaceOptions",
    "title": "",
    "type": "single",
    "default": "raceGenderOption",
    "options": [
      {
        "option": "raceGenderOption",
        "allowed": "always"
      },
      {
        "option": "raceOption",
        "allowed": "always"
      },
      {
        "option": "genderOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 54,
    "name": "statusEducation",
    "title": "",
    "type": "single",
    "default": "statusEducation0",
    "options": [
      {
        "option": "statusEducation0",
        "allowed": "always"
      },
      {
        "option": "statusEducation1",
        "allowed": "always"
      },
      {
        "option": "statusEducation2",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 55,
    "name": "degreesOrSector",
    "title": "",
    "type": "single",
    "default": "degreesOption",
    "options": [
      {
        "option": "degreesOption",
        "allowed": "always"
      },
      {
        "option": "sectorOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 57,
    "name": "carnegieUniversities",
    "title": "Universities",
    "type": "single",
    "default": "carnegie_0",
    "options": [],
    "dynamic": "carnegieParents"
  },
  {
    "id": 58,
    "name": "propertyTaxesValue",
    "title": "",
    "type": "single",
    "default": "propertyTaxes",
    "options": [
      {
        "option": "propertyTaxes",
        "allowed": "always"
      },
      {
        "option": "propertyValue",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 59,
    "name": "rentMortgage",
    "title": "",
    "type": "single",
    "default": "rentOwn",
    "options": [
      {
        "option": "rentOwn",
        "allowed": "always"
      },
      {
        "option": "homeownersMortgage",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 60,
    "name": "sexAgeRacePoverty",
    "title": "",
    "type": "single",
    "default": "raceGenderOption",
    "options": [
      {
        "option": "raceGenderOption",
        "allowed": "always"
      },
      {
        "option": "ageSexOption",
        "allowed": "always"
      },
      {
        "option": "raceOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 61,
    "name": "socialNeedsSelector",
    "title": "Indicator",
    "type": "single",
    "default": "socialNeed_opt1",
    "options": [
      {
        "option": "socialNeed_opt1",
        "allowed": "always"
      },
      {
        "option": "socialNeed_opt2",
        "allowed": "always"
      },
      {
        "option": "socialNeed_opt3",
        "allowed": "always"
      },
      {
        "option": "socialNeed_opt4",
        "allowed": "always"
      },
      {
        "option": "socialNeed_opt5",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 62,
    "name": "healthDiversity",
    "title": "",
    "type": "single",
    "default": "genderOption",
    "options": [
      {
        "option": "genderOption",
        "allowed": "always"
      },
      {
        "option": "ageOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 65,
    "name": "healthOutcomesOptions",
    "title": "",
    "type": "single",
    "default": "qualityOfLife",
    "options": [
      {
        "option": "lengthOfLife",
        "allowed": "always"
      },
      {
        "option": "qualityOfLife",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 66,
    "name": "lengthOfLife",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_1",
    "options": [],
    "dynamic": "lenghtOfLife"
  },
  {
    "id": 67,
    "name": "qualityOfLife",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_7",
    "options": [],
    "dynamic": "qualityOfLife_"
  },
  {
    "id": 69,
    "name": "healthBehaviorsOptions",
    "title": "",
    "type": "single",
    "default": "dietAndExerciseOption",
    "options": [
      {
        "option": "dietAndExerciseOption",
        "allowed": "always"
      },
      {
        "option": "alcoholDrugsTobaccoOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 72,
    "name": "dietAndExerciseOptions",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_1",
    "options": [],
    "dynamic": "dietAndExercise"
  },
  {
    "id": 74,
    "name": "alcoholDrugsTobaccoOptions",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_7",
    "options": [],
    "dynamic": "alcoholDrugsTobacco"
  },
  {
    "id": 75,
    "name": "clinicalCareOptions",
    "title": "",
    "type": "single",
    "default": "accessCareOption",
    "options": [
      {
        "option": "accessCareOption",
        "allowed": "always"
      },
      {
        "option": "accessQualityOption",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 76,
    "name": "accessCareOptions",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_1",
    "options": [],
    "dynamic": "accessCare"
  },
  {
    "id": 77,
    "name": "qualityCareOptions",
    "title": "Indicator",
    "type": "single",
    "default": "indicator_8",
    "options": [],
    "dynamic": "qualityCare"
  },
  {
    "id": 78,
    "name": "popEducation",
    "title": "Measure",
    "type": "single",
    "default": "population",
    "options": [
      {
        "option": "population",
        "allowed": "always"
      },
      {
        "option": "wage",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 79,
    "name": "raceEducation",
    "title": "Race",
    "type": "single",
    "default": "pums5Race0",
    "options": [],
    "dynamic": "pums5RaceSelector"
  },
  {
    "id": 80,
    "name": "educationAges",
    "title": "",
    "type": "single",
    "default": "age25",
    "options": [
      {
        "option": "age25",
        "allowed": "always"
      },
      {
        "option": "allPopulation",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 112,
    "name": "establishmentSizeIndustries",
    "title": "",
    "type": "single",
    "default": "industry_0",
    "options": [],
    "dynamic": "cbpIndustries"
  },
  {
    "id": 113,
    "name": "establishmentSizeMetric",
    "title": "",
    "type": "single",
    "default": "value",
    "options": [
      {
        "option": "value",
        "allowed": "always"
      },
      {
        "option": "share",
        "allowed": "always"
      }
    ]
  },
  {
    "id": 114,
    "name": "healthServiceSelector",
    "title": "Health Service Type",
    "type": "single",
    "default": "{{healthServiceTypeDefault}}",
    "options": [],
    "dynamic": "healthServiceType"
  },
  {
    "id": 115,
    "name": "healthServiceSelector2",
    "title": "Health Service Type",
    "type": "single",
    "default": "{{healthServiceTypeDefault}}",
    "options": [],
    "dynamic": "healthServiceType"
  },
  {
    "id": 116,
    "name": "healthServiceSelector3",
    "title": "Health Service Type",
    "type": "single",
    "default": "{{healthServiceTypeDefault}}",
    "options": [],
    "dynamic": "healthServiceType"
  }
];
