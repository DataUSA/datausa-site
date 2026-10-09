// Visualization metadata of the napcs profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.
import type {VizManifestEntry} from "@/lib/reports/types";

export const visualizations: VizManifestEntry[] = [
  {
    "id": 176,
    "sectionId": 173,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "exporterYear",
      "id",
      "sctg",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "176-exporters"
  },
  {
    "id": 177,
    "sectionId": 174,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "id",
      "importerYear",
      "sctg",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "177-importers"
  },
  {
    "id": 178,
    "sectionId": 175,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "exporterYear",
      "id",
      "name",
      "sctg",
      "tesseract",
      "transportAvg"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "BarChart"
    ],
    "file": "178-shipping-weight"
  },
  {
    "id": 179,
    "sectionId": 176,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "exporterYear",
      "id",
      "sctg",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "179-export-destinations"
  },
  {
    "id": 180,
    "sectionId": 177,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorHighlight",
      "id",
      "importerYear",
      "sctg",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Geomap"
    ],
    "file": "180-import-origins"
  },
  {
    "id": 181,
    "sectionId": 178,
    "ordering": 0,
    "allowed": "always",
    "usedVariables": [
      "colorGrey",
      "colorHighlight",
      "exportData",
      "exporterYear",
      "freightYear",
      "id",
      "importData",
      "name",
      "sctg",
      "tesseract"
    ],
    "usedVariablePrefixes": [],
    "usedVariableTemplates": [],
    "types": [
      "Sankey"
    ],
    "file": "181-product-flow"
  },
  {
    "id": 361,
    "sectionId": 180,
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
      "LinePlot"
    ],
    "file": "361-obligation"
  },
  {
    "id": 362,
    "sectionId": 181,
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
      "Treemap"
    ],
    "file": "362-agency"
  }
];
