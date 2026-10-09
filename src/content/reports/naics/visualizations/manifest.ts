// Visualization metadata of the naics profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.
import type {VizManifestEntry} from "@/lib/reports/types";

export const visualizations: VizManifestEntry[] = [
  {
    "id": 115,
    "sectionId": 109,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorCommodityL0",
      "linksFlow",
      "nodesFlow"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Sankey"
    ],
    "file": "115-sankey"
  },
  {
    "id": 116,
    "sectionId": 110,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "beaL0",
      "colorCommodityL0",
      "id",
      "tesseract",
      "vaFilter"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "116-tmap-consumption"
  },
  {
    "id": 117,
    "sectionId": 111,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "beaL0",
      "colorCommodityL0",
      "id",
      "tesseract",
      "vaFilter"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "117-tmap-production"
  },
  {
    "id": 118,
    "sectionId": 113,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "blsIDsList",
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
    "file": "118-job-growth"
  },
  {
    "id": 119,
    "sectionId": 114,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "blsIDsList",
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
    "file": "119-output-growth"
  },
  {
    "id": 186,
    "sectionId": 183,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "blsMonthlyDimension",
      "blsMonthlyID",
      "colorHighlight",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "LinePlot"
    ],
    "file": "186-monthly-employment"
  },
  {
    "id": 348,
    "sectionId": 232,
    "ordering": 0,
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
    "file": "348-employment-by-location"
  },
  {
    "id": 349,
    "sectionId": 233,
    "ordering": 0,
    "allowed": "isSectorOrSubSector",
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
    "file": "349-wage-ranking"
  },
  {
    "id": 350,
    "sectionId": 233,
    "ordering": 1,
    "allowed": "isGroup",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "id",
      "lastYearEmploymentLocation",
      "name",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "350-wage-ranking"
  },
  {
    "id": 351,
    "sectionId": 102,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "giniCurrYear",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "351-wage-distribution"
  },
  {
    "id": 352,
    "sectionId": 235,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorOccPUMS",
      "colorScaleDiverging",
      "colorScaleGood",
      "hierarchy",
      "iconOccPUMS",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Treemap"
    ],
    "file": "352-occupations-distribution"
  },
  {
    "id": 353,
    "sectionId": 106,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGender",
      "colorGrey",
      "colorHighlight",
      "hierarchy",
      "iconGender",
      "id",
      "lastYearOccupationWorkforce",
      "tesseract",
      "topCommonOccupationIds"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "353-wage-sex"
  },
  {
    "id": 354,
    "sectionId": 238,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "blsIdsStr",
      "hierarchy",
      "id",
      "sizeSelected",
      "stateSelected",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "354-establishments"
  },
  {
    "id": 355,
    "sectionId": 238,
    "ordering": 1,
    "allowed": "always",
    "usedVariables": [
      "blsIdsStr",
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "355-establishments"
  },
  {
    "id": 356,
    "sectionId": 239,
    "ordering": 0,
    "allowed": "always",
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
    "file": "356-median-earnings"
  },
  {
    "id": 357,
    "sectionId": 239,
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
    "file": "357-median-earnings"
  },
  {
    "id": 358,
    "sectionId": 240,
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
    "file": "358-gender-and-age"
  },
  {
    "id": 359,
    "sectionId": 241,
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
    "file": "359-races"
  },
  {
    "id": 360,
    "sectionId": 243,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "hierarchy",
      "id",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "360-educational-levels"
  }
];
