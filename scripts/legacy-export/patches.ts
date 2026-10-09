/**
 * Hand-reviewed patches applied to specific legacy records during extraction.
 *
 * Each entry documents a genuine defect or JavaScript-only idiom in the stored CMS code that
 * TypeScript rejects, and the minimal behaviour-preserving change. Keys are `<table>:<id>`.
 */
export interface RecordPatch {
  note: string;
  /** Names to declare as `let name: any;` at the top of the body (undeclared reads). */
  declare?: string[];
  /** Exact substring replacements applied to the body, in order. */
  replace?: [from: string, to: string][];
}

export const patches: Record<string, RecordPatch> = {
  "generator:667": {
    note: "Dead branch: `if (resp.data > 0)` is never true for an array; inside it `data` was never declared (would throw ReferenceError, which Canon caught). Declared so the module compiles; behaviour unchanged.",
    declare: ["data"]
  },
  "generator:728": {
    note: "Same dead `if (resp.data > 0)` branch as generator 667.",
    declare: ["data"]
  },
  "generator:625": {
    note: "Bitwise `&` between two booleans inside a filter predicate; `&&` yields the same truthiness.",
    replace: [["!== 0 & d[", "!== 0 && d["]]
  },
  "materializer:15": {
    note: "`raceTopSentence` is read but never defined in this materializer (legacy bug: the variable always resolved to undefined, hiding the sentence). Declared so the module compiles; behaviour unchanged.",
    declare: ["raceTopSentence"]
  },
  "visualization:3": {
    note: "`[x] || [y]` is always the left array and `suffixes[false]` relies on JS coercion; made explicit.",
    replace: [
      ["[stateNeighbors] || [\"01000US\"]", "[stateNeighbors]"],
      ["suffixes[(tail < 11 || tail > 13) && tail % 10]", "suffixes[((tail < 11 || tail > 13) && tail % 10) as any]"],
      ["![stateNeighbors] ? \"Top States\" : \"Similar States\"", "\"Similar States\""]
    ]
  },
  "visualization:430": {
    note: "`data: [dataURL, ...dataNation, ...]` spread the second URL string into its characters, so the chart requested ~190 one-letter URLs and never loaded (visible as 'No Data Available' on county pages in production). The intent is clearly a single URL.",
    replace: [["data: [dataURL, ...dataNation, ...dataSimilarURLs]", "data: [dataURL, dataNation, ...dataSimilarURLs]"]]
  },
  "visualization:436": {
    note: "Same spread bug as visualization 430: `...dataNation` turned the national URL into ~190 one-letter requests, so the homeownership chart only ever had the local data.",
    replace: [["data: [dataURL, ...dataNation, ...dataSimilarURLs]", "data: [dataURL, dataNation, ...dataSimilarURLs]"]]
  },
  "visualization:365": {
    note: "`legedTooltip` is a typo of `legendTooltip`, so the legend tooltip configuration never applied (d3plus warns about the unknown key).",
    replace: [["legedTooltip:", "legendTooltip:"]]
  },
  "visualization:392": {
    note: "Multiplying a template string by 1 to coerce it to a number; made the coercion explicit.",
    replace: [["d[\"Group ID\"] = `${degrees[d[\"Group\"]]}`*1;", "d[\"Group ID\"] = Number(`${degrees[d[\"Group\"]]}`);"]]
  },
  "visualization:403": {
    note: "`String.prototype.replace` was called with four arguments; JavaScript ignores the extra two, so only the first replacement ever ran.",
    replace: [["measure.replace(/\\s/g, \"%20\", /\\,/g, \"%2C\")", "measure.replace(/\\s/g, \"%20\")"]]
  }
};
