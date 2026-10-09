/**
 * Core types of the report engine. Content under `src/content/reports/<type>` is written against
 * these types; `src/lib/reports/engine.ts` executes them.
 */
import type {Formatters} from "@/content/formatters";
import type {ReportLibs} from "@/lib/content/libs";

/**
 * The report variable namespace. It is intentionally dynamic: a geography report produces ~1,800
 * keys computed by generators and materializers, and templates reference them by name.
 */
export type Variables = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** One row of a Tesseract `data.jsonrecords` response. */
export type DataRow = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Shape of Tesseract `data.jsonrecords` responses (and of most other JSON APIs the content calls). */
export interface TesseractResponse {
  data: DataRow[];
  columns?: string[];
  annotations?: Record<string, string>;
  page?: {limit: number; offset: number; total: number};
  [key: string]: unknown;
}

/**
 * A visibility rule. `"always"` shows the item; any other string is the name of a variable whose
 * truthiness decides visibility (after `[[selector]]` substitution), exactly as Canon's `allowed`.
 */
export type Allowed = string;

/**
 * Formatters as seen by legacy content code. The index signature keeps references to formatter
 * names that never existed (`formatters.lowercase`) compiling as `undefined`, exactly as they
 * evaluated in the CMS, instead of silently inventing behaviour.
 */
export type ContentFormatters = Formatters & Record<string, ((n: any) => any) | undefined>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ContentContext {
  libs: ReportLibs;
  formatters: ContentFormatters;
  locale: string;
}

/** Context given to materializers; `swap` resolves `[[selector]]` tokens embedded in their code. */
export interface MaterializerContext extends ContentContext {
  swap: (template: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Context given to generator logic; `variables` are the member attributes known before fetching. */
export interface GeneratorContext extends ContentContext {
  variables: Variables;
}

export interface GeneratorDefinition {
  /** Legacy `canon_cms_generator.id`, kept for traceability. */
  id: number;
  name: string;
  allowed: Allowed;
  /** Builds the request URL from the member attributes (replaces Canon's `<placeholder>` URL templates). */
  api: (attrs: Variables) => string;
  /** Turns the fetched response into variables. Must not throw; errors are recorded, not fatal. */
  logic: (resp: any, ctx: GeneratorContext) => Variables | void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface MaterializerDefinition {
  id: number;
  name: string;
  ordering: number;
  allowed: Allowed;
  logic: (variables: Variables, ctx: MaterializerContext) => Variables | void;
}

export interface SelectorOption {
  option: string;
  allowed?: Allowed;
  label?: string;
}

export interface SelectorDefinition {
  id: number;
  name: string;
  title: string;
  type: "single" | "multi";
  /** Default option; may itself be a `{{variable}}` or reference another selector with `[[name]]`. */
  default: string;
  /** Static options, or empty when `dynamic` names a variable holding the options. */
  options: SelectorOption[];
  dynamic?: string;
}

export interface TextBlock {
  id: number;
  allowed: Allowed;
  /** HTML template containing `{{variable}}`, `Formatter{{variable}}` and `[[selector]]` tokens. */
  text: string;
}

export interface StatBlock {
  id: number;
  allowed: Allowed;
  title: string;
  value: string;
  subtitle: string;
  tooltip: string;
}

export type SectionType =
  | "Hero"
  | "About"
  | "Grouping"
  | "SubGrouping"
  | "TextViz"
  | "Default"
  | "Column"
  | "PrismSection"
  | "PrismSectionForm";

export interface SectionDefinition {
  id: number;
  slug: string;
  type: SectionType;
  ordering: number;
  allowed: Allowed;
  position: string;
  icon: string;
  title: string;
  short: string;
  subtitles: TextBlock[];
  descriptions: TextBlock[];
  stats: StatBlock[];
  /** Selector names in display order. */
  selectors: string[];
  /** Visualization ids in display order (see the profile's visualization manifest). */
  visualizations: number[];
}

export interface VizManifestEntry {
  id: number;
  sectionId: number;
  ordering: number;
  allowed: Allowed;
  /** Variable keys the config function reads, when statically known; `null` means "all". */
  usedVariables: string[] | null;
  /** Prefixes of templated keys (`senator${i}Name` -> "senator"); every variable starting with one is sent. */
  usedVariablePrefixes: string[];
  /** `[[selector]]Suffix` key templates; expanded for every option of the selector. */
  usedVariableTemplates: string[];
  /** Chart type(s) returned by the config, for auditing and preloading. */
  types: string[];
  /** Module path relative to the profile's `visualizations/` folder. */
  file: string;
}

export interface ProfileMeta {
  id: number;
  slug: string;
  dimension: string;
  levels: string[];
  measure: string;
  cubeName: string;
  title: string;
  subtitle: string;
  label: string;
}

/** Everything the engine needs for one report family. */
export interface ReportTemplate {
  meta: ProfileMeta;
  sections: SectionDefinition[];
  selectors: SelectorDefinition[];
  generators: GeneratorDefinition[];
  materializers: MaterializerDefinition[];
  visualizations: VizManifestEntry[];
  /** Hand-written attribute resolver replacing the legacy custom-attributes endpoint. */
  attributes: (member: MemberAttributes, ctx: AttributeContext) => Promise<Variables>;
}

/** A dimension member as resolved from the dimensions database. */
export interface MemberAttributes {
  id: string;
  dimension: string;
  hierarchy: string;
  slug: string;
  name: string;
  cubeName: string;
  imageId: number | null;
  zvalue: number | null;
}

export interface AttributeContext {
  tesseract: string;
  geoservice: string;
  locale: string;
}

/** Context given to visualization config functions in the browser. */
export interface VizContext extends ContentContext {
  variables: Variables;
  /** Current selector values (query params or defaults) for the section. */
  selectors: Record<string, string>;
  /**
   * Applies `[[selector]]` and `Formatter{{variable}}` substitution to a string (Canon varSwap).
   * Typed `any` because legacy code performs arithmetic on swapped selector values.
   */
  swap: (template: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Composite Albers USA projection including Puerto Rico (legacy `window.albersUsaPr`). */
  albersUsaPr: () => unknown;
}

/** A d3plus config object. `type` names the chart component; `data` may be URL(s) or inline rows. */
export type VizConfig = Record<string, any> & {type?: string}; // eslint-disable-line @typescript-eslint/no-explicit-any

export type VizDefinition = (variables: Variables, ctx: VizContext) => VizConfig;
