/**
 * Text template rendering for report content.
 *
 * Templates are plain strings with three kinds of tokens, preserved from the legacy CMS so that
 * editors keep the syntax they know:
 *
 *   `[[selectorName]]`           -> the selected option for a section selector (Canon selSwap)
 *   `{{variableName}}`           -> the variable's value, or "N/A" when undefined (Canon varSwap)
 *   `Formatter{{variableName}}`  -> the variable passed through a formatter first
 *
 * This is deliberately a small regex substitution: no code is evaluated at runtime.
 */
import {getFormatter} from "@/content/formatters";
import type {Variables} from "@/lib/reports/types";

export type SelectorValues = Record<string, string>;

const SELECTOR_TOKEN = /\[\[([^\]]+)\]\]/g;
const VARIABLE_TOKEN = /([A-Za-z0-9]*)\{\{([^}]+)\}\}/g;

/** Replaces every `[[name]]` with the selector's current value. Unknown selectors are left as-is. */
export function selSwap(template: string, selectors: SelectorValues): string {
  if (!template.includes("[[")) return template;
  return template.replace(SELECTOR_TOKEN, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(selectors, name) ? selectors[name] : match
  );
}

/**
 * Replaces every `Formatter{{var}}` with the formatted variable. Missing variables become "N/A",
 * unless `passive` is set, in which case the token is left untouched for a later pass (Canon used
 * this to let dynamic-selector labels resolve first).
 */
export function varSwap(template: string, variables: Variables, passive = false): string {
  if (!template.includes("{{")) return template;
  return template.replace(VARIABLE_TOKEN, (match, formatterName: string, key: string) => {
    const value = variables[key];
    if (value === undefined) return passive ? match : "N/A";
    const formatter = formatterName ? getFormatter(formatterName) : undefined;
    if (!formatter) return String(value);
    try {
      return String(formatter(value));
    }
    catch (error) {
      console.error(`Error using formatter ${formatterName} on ${key}: ${(error as Error).message}`);
      return "N/A";
    }
  });
}

export interface SwapOptions {
  variables: Variables;
  selectors?: SelectorValues;
  /** Labels of dynamic selector options, applied passively before the real variable swap. */
  labels?: Variables;
}

/** Full Canon-compatible substitution: selectors, then dynamic labels (passive), then variables. */
export function swapTemplate(template: string, {variables, selectors = {}, labels}: SwapOptions): string {
  let out = selSwap(template, selectors);
  if (labels) out = varSwap(out, labels, true);
  return varSwap(out, variables);
}

/** Evaluates an `allowed` rule against the variables (after selector substitution). */
export function isAllowed(allowed: string | undefined, variables: Variables, selectors: SelectorValues = {}): boolean {
  if (!allowed || allowed === "always") return true;
  const key = selSwap(allowed, selectors);
  return Boolean(variables[key]);
}
