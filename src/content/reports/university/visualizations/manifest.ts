// Visualization metadata of the university profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.
import type {VizManifestEntry} from "@/lib/reports/types";

export const visualizations: VizManifestEntry[] = [
  {
    "id": 136,
    "sectionId": 137,
    "ordering": 0,
    "allowed": "hasLocation",
    "usedVariables": [
      "colorBackground",
      "colorHighlight",
      "idCounty",
      "neighborIds",
      "stateIds"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "136-about"
  },
  {
    "id": 144,
    "sectionId": 143,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "name",
      "opeid",
      "similarOpeidId_List",
      "similarUnivIds",
      "similarUnivIdsTemp",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "144-default-rate"
  },
  {
    "id": 155,
    "sectionId": 153,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "commonGradsRCAIds",
      "commonJobsHighestWageIds",
      "iconCIP",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "155-wages"
  },
  {
    "id": 156,
    "sectionId": 154,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "commonGradsRCAIds",
      "commonIndustriesIds",
      "iconCIP",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "156-industries"
  },
  {
    "id": 164,
    "sectionId": 161,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorRaceACS",
      "hierarchy",
      "iconRace",
      "id",
      "raceData",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "164-ethnicity"
  },
  {
    "id": 290,
    "sectionId": 139,
    "ordering": 0,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "290-tuition"
  },
  {
    "id": 297,
    "sectionId": 139,
    "ordering": 1,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "297-tuition"
  },
  {
    "id": 298,
    "sectionId": 140,
    "ordering": 0,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "298-netprice"
  },
  {
    "id": 299,
    "sectionId": 140,
    "ordering": 1,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "idCarnegie",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "299-netprice"
  },
  {
    "id": 300,
    "sectionId": 141,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "300-other-expenses"
  },
  {
    "id": 301,
    "sectionId": 142,
    "ordering": 0,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "301-incomeawards"
  },
  {
    "id": 302,
    "sectionId": 142,
    "ordering": 1,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "302-incomeawards"
  },
  {
    "id": 303,
    "sectionId": 145,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "applicantsYearCurr",
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
    "file": "303-acceptance"
  },
  {
    "id": 304,
    "sectionId": 145,
    "ordering": 1,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "applicantsYearCurr",
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "304-acceptance"
  },
  {
    "id": 305,
    "sectionId": 145,
    "ordering": 2,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "305-acceptance"
  },
  {
    "id": 307,
    "sectionId": 146,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "name",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Plot"
    ],
    "file": "307-sat"
  },
  {
    "id": 308,
    "sectionId": 148,
    "ordering": 0,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "308-enrollment-status"
  },
  {
    "id": 309,
    "sectionId": 148,
    "ordering": 1,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "309-enrollment-status"
  },
  {
    "id": 310,
    "sectionId": 149,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "isCarnegieParent",
      "lengthRetentionRate",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "310-retention"
  },
  {
    "id": 311,
    "sectionId": 150,
    "ordering": 0,
    "allowed": "raceAlienCount",
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
    "file": "311-enrollment-race"
  },
  {
    "id": 312,
    "sectionId": 150,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "312-enrollment-race"
  },
  {
    "id": 313,
    "sectionId": 155,
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
    "file": "313-majors"
  },
  {
    "id": 314,
    "sectionId": 156,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorHighlight",
      "commonMajorsIds",
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
    "file": "314-sex"
  },
  {
    "id": 315,
    "sectionId": 157,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "colorMost",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "315-gender-men"
  },
  {
    "id": 316,
    "sectionId": 158,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "colorMost",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "316-gender-women"
  },
  {
    "id": 317,
    "sectionId": 159,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "317-timeframe"
  },
  {
    "id": 318,
    "sectionId": 160,
    "ordering": 0,
    "allowed": "nonResidentVisibility",
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
    "file": "318-rate"
  },
  {
    "id": 319,
    "sectionId": 160,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorRaceIPEDS",
      "hierarchy",
      "iconRace",
      "id",
      "raceData",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "319-rate"
  },
  {
    "id": 320,
    "sectionId": 162,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorHighlight",
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
    "file": "320-ethnicity-sex"
  },
  {
    "id": 321,
    "sectionId": 164,
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
    "file": "321-endowment"
  },
  {
    "id": 322,
    "sectionId": 164,
    "ordering": 1,
    "allowed": "isCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "322-endowment"
  },
  {
    "id": 323,
    "sectionId": 164,
    "ordering": 2,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "323-endowment"
  },
  {
    "id": 324,
    "sectionId": 169,
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
    "file": "324-instructors-sex"
  },
  {
    "id": 325,
    "sectionId": 168,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorOccupIPEDS",
      "hierarchy",
      "iconSector",
      "id",
      "instructionalEmployees",
      "manyUniversities",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "325-staff-tmap"
  },
  {
    "id": 326,
    "sectionId": 166,
    "ordering": 0,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "lengthSalaryExp",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "326-salaries"
  },
  {
    "id": 327,
    "sectionId": 166,
    "ordering": 1,
    "allowed": "isCarnegieParent",
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
    "file": "327-salaries"
  },
  {
    "id": 331,
    "sectionId": 167,
    "ordering": 0,
    "allowed": "isHiddenCarnegieParent",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "lengthInstructionalSalaries",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "331-instructional-salaries"
  },
  {
    "id": 332,
    "sectionId": 167,
    "ordering": 1,
    "allowed": "isCarnegieParent",
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
    "file": "332-instructional-salaries"
  },
  {
    "id": 340,
    "sectionId": 165,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "carnegieSimilarIDs",
      "colorGrant",
      "hierarchy",
      "id",
      "idCarnegie",
      "idCarnegieParent",
      "similarID",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "340-grants-contracts"
  },
  {
    "id": 341,
    "sectionId": 152,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCIP",
      "commonGradsRCAIds",
      "commonJobsIds",
      "iconCIP",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "341-jobs"
  }
];
