/**
 * The helper surface available to report content code (generators, materializers, visualizations).
 *
 * Canon exposed `libs.d3` (d3-array + d3-collection + d3-format + d3-time-format) and
 * `libs.d3plus` (a handful of helpers). The converted content keeps calling `libs.d3.sum`,
 * `libs.d3.nest`, `libs.d3plus.merge`, etc., so the same shape is provided here from the
 * individual d3 modules. Only the functions the content actually uses are exported.
 */
import * as d3Array from "d3-array";
import {nest} from "d3-collection";
import * as d3Format from "d3-format";
import * as d3TimeFormat from "d3-time-format";
import {parseDate} from "@/lib/formatting/parse-date";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Finds the value in `arr` closest to `n` (d3plus-common `closest`). */
function closest(n: number, arr: number[] = []): number {
  if (!arr.length) return n;
  return arr.reduce((prev, curr) => Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev);
}

/**
 * Merges an array of objects into one object (d3plus-common `merge`). Numeric values are summed,
 * identical values are collapsed and differing values are collected into arrays, which is how
 * the legacy content aggregates rows.
 */
function merge(arr: AnyRecord[], aggs: Record<string, (values: any[]) => any> = {}): AnyRecord { // eslint-disable-line @typescript-eslint/no-explicit-any
  const obj: AnyRecord = {};
  const keys = new Set<string>();
  arr.forEach(d => Object.keys(d).forEach(k => keys.add(k)));
  keys.forEach(key => {
    const values = arr.map(d => d[key]);
    if (aggs[key]) {
      obj[key] = aggs[key](values);
      return;
    }
    const uniques = Array.from(new Set(values.map(v => Array.isArray(v) || (v && typeof v === "object") ? JSON.stringify(v) : v)));
    if (uniques.length === 1) obj[key] = values[0];
    else if (values.every(v => typeof v === "number")) obj[key] = d3Array.sum(values);
    else obj[key] = Array.from(new Set(values.flat()));
  });
  return obj;
}

/** Strips a string down to lowercase alphanumerics and dashes (d3plus-text `strip`). */
function strip(value: string): string {
  return String(value)
    .replace(/[^A-Za-z0-9\-_ ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/** Title-cases a string (d3plus-text `titleCase`), keeping common small words lowercase. */
function titleCase(value: string): string {
  const small = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in", "nor", "of", "on", "or", "the", "to", "vs", "via"];
  return String(value)
    .split(" ")
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i && small.includes(lower)) return lower;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/** Deep-assigns objects (d3plus-common `assign`). */
function assign(...objects: AnyRecord[]): AnyRecord {
  const target: AnyRecord = {};
  objects.forEach(source => {
    if (!source) return;
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (value && typeof value === "object" && !Array.isArray(value) && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
        target[key] = assign(target[key], value);
      }
      else target[key] = value;
    });
  });
  return target;
}

/**
 * Content code is dynamically typed legacy JavaScript; the helper surface is therefore typed loosely
 * on purpose (every helper accepts and returns `any`). The implementations above stay fully typed.
 */
type LooseFn = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
export interface ReportLibs {
  d3: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  d3plus: Record<string, LooseFn>;
}

export const libs: ReportLibs = {
  d3: {
    ...d3Array,
    ...d3Format,
    ...d3TimeFormat,
    nest
  },
  d3plus: {
    assign,
    closest,
    date: parseDate,
    merge,
    strip,
    titleCase
  }
};

