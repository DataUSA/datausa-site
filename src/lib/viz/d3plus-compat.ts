/**
 * Behaviour d3plus 4 changed from d3plus 2 that the CMS chart configs were written against.
 *
 * Nested shapes (a Line or Area is one shape drawn from many data points): d3plus 2 called the style
 * accessors (`stroke`, `fill`, `strokeWidth`, `strokeDasharray`...) with the shape's first data
 * point. d3plus 4 calls them with the points merged into one object (`Shape._styleVal`), and the
 * merge sums numbers, so a numeric id no longer identifies anything: over twelve years
 * `"Kaiser Coverage ID": 1` becomes 12. Configs such as `stroke: d => colorKaiser[d["Kaiser Coverage ID"]]`
 * or `stroke: d => d["University ID"] == id ? colorHighlight : colorGrey` then get no colour or the
 * wrong one. This restores the d3plus 2 rule; `_styleVal` is a private method, so re-check it when
 * upgrading `@d3plus/core` (written against 4.7.0).
 */
import {Shape} from "@d3plus/core";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Accessor = (d: AnyRecord, i: number) => unknown;

const proto = (Shape as unknown as {prototype: AnyRecord}).prototype;

if (typeof proto._styleVal === "function" && !proto._styleValFirstPoint) {
  proto._styleValFirstPoint = true;
  proto._styleVal = function styleVal(fn: unknown, d: AnyRecord, i: number): unknown {
    if (typeof fn !== "function") return fn;
    return d.nested && d.key && d.values ? (fn as Accessor)(d.values[0], d.i) : (fn as Accessor)(d, i);
  };
}
