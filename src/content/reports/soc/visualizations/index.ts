// Lazy registry: each chart module is only downloaded when its section renders in the browser.
import type {VizDefinition} from "@/lib/reports/types";

export const vizModules: Record<number, () => Promise<{default: VizDefinition}>> = {
  121: () => import("./121-wage-distribution"),
  133: () => import("./133-radar"),
  134: () => import("./134-bar"),
  135: () => import("./135-job-growth"),
  240: () => import("./240-employment-over-time"),
  241: () => import("./241-wage-ranking"),
  242: () => import("./242-wage-ranking"),
  249: () => import("./249-ethnicity"),
  250: () => import("./250-ethnicity"),
  257: () => import("./257-races"),
  262: () => import("./262-education-levels"),
  263: () => import("./263-skills"),
  264: () => import("./264-races"),
  281: () => import("./281-skills"),
  363: () => import("./363-employment-over-time"),
  368: () => import("./368-wage-ranking"),
  369: () => import("./369-wage-ranking"),
  371: () => import("./371-wage-distribution"),
  372: () => import("./372-occupation-by-industry"),
  373: () => import("./373-gender-and-age"),
  374: () => import("./374-gender-and-age"),
  376: () => import("./376-ethnicity"),
  378: () => import("./378-ethnicity"),
  379: () => import("./379-races"),
  380: () => import("./380-races"),
  384: () => import("./384-majors"),
  385: () => import("./385-education-levels"),
  388: () => import("./388-employment-by-location")
};
