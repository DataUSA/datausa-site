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
 *
 * Stacked bars: d3plus 4 adds a second label line with the bar's share of its stack ("82.3%") to
 * every stacked Bar whose label is a string, including the empty string configs use to mean "no
 * label" (`applyStackShareLabels`, run after the shape's last `config()` call and without an option
 * to turn it off). d3plus 2 drew no such line. It leaves labels that are already arrays alone, and a
 * one-item array lays out exactly like a string, so Bar labels are returned as one-item arrays.
 *
 * Tooltip rows on plots: hovering a mark on a chart with a discrete axis now shows d3plus 4's
 * "snapped" tooltip, which lists the x and y values first (named by the axis titles, so an axis with
 * an empty title gives an unnamed row) and then the chart's own `tooltipConfig.tbody`, but only when
 * that is an array: rows given as a function, as many CMS configs do, are dropped
 * (`renderSingleTooltip`). d3plus 2 showed the configured rows and nothing else, so when a chart
 * configures rows they replace the generated ones. Charts without configured rows keep the x/y rows.
 *
 * Treemap tile labels: d3plus 4 always labels a tile with its name and its share of the total
 * (`treemapEmit`) and no longer reads `shapeConfig.label`. d3plus 2 let that accessor replace both
 * lines, and the occupation and industry treemaps use it to show the average salary or the yearly
 * growth under the name when coloured by those. It also fixes where the two lines go (the name over
 * the whole tile, the share in a band up to 42px tall) and no longer reads `shapeConfig.Rect.labelBounds`,
 * which the theme uses to inset the name 5px and keep the share to a 17px line at the bottom. The
 * label records are rewritten on their way into the TextBox that lays them out, text and box both;
 * `treemapDef` comes from the package's `internal` entry point.
 */
import {Bar, Plot, Shape, TextBox} from "@d3plus/core";
import {treemapDef} from "@d3plus/core/internal";

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

const barProto = (Bar as unknown as {prototype: AnyRecord}).prototype;

if (typeof barProto.config === "function" && !barProto._configSingleLabel) {
  const config = barProto.config;
  barProto._configSingleLabel = true;
  barProto.config = function configSingleLabel(this: AnyRecord, ...args: unknown[]): unknown {
    const result = config.apply(this, args);
    const label = this.schema?.label as (Accessor & {single?: boolean}) | undefined;
    if (args.length && typeof label === "function" && !label.single) {
      const single: Accessor & {single?: boolean} = (d, i) => {
        const text = label(d, i);
        return text === false || text === undefined || text === null || Array.isArray(text) ? text : [text];
      };
      single.single = true;
      this.schema.label = single;
    }
    return result;
  };
}

const plotProto = (Plot as unknown as {prototype: AnyRecord}).prototype;

if (typeof plotProto._sharedHover === "function" && !plotProto._sharedHoverOwnRows) {
  const sharedHover = plotProto._sharedHover;
  plotProto._sharedHoverOwnRows = true;
  plotProto._sharedHover = function sharedHoverOwnRows(this: AnyRecord, event: AnyRecord): unknown {
    const tip = this._tooltipClass as AnyRecord | undefined;
    // shared (multi-series) and trend-line tooltips build rows of their own
    if (!tip || this.schema?.tooltipShared || event?.pick?.node?.trendFit) return sharedHover.call(this, event);
    const {config, render} = tip;
    let rows: unknown;
    tip.config = function configKeepRows(this: AnyRecord, ...args: AnyRecord[]): unknown {
      if (args[0] && args[0].tbody !== undefined) rows = args[0].tbody;
      return config.apply(this, args);
    };
    tip.render = function renderOwnRows(this: AnyRecord, ...args: unknown[]): unknown {
      if (rows !== undefined) this.tbody(rows);
      return render.apply(this, args);
    };
    try {
      return sharedHover.call(this, event);
    }
    finally {
      delete tip.config;
      delete tip.render;
    }
  };
}

const treemap = treemapDef as unknown as AnyRecord;
const textBoxProto = (TextBox as unknown as {prototype: AnyRecord}).prototype;

if (typeof treemap.emit === "function" && !treemap.emitOwnLabels) {
  const emit = treemap.emit;
  treemap.emitOwnLabels = true;
  treemap.emit = function emitOwnLabels(this: unknown, param: AnyRecord): unknown {
    const shapeConfig = param?.viz?.schema?.shapeConfig as AnyRecord | undefined;
    const label = shapeConfig?.Rect?.label ?? shapeConfig?.label;
    const labelBounds = shapeConfig?.Rect?.labelBounds ?? shapeConfig?.labelBounds;
    if (typeof label !== "function" && typeof labelBounds !== "function") return emit.call(this, param);
    const data = textBoxProto.data;
    textBoxProto.data = function dataOwnLabels(this: AnyRecord, ...args: unknown[]): unknown {
      if (Array.isArray(args[0])) {
        for (const record of args[0] as AnyRecord[]) {
          const node = record?.data;
          if (!node || typeof record.l !== "number" || !node.data) continue;
          if (typeof label === "function") {
            const lines = label(node.data, node.i);
            if (Array.isArray(lines) && lines[record.l] !== undefined) record.text = lines[record.l];
          }
          if (typeof labelBounds === "function" && [node.x0, node.x1, node.y0, node.y1].every(Number.isFinite)) {
            const width = node.x1 - node.x0;
            const height = node.y1 - node.y0;
            const bounds = labelBounds(node.data, node.i, {width, height});
            const box = Array.isArray(bounds) ? bounds[record.l] : bounds;
            if (!box) continue;
            // boxes are given from the tile's centre, as d3plus 2 took them
            record.x = node.x0 + width / 2 + box.x;
            record.y = node.y0 + height / 2 + box.y;
            record.width = box.width;
            record.height = box.height;
            record.rotateAnchor = [box.width / 2, box.height / 2];
          }
        }
      }
      return data.apply(this, args);
    };
    try {
      return emit.call(this, param);
    }
    finally {
      textBoxProto.data = data;
    }
  };
}
