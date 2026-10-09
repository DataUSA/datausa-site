// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 6.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 170,
    "slug": "hero",
    "type": "Hero",
    "ordering": 0,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>{{name}}</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [
      {
        "id": 305,
        "allowed": "showSCTG",
        "title": "<p>Top Producer</p>",
        "value": "<p>{{exporter1NameStat}}</p>",
        "subtitle": "<p>Dollar{{exporter1Value}} in {{exporterYear}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 306,
        "allowed": "showSCTG",
        "title": "<p>Top Consumer</p>",
        "value": "<p>{{importer1NameStat}}</p>",
        "subtitle": "<p>Dollar{{importer1Value}} in {{importerYear}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 302,
        "allowed": "showSCTG",
        "title": "<p>Most Common Transport Type</p>",
        "value": "<p>{{transport1Name}}</p>",
        "subtitle": "<p>Abbreviate{{transport1Value}} tons</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 304,
        "allowed": "obligationValue",
        "title": "<p>Federal Obligation</p>",
        "value": "<p>Dollar{{obligationValue}}</p>",
        "subtitle": "<p>{{obligationYear}} Fiscal Year</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 303,
        "allowed": "showSpending",
        "title": "<p>Top Purchasing Agency</p>",
        "value": "<p>{{agency1Name}}</p>",
        "subtitle": "<p>Dollar{{agency1Value}} in {{obligationYear}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 171,
    "slug": "about",
    "type": "About",
    "ordering": 1,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "About",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 313,
        "allowed": "showSCTG",
        "text": "<p>In {{exporterYear}}, the top producer of {{name}} was {{exporter1Name}} with Dollar{{exporter1Value}}. This is expected to IncreaseWord{{exporterGrowth}} GrowthPct{{exporterGrowth}} to Dollar{{exporterFutureValue}} by {{exporterFutureYear}}. The top consumer was {{importer1Name}} with Dollar{{importer1Value}}, and those inbound shipments are expected to IncreaseWord{{importerGrowth}} GrowthPct{{importerGrowth}} to Dollar{{importerFutureValue}} by {{importerFutureYear}}.</p>"
      },
      {
        "id": 316,
        "allowed": "showSCTG",
        "text": "<p>{{sctgSub}}</p>"
      },
      {
        "id": 315,
        "allowed": "showSCTG",
        "text": "<p>In {{transportYear}}, the most common means of transport for {{name}}, by weight, was {{transport1Name}} with Abbreviate{{transport1Value}} tons, followed by {{transport2Name}} with Abbreviate{{transport2Value}} tons and {{transport3Name}} with Abbreviate{{transport3Value}} tons.</p>"
      },
      {
        "id": 314,
        "allowed": "showSpending",
        "text": "<p>In {{obligationYear}}, the US government spent Dollar{{obligationValue}} on {{name}}. The agency which purchased the largest amount of {{name}} in {{obligationYear}} was {{agency1Name}} (Dollar{{agency1Value}}), followed by {{agency2Name}} (Dollar{{agency2Value}}) and the {{agency3Name}} (Dollar{{agency3Value}}).</p>"
      },
      {
        "id": 317,
        "allowed": "noData",
        "text": "<p>No data is currently available for {{name}} in the USA Spending dataset, and no SCTG crosswalk is available for the Freight Analysis Framework dataset.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 172,
    "slug": "transport",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "showSCTG",
    "position": "default",
    "icon": "box",
    "title": "<p>Transport</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 173,
    "slug": "exporters",
    "type": "TextViz",
    "ordering": 3,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Production</p>",
    "short": "",
    "subtitles": [
      {
        "id": 45,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 319,
        "allowed": "always",
        "text": "<p>In {{exporterYear}}, the US state which produced the most outbound Lower{{name}} was {{exporter1Name}} (Dollar{{exporter1Value}}). Production in {{exporter1Name}} is expected to IncreaseWord{{exporterGrowth}} GrowthPct{{exporterGrowth}} to Dollar{{exporterFutureValue}} by {{exporterFutureYear}}.</p>"
      },
      {
        "id": 318,
        "allowed": "always",
        "text": "<p>The following chart shows the top 5 states that outbound Lower{{name}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 308,
        "allowed": "always",
        "title": "<p>Largest Producers in {{exporterYear}}</p>",
        "value": "<p>{{exporter1Name}}</p>",
        "subtitle": "<p>Dollar{{exporter1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 309,
        "allowed": "always",
        "title": "<p>Largest Producers in {{exporterYear}}</p>",
        "value": "<p>{{exporter2Name}}</p>",
        "subtitle": "<p>Dollar{{exporter2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 307,
        "allowed": "always",
        "title": "<p>Largest Producers in {{exporterYear}}</p>",
        "value": "<p>{{exporter3Name}}</p>",
        "subtitle": "<p>Dollar{{exporter3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      176
    ]
  },
  {
    "id": 174,
    "slug": "importers",
    "type": "TextViz",
    "ordering": 4,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Consumption</p>",
    "short": "",
    "subtitles": [
      {
        "id": 46,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 320,
        "allowed": "always",
        "text": "<p>In {{importerYear}}, the US state which consumed the most inbound Lower{{name}} was {{importer1Name}} (Dollar{{importer1Value}}). Consumption in {{importer1Name}} is expected to IncreaseWord{{importerGrowth}} GrowthPct{{importerGrowth}} to Dollar{{importerFutureValue}} by {{importerFutureYear}}.</p>"
      },
      {
        "id": 321,
        "allowed": "always",
        "text": "<p>The following chart shows the top 5 states that inbound Lower{{name}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 310,
        "allowed": "always",
        "title": "<p>Largest Consumers in {{importerYear}}</p>",
        "value": "<p>{{importer1Name}}</p>",
        "subtitle": "<p>Dollar{{importer1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 311,
        "allowed": "always",
        "title": "<p>Largest Consumers in {{importerYear}}</p>",
        "value": "<p>{{importer2Name}}</p>",
        "subtitle": "<p>Dollar{{importer2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 312,
        "allowed": "always",
        "title": "<p>Largest Consumers in {{importerYear}}</p>",
        "value": "<p>{{importer3Name}}</p>",
        "subtitle": "<p>Dollar{{importer3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      177
    ]
  },
  {
    "id": 175,
    "slug": "shipping-weight",
    "type": "TextViz",
    "ordering": 5,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Transportation Method by Weight</p>",
    "short": "",
    "subtitles": [
      {
        "id": 47,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 322,
        "allowed": "always",
        "text": "<p>In {{transportYear}}, the most common means of transport for Lower{{name}}, by weight, was {{transport1Name}} with Abbreviate{{transport1Value}} tons, followed by {{transport2Name}} with Abbreviate{{transport2Value}} tons and {{transport3Name}} with Abbreviate{{transport3Value}} tons. The following chart shows the breakdown of each transportation type compared to the national average for all products.</p>"
      }
    ],
    "stats": [
      {
        "id": 313,
        "allowed": "always",
        "title": "<p>Most Common Means</p>",
        "value": "<p>{{transport1Name}}</p>",
        "subtitle": "<p>Abbreviate{{transport1Value}} tons</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 314,
        "allowed": "always",
        "title": "<p>Most Common Means</p>",
        "value": "<p>{{transport2Name}}</p>",
        "subtitle": "<p>Abbreviate{{transport2Value}} tons</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 315,
        "allowed": "always",
        "title": "<p>Most Common Means</p>",
        "value": "<p>{{transport3Name}}</p>",
        "subtitle": "<p>Abbreviate{{transport3Value}} tons</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      178
    ]
  },
  {
    "id": 176,
    "slug": "export-destinations",
    "type": "TextViz",
    "ordering": 6,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Outbound {{[[export-dest-export-destinations]]}} Partners</p>",
    "short": "",
    "subtitles": [
      {
        "id": 48,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 323,
        "allowed": "always",
        "text": "<p>In {{yearOutbond}}, the largest purchaser of Lower{{name}} from {{[[export-dest-export-destinations]]}} (excluding {{[[export-dest-export-destinations]]}} itself) is {{[[export-dest-export-destinations]]Dest1Name}} (Dollar{{[[export-dest-export-destinations]]Dest1Value}}), followed by {{[[export-dest-export-destinations]]Dest2Name}} (Dollar{{[[export-dest-export-destinations]]Dest2Value}}) and {{[[export-dest-export-destinations]]Dest3Name}} (Dollar{{[[export-dest-export-destinations]]Dest3Value}})</p>"
      },
      {
        "id": 324,
        "allowed": "always",
        "text": "<p>The following map shows the amount of Lower{{name}} that {{[[export-dest-export-destinations]]}} sells to each state (excluding {{[[export-dest-export-destinations]]}} itself). Select a new state from the dropdown menu to update the map to focus on sales for that state.</p>"
      }
    ],
    "stats": [
      {
        "id": 316,
        "allowed": "always",
        "title": "<p>Top Purchasers (excluding {{[[export-dest-export-destinations]]}})</p>",
        "value": "<p>{{[[export-dest-export-destinations]]Dest1Name}}</p>",
        "subtitle": "<p>Dollar{{[[export-dest-export-destinations]]Dest1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 318,
        "allowed": "always",
        "title": "<p>Top Purchasers (excluding {{[[export-dest-export-destinations]]}})</p>",
        "value": "<p>{{[[export-dest-export-destinations]]Dest2Name}}</p>",
        "subtitle": "<p>Dollar{{[[export-dest-export-destinations]]Dest2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 317,
        "allowed": "always",
        "title": "<p>Top Purchasers (excluding {{[[export-dest-export-destinations]]}})</p>",
        "value": "<p>{{[[export-dest-export-destinations]]Dest3Name}}</p>",
        "subtitle": "<p>Dollar{{[[export-dest-export-destinations]]Dest3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [
      "export-dest-export-destinations"
    ],
    "visualizations": [
      179
    ]
  },
  {
    "id": 177,
    "slug": "import-origins",
    "type": "TextViz",
    "ordering": 7,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Inbound {{[[import-dest-import-origins]]}} Partners</p>",
    "short": "",
    "subtitles": [
      {
        "id": 49,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 325,
        "allowed": "always",
        "text": "<p>In {{yearOutbond}}, the largest domestic source for Lower{{name}} in {{[[import-dest-import-origins]]}} (excluding {{[[import-dest-import-origins]]}} itself) is {{[[import-dest-import-origins]]Origin1Name}} (Dollar{{[[import-dest-import-origins]]Origin1Value}}), followed by {{[[import-dest-import-origins]]Origin2Name}} (Dollar{{[[import-dest-import-origins]]Origin2Value}}) and {{[[import-dest-import-origins]]Origin3Name}} (Dollar{{[[import-dest-import-origins]]Origin3Value}})</p>"
      },
      {
        "id": 326,
        "allowed": "always",
        "text": "<p>The following map shows the amount of Lower{{name}} that each state outbounds to {{[[import-dest-import-origins]]}} (excluding {{[[import-dest-import-origins]]}} itself). Select a new state from the dropdown menu to update the map to focus on purchases made by that state.</p>"
      }
    ],
    "stats": [
      {
        "id": 319,
        "allowed": "always",
        "title": "<p>Top Exporters</p>",
        "value": "<p>{{[[import-dest-import-origins]]Origin1Name}}</p>",
        "subtitle": "<p>Dollar{{[[import-dest-import-origins]]Origin1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 320,
        "allowed": "always",
        "title": "<p>Top Exporters</p>",
        "value": "<p>{{[[import-dest-import-origins]]Origin2Name}}</p>",
        "subtitle": "<p>Dollar{{[[import-dest-import-origins]]Origin2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 321,
        "allowed": "always",
        "title": "<p>Top Exporters</p>",
        "value": "<p>{{[[import-dest-import-origins]]Origin3Name}}</p>",
        "subtitle": "<p>Dollar{{[[import-dest-import-origins]]Origin3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [
      "import-dest-import-origins"
    ],
    "visualizations": [
      180
    ]
  },
  {
    "id": 178,
    "slug": "product-flow",
    "type": "Column",
    "ordering": 8,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Product Flow</p>",
    "short": "",
    "subtitles": [
      {
        "id": 50,
        "allowed": "always",
        "text": "<p>{{sctgSub}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": [
      181
    ]
  },
  {
    "id": 179,
    "slug": "consumption",
    "type": "Grouping",
    "ordering": 9,
    "allowed": "showSpending",
    "position": "default",
    "icon": "import",
    "title": "<p>Government Spending</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 180,
    "slug": "obligation",
    "type": "TextViz",
    "ordering": 10,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Monthly Federal Spending</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 327,
        "allowed": "always",
        "text": "<p>In {{obligationYear}}, the US government spent Dollar{{obligationValue}} on Lower{{name}}.</p>"
      },
      {
        "id": 328,
        "allowed": "always",
        "text": "<p>The following chart shows how that figure fluctuated month by month.</p>"
      }
    ],
    "stats": [
      {
        "id": 322,
        "allowed": "always",
        "title": "<p>{{obligationYear}} Obligation Amount</p>",
        "value": "<p>Dollar{{obligationValue}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 323,
        "allowed": "always",
        "title": "<p>Most Common Purchase Method</p>",
        "value": "<p>{{transaction}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      361
    ]
  },
  {
    "id": 181,
    "slug": "agency",
    "type": "TextViz",
    "ordering": 11,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Purchasing Agencies</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 329,
        "allowed": "always",
        "text": "<p>The agency which purchased the largest amount of Lower{{name}} in Fiscal Year {{obligationYear}} was the {{agency1Name}} (Dollar{{agency1Value}}), followed by the {{agency2Name}} (Dollar{{agency2Value}}) and the {{agency3Name}} (Dollar{{agency3Value}}).</p>"
      },
      {
        "id": 330,
        "allowed": "always",
        "text": "<p>The following chart shows the share of purchases of Lower{{name}} across all federal agencies.</p>"
      }
    ],
    "stats": [
      {
        "id": 324,
        "allowed": "always",
        "title": "<p>Largest Purchasing Agencies</p>",
        "value": "<p>{{agency1Name}}</p>",
        "subtitle": "<p>Dollar{{agency1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 325,
        "allowed": "always",
        "title": "<p>Largest Purchasing Agencies</p>",
        "value": "<p>{{agency2Name}}</p>",
        "subtitle": "<p>Dollar{{agency2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 326,
        "allowed": "always",
        "title": "<p>Largest Purchasing Agencies</p>",
        "value": "<p>{{agency3Name}}</p>",
        "subtitle": "<p>Dollar{{agency3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      362
    ]
  }
];
