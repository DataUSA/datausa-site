// Lazy registry: each chart module is only downloaded when its section renders in the browser.
import type {VizDefinition} from "@/lib/reports/types";

export const vizModules: Record<number, () => Promise<{default: VizDefinition}>> = {
  176: () => import("./176-exporters"),
  177: () => import("./177-importers"),
  178: () => import("./178-shipping-weight"),
  179: () => import("./179-export-destinations"),
  180: () => import("./180-import-origins"),
  181: () => import("./181-product-flow"),
  361: () => import("./361-obligation"),
  362: () => import("./362-agency")
};
