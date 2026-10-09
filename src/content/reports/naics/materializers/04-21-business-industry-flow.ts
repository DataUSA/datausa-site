// Converted from legacy canon_cms_materializer #21 "[Business] Industry Flow" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 21,
  name: "[Business] Industry Flow",
  ordering: 4,
  allowed: "always",
  logic: (variables, {libs}) => {
    const {sum} = libs.d3;
    const {nodesFlow1, nodesFlow2, linksFlow1, linksFlow2} = variables;
    nodesFlow1[0].output = sum(nodesFlow2, (d: any) => d.value);

    return {
      nodesFlow: nodesFlow1.concat(nodesFlow2),
      linksFlow: linksFlow1.concat(linksFlow2).filter((d: any) => d.source != d.target)
    }

  }
};

export default materializer;
