// Visualization metadata of the cip profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.
import type {VizManifestEntry} from "@/lib/reports/types";

export const visualizations: VizManifestEntry[] = [
  {
    "id": 72,
    "sectionId": 66,
    "ordering": 0,
    "allowed": "neverShow",
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
    "file": "72-tmap-institutions-grads"
  },
  {
    "id": 73,
    "sectionId": 67,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "id",
      "keySameLevel",
      "neighbourLevel",
      "socLevelName"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[tuition-measure-tuition_costs]]"
    ],
    "types": [
      "BarChart"
    ],
    "file": "73-tuition-costs"
  },
  {
    "id": 75,
    "sectionId": 69,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "75-counties-most-degrees"
  },
  {
    "id": 77,
    "sectionId": 72,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorHighlight",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "77-top-income"
  },
  {
    "id": 83,
    "sectionId": 76,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorMost",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "83-top-occ-wage"
  },
  {
    "id": 84,
    "sectionId": 76,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorLeast",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "84-top-occ-wage"
  },
  {
    "id": 85,
    "sectionId": 77,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorOccPUMS",
      "iconOccPUMS",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "85-tmap-occ-num-emp-degree"
  },
  {
    "id": 86,
    "sectionId": 78,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorMost",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "86-top-ind-num-emp"
  },
  {
    "id": 87,
    "sectionId": 78,
    "ordering": 1,
    "allowed": "neverShow",
    "usedVariables": [
      "colorLeast",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "87-top-ind-num-emp"
  },
  {
    "id": 88,
    "sectionId": 79,
    "ordering": 1,
    "allowed": "neverShow",
    "usedVariables": [
      "colorLeast",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "88-top-ind-wage"
  },
  {
    "id": 89,
    "sectionId": 79,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorMost",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "89-top-ind-wage"
  },
  {
    "id": 90,
    "sectionId": 80,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorIndPUMS",
      "iconIndPUMS",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "90-tmap-ind-num-emp"
  },
  {
    "id": 92,
    "sectionId": 83,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorHighlight",
      "iconGender",
      "idCIP2"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "92-workforce-age"
  },
  {
    "id": 93,
    "sectionId": 84,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorHighlight",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "93-degree-obtainment"
  },
  {
    "id": 94,
    "sectionId": 85,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorHighlight",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "94-degree-workforce"
  },
  {
    "id": 95,
    "sectionId": 86,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorGrey",
      "hierarchy",
      "iconGender",
      "id",
      "tesseract",
      "universityTop5"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "95-enrolled-sex"
  },
  {
    "id": 98,
    "sectionId": 89,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[birthplace-measure-global_diversity]]"
    ],
    "types": [
      "Geomap"
    ],
    "file": "98-global-diversity"
  },
  {
    "id": 99,
    "sectionId": 91,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorHighlight",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[skill-radar-value-radar]]"
    ],
    "types": [
      "Radar"
    ],
    "file": "99-radar"
  },
  {
    "id": 100,
    "sectionId": 92,
    "ordering": 0,
    "allowed": "neverShow",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "colorOnet",
      "iconOnet",
      "id"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[skill-bar-value-bar]]"
    ],
    "types": [
      "BarChart"
    ],
    "file": "100-bar"
  },
  {
    "id": 275,
    "sectionId": 91,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[skill-radar-value-radar]]"
    ],
    "types": [
      "Radar"
    ],
    "file": "275-radar"
  },
  {
    "id": 280,
    "sectionId": 92,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "colorOnet",
      "hierarchy",
      "iconOnet",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[skill-bar-value-bar]]"
    ],
    "types": [
      "BarChart"
    ],
    "file": "280-bar"
  },
  {
    "id": 282,
    "sectionId": 66,
    "ordering": 1,
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
    "file": "282-tmap-institutions-grads"
  },
  {
    "id": 283,
    "sectionId": 67,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "keySameLevel",
      "neighbourLevel",
      "socLevelName",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[tuition-measure-tuition_costs]]"
    ],
    "types": [
      "BarChart"
    ],
    "file": "283-tuition-costs"
  },
  {
    "id": 285,
    "sectionId": 68,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
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
    "file": "285-institutions-most-degrees"
  },
  {
    "id": 286,
    "sectionId": 69,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "286-counties-most-degrees"
  },
  {
    "id": 287,
    "sectionId": 84,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
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
    "file": "287-degree-obtainment"
  },
  {
    "id": 288,
    "sectionId": 87,
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
    "file": "288-ethnicity-degrees"
  },
  {
    "id": 289,
    "sectionId": 88,
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
    "file": "289-grads-ethnicity-sex"
  },
  {
    "id": 342,
    "sectionId": 72,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
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
    "file": "342-top-income"
  },
  {
    "id": 343,
    "sectionId": 73,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "343-locations"
  },
  {
    "id": 344,
    "sectionId": 74,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorMost",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "344-top-occ-num-emp"
  },
  {
    "id": 345,
    "sectionId": 74,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorLeast",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "345-top-occ-num-emp"
  },
  {
    "id": 391,
    "sectionId": 75,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorMost",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "391-top-occ-rca"
  },
  {
    "id": 393,
    "sectionId": 75,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorLeast",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "393-top-occ-rca"
  },
  {
    "id": 394,
    "sectionId": 77,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorOccPUMS",
      "hierarchy",
      "iconOccPUMS",
      "id",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "394-tmap-occ-num-emp-degree"
  },
  {
    "id": 396,
    "sectionId": 78,
    "ordering": 2,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorMost",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "396-top-ind-num-emp"
  },
  {
    "id": 397,
    "sectionId": 78,
    "ordering": 3,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorLeast",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "397-top-ind-num-emp"
  },
  {
    "id": 398,
    "sectionId": 79,
    "ordering": 2,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorMost",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "398-top-ind-wage"
  },
  {
    "id": 399,
    "sectionId": 79,
    "ordering": 3,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorLeast",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "399-top-ind-wage"
  },
  {
    "id": 400,
    "sectionId": 80,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorIndPUMS",
      "iconIndPUMS",
      "idCIP2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "400-tmap-ind-num-emp"
  },
  {
    "id": 404,
    "sectionId": 81,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "404-ind-geo-map"
  },
  {
    "id": 405,
    "sectionId": 83,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorHighlight",
      "iconGender",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "405-workforce-age"
  },
  {
    "id": 406,
    "sectionId": 85,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "colorHighlight",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "406-degree-workforce"
  },
  {
    "id": 407,
    "sectionId": 89,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "cip2",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [
      "[[birthplace-measure-global_diversity]]"
    ],
    "types": [
      "Geomap"
    ],
    "file": "407-global-diversity"
  }
];
