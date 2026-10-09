// Converted from legacy canon_cms_generator #282 "Attributes (Search)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 282,
  name: "Attributes (Search)",
  allowed: "always",
  api: attrs => `/api/search?id=${attrs.id}&dimension=University`,
  logic: (resp, {variables}) => {
    const {hierarchy} = variables;
    //resp.results[0];
    const {url} = variables;

    return {
      isUniversity: hierarchy === "University",
      isCarnegie: hierarchy === "Carnegie",
      isCarnegieParent: hierarchy === "Carnegie Parent",
      isHiddenUniversity: hierarchy !== "University",
      isHiddenCarnegie: hierarchy !== "Carnegie",
      isHiddenCarnegieParent: hierarchy !== "Carnegie Parent",
      urlLink: url ? `<a href='${url.indexOf("http") === 0 ? "" : "http://"}${url}' target='_blank'>${url.replace(/\/$/g, "")}</a>` : false
    }
  }
};

export default generator;
