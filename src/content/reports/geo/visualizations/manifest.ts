// Visualization metadata of the geo profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.
import type {VizManifestEntry} from "@/lib/reports/types";

export const visualizations: VizManifestEntry[] = [
  {
    "id": 1,
    "sectionId": 2,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorBackground",
      "colorHighlight",
      "hierarchy",
      "id",
      "neighborIds",
      "stateIds"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "1-about"
  },
  {
    "id": 3,
    "sectionId": 5,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "covidGeoIDs",
      "covidGeoName",
      "hierarchy",
      "id",
      "stateDataID",
      "stateNeighbors"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "3-covid-unemployment"
  },
  {
    "id": 5,
    "sectionId": 8,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "5-president-electoral"
  },
  {
    "id": 6,
    "sectionId": 9,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "electionStackOrder",
      "electionVotesYear",
      "electionYears",
      "hierarchy",
      "hierarchyElectionSubTemp",
      "id",
      "stateElectionIdTemp",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "StackedArea"
    ],
    "file": "6-popular-vote"
  },
  {
    "id": 7,
    "sectionId": 10,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "countyDataDepth",
      "countyDataGeoIDs",
      "electionCut",
      "id",
      "presidentChildrenDiverging",
      "presidentChildrenParty",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "7-president-map"
  },
  {
    "id": 8,
    "sectionId": 11,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "id",
      "senatorYears",
      "tesseract"
    ],
    "usedVariablePrefixes": [
      "senator"
    ],
    "usedVariableTemplates": [],
    "types": [
      "Priestley"
    ],
    "file": "8-us-senator"
  },
  {
    "id": 9,
    "sectionId": 12,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "id",
      "senateStackOrder",
      "senatorYears",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "StackedArea"
    ],
    "file": "9-senate-party"
  },
  {
    "id": 10,
    "sectionId": 13,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorParty",
      "hierarchy",
      "houseDistricts",
      "houseTotal",
      "id",
      "stateIds",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Priestley"
    ],
    "file": "10-house"
  },
  {
    "id": 11,
    "sectionId": 14,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "StackedArea"
    ],
    "file": "11-house-representatives"
  },
  {
    "id": 40,
    "sectionId": 32,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "freightIDs",
      "freightName",
      "freightYear",
      "id",
      "name1",
      "stateNeighbors",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "40-trade-growth"
  },
  {
    "id": 42,
    "sectionId": 35,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "name1",
      "neighborIds",
      "stateDataID",
      "stateNeighbors",
      "tesseract"
    ],
    "usedVariablePrefixes": [
      "provider"
    ],
    "usedVariableTemplates": [
      "[[provider-clinician_patient_ratio]]"
    ],
    "types": [
      "LinePlot"
    ],
    "file": "42-clinician-patient-ratio"
  },
  {
    "id": 63,
    "sectionId": 56,
    "ordering": 0,
    "allowed": "notNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "neighborsList",
      "resultSimilar",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "63-property"
  },
  {
    "id": 184,
    "sectionId": 13,
    "ordering": 0,
    "allowed": "houseMulti",
    "usedVariables": [
      "colorGeo",
      "colorGrey",
      "colorParty",
      "electionStateIDs",
      "iconGeo",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "184-house"
  },
  {
    "id": 185,
    "sectionId": 182,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "stateDataID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "185-covid-employment"
  },
  {
    "id": 202,
    "sectionId": 194,
    "ordering": 0,
    "allowed": "never",
    "usedVariables": [
      "colorGender",
      "colorRaceIPEDS",
      "iconGender",
      "iconRace",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "202-enrollments-diversity"
  },
  {
    "id": 213,
    "sectionId": 224,
    "ordering": 1,
    "allowed": "hidden",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "213-health-outcomes"
  },
  {
    "id": 214,
    "sectionId": 224,
    "ordering": 0,
    "allowed": "never",
    "usedVariables": [
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "214-health-outcomes"
  },
  {
    "id": 215,
    "sectionId": 225,
    "ordering": 0,
    "allowed": "hidden",
    "usedVariables": [
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "215-health-behaviors"
  },
  {
    "id": 216,
    "sectionId": 225,
    "ordering": 1,
    "allowed": "hidden",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "216-health-behaviors"
  },
  {
    "id": 277,
    "sectionId": 31,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "colorScaleDiverging",
      "freightYear",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "277-domestic-production-consumption"
  },
  {
    "id": 279,
    "sectionId": 33,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "colorScaleGood",
      "exporterYear",
      "freightIDs",
      "freightYear",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "279-interstate-trade"
  },
  {
    "id": 293,
    "sectionId": 192,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "hierarchy",
      "id",
      "lenPayroll",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "293-payroll"
  },
  {
    "id": 294,
    "sectionId": 191,
    "ordering": 0,
    "allowed": "isCountyStateMSAnotPR",
    "usedVariables": [
      "colorScaleGood",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart",
      "StackedArea"
    ],
    "file": "294-establishments"
  },
  {
    "id": 328,
    "sectionId": 193,
    "ordering": 0,
    "allowed": "notDistrict",
    "usedVariables": [
      "hierarchy",
      "iconGender",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "328-admissions-applicants-enrolled"
  },
  {
    "id": 329,
    "sectionId": 193,
    "ordering": 1,
    "allowed": "isNationState",
    "usedVariables": [
      "countyList",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "329-admissions-applicants-enrolled"
  },
  {
    "id": 333,
    "sectionId": 194,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorRaceIPEDS",
      "hierarchy",
      "iconGender",
      "iconRace",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "333-enrollments-diversity"
  },
  {
    "id": 334,
    "sectionId": 51,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "hierarchy",
      "iconCIP",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "334-majors"
  },
  {
    "id": 335,
    "sectionId": 52,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorSector",
      "hierarchy",
      "iconSector",
      "id",
      "manyUniversities",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "335-universities"
  },
  {
    "id": 336,
    "sectionId": 54,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorRaceIPEDS",
      "hierarchy",
      "iconGender",
      "iconRace",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "336-student-diversity"
  },
  {
    "id": 337,
    "sectionId": 220,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorSector",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "337-degrees-over-time"
  },
  {
    "id": 338,
    "sectionId": 220,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorSector",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "StackedArea"
    ],
    "file": "338-degrees-over-time"
  },
  {
    "id": 339,
    "sectionId": 196,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorSector",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "339-district-tuition"
  },
  {
    "id": 365,
    "sectionId": 47,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorRaceACS",
      "hierarchy",
      "iconRace",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "365-race-and-ethnicity"
  },
  {
    "id": 366,
    "sectionId": 45,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorScaleGood",
      "pumsHierarchy",
      "pumsID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "366-global-diversity"
  },
  {
    "id": 367,
    "sectionId": 48,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "hierarchy",
      "id",
      "languageCount",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "367-languages"
  },
  {
    "id": 370,
    "sectionId": 49,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "370-veteran"
  },
  {
    "id": 375,
    "sectionId": 186,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "hierarchy",
      "iconGender",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "375-residents"
  },
  {
    "id": 377,
    "sectionId": 185,
    "ordering": 0,
    "allowed": "isNationState",
    "usedVariables": [
      "hierarchy",
      "iconGeo",
      "id",
      "pumasList",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "377-population-by-location"
  },
  {
    "id": 381,
    "sectionId": 187,
    "ordering": 0,
    "allowed": "isNationStatePuma",
    "usedVariables": [
      "colorGender",
      "hierarchy",
      "iconGender",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "381-workforce-diversity"
  },
  {
    "id": 383,
    "sectionId": 189,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "hierarchy",
      "id",
      "pumasList",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "383-workforce-and-wage-by-location"
  },
  {
    "id": 386,
    "sectionId": 23,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorOccACS",
      "colorOccPUMS",
      "colorScaleDiverging",
      "colorScaleGood",
      "hierarchy",
      "iconOccACS",
      "iconOccPUMS",
      "id",
      "tesseract",
      "useAcs"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "386-occupations"
  },
  {
    "id": 387,
    "sectionId": 27,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorIndACS",
      "colorIndPUMS",
      "colorScaleDiverging",
      "colorScaleGood",
      "hierarchy",
      "iconIndACS",
      "iconIndPUMS",
      "id",
      "tesseract",
      "useAcs"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "387-employment-by-industries"
  },
  {
    "id": 390,
    "sectionId": 229,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "electionStateIDs",
      "hierarchy",
      "id",
      "isMSA",
      "isNationStatePuma",
      "stateParentId",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "390-degrees"
  },
  {
    "id": 392,
    "sectionId": 228,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "electionStateIDs",
      "hierarchy",
      "iconGender",
      "id",
      "isMSA",
      "isNationStatePuma",
      "stateParentId",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "392-educational-pyramid"
  },
  {
    "id": 395,
    "sectionId": 223,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorSex",
      "hierarchy",
      "iconGender",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "395-health-care-diversity"
  },
  {
    "id": 401,
    "sectionId": 40,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorKaiser",
      "hierarchy",
      "id",
      "isDistrict",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [],
    "file": "401-uninsured-people"
  },
  {
    "id": 403,
    "sectionId": 21,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorRaceACS",
      "colorSex",
      "hierarchy",
      "iconGender",
      "iconRace",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "403-poverty-and-diversity"
  },
  {
    "id": 409,
    "sectionId": 57,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "409-household-income"
  },
  {
    "id": 410,
    "sectionId": 61,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "acsSingleYear",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "iconGroup",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [],
    "file": "410-mode-transport"
  },
  {
    "id": 411,
    "sectionId": 60,
    "ordering": 2,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "411-commute-time"
  },
  {
    "id": 412,
    "sectionId": 62,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "412-car-ownership"
  },
  {
    "id": 413,
    "sectionId": 56,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "413-property"
  },
  {
    "id": 414,
    "sectionId": 19,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "pumsHierarchy",
      "pumsID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "414-income-distro"
  },
  {
    "id": 416,
    "sectionId": 20,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "childHierarchy",
      "colorGeo",
      "colorRaceACS",
      "hierarchy",
      "iconGeo",
      "id",
      "incomeGeoIDs",
      "incomeRaceSelector",
      "tesseract",
      "tractIds"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "416-income-by-location"
  },
  {
    "id": 417,
    "sectionId": 37,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorScaleBad",
      "colorScaleGood",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "pumaInTheStateIDs",
      "specialTessCut",
      "specialTessDrilldown",
      "stateDataID",
      "tesseract",
      "tractList"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[social-social_needs]]",
      "[[social-social_needs]]Level",
      "[[social-social_needs]]Measure"
    ],
    "types": [
      "Geomap"
    ],
    "file": "417-social-needs"
  },
  {
    "id": 418,
    "sectionId": 197,
    "ordering": 0,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "lenSevereHousing",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot",
      "BarChart"
    ],
    "file": "418-severe-housing-problems"
  },
  {
    "id": 419,
    "sectionId": 197,
    "ordering": 1,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "419-severe-housing-problems"
  },
  {
    "id": 420,
    "sectionId": 198,
    "ordering": 0,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "lenDataChildrenPoverty",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot",
      "BarChart"
    ],
    "file": "420-children-in-poverty"
  },
  {
    "id": 421,
    "sectionId": 198,
    "ordering": 1,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "421-children-in-poverty"
  },
  {
    "id": 422,
    "sectionId": 221,
    "ordering": 0,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "len_socialNeed_opt1",
      "len_socialNeed_opt2",
      "len_socialNeed_opt3",
      "len_socialNeed_opt4",
      "len_socialNeed_opt5",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot",
      "BarChart"
    ],
    "file": "422-crimes-and-accidents"
  },
  {
    "id": 423,
    "sectionId": 221,
    "ordering": 1,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "423-crimes-and-accidents"
  },
  {
    "id": 424,
    "sectionId": 224,
    "ordering": 2,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "424-health-outcomes"
  },
  {
    "id": 425,
    "sectionId": 224,
    "ordering": 3,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "425-health-outcomes"
  },
  {
    "id": 426,
    "sectionId": 225,
    "ordering": 2,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "426-health-behaviors"
  },
  {
    "id": 427,
    "sectionId": 225,
    "ordering": 3,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "427-health-behaviors"
  },
  {
    "id": 428,
    "sectionId": 226,
    "ordering": 0,
    "allowed": "isStateCounty",
    "usedVariables": [
      "hierarchy",
      "id",
      "len_indicator_1",
      "len_indicator_2",
      "len_indicator_3",
      "len_indicator_4",
      "len_indicator_5",
      "len_indicator_6",
      "len_indicator_7",
      "len_indicator_8",
      "len_indicator_9",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot",
      "BarChart"
    ],
    "file": "428-clinical-care"
  },
  {
    "id": 429,
    "sectionId": 226,
    "ordering": 1,
    "allowed": "isNationState",
    "usedVariables": [
      "colorScaleBad",
      "countyDataGeoIDs",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "429-clinical-care"
  },
  {
    "id": 430,
    "sectionId": 46,
    "ordering": 0,
    "allowed": "isNotNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "neighborsList",
      "resultSimilar",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "430-citizenship"
  },
  {
    "id": 431,
    "sectionId": 46,
    "ordering": 1,
    "allowed": "isNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "431-citizenship"
  },
  {
    "id": 432,
    "sectionId": 44,
    "ordering": 0,
    "allowed": "isNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "432-foreign-born-population"
  },
  {
    "id": 433,
    "sectionId": 44,
    "ordering": 1,
    "allowed": "isNotNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "neighborsList",
      "resultSimilar",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "433-foreign-born-population"
  },
  {
    "id": 435,
    "sectionId": 59,
    "ordering": 0,
    "allowed": "isNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "435-rent-own"
  },
  {
    "id": 436,
    "sectionId": 59,
    "ordering": 1,
    "allowed": "isNotNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "name",
      "neighborsList",
      "resultSimilar",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "436-rent-own"
  },
  {
    "id": 437,
    "sectionId": 60,
    "ordering": 1,
    "allowed": "isNotNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "neighborsList",
      "resultSimilar",
      "similarHierarchy",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "437-commute-time"
  },
  {
    "id": 438,
    "sectionId": 60,
    "ordering": 0,
    "allowed": "isNation",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "438-commute-time"
  },
  {
    "id": 439,
    "sectionId": 190,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "hierarchy",
      "iconGender",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "439-median-earnings"
  },
  {
    "id": 441,
    "sectionId": 255,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "countyList",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "441-distance-to-health-services-by-counties"
  },
  {
    "id": 442,
    "sectionId": 256,
    "ordering": 0,
    "allowed": "isPrismCounty",
    "usedVariables": [
      "countyList",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "PrismMap",
      "Geomap"
    ],
    "file": "442-location-of-health-services-facilities"
  },
  {
    "id": 446,
    "sectionId": 258,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "hierarchy",
      "id",
      "name",
      "neighborsList",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "446-distance-to-health-services-by-state"
  }
];
