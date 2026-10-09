// Lazy registry: each chart module is only downloaded when its section renders in the browser.
import type {VizDefinition} from "@/lib/reports/types";

export const vizModules: Record<number, () => Promise<{default: VizDefinition}>> = {
  115: () => import("./115-sankey"),
  116: () => import("./116-tmap-consumption"),
  117: () => import("./117-tmap-production"),
  118: () => import("./118-job-growth"),
  119: () => import("./119-output-growth"),
  186: () => import("./186-monthly-employment"),
  348: () => import("./348-employment-by-location"),
  349: () => import("./349-wage-ranking"),
  350: () => import("./350-wage-ranking"),
  351: () => import("./351-wage-distribution"),
  352: () => import("./352-occupations-distribution"),
  353: () => import("./353-wage-sex"),
  354: () => import("./354-establishments"),
  355: () => import("./355-establishments"),
  356: () => import("./356-median-earnings"),
  357: () => import("./357-median-earnings"),
  358: () => import("./358-gender-and-age"),
  359: () => import("./359-races"),
  360: () => import("./360-educational-levels")
};
