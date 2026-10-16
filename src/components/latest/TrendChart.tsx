/**
 * Small server-rendered time-series chart for the latest-data home page: a line (or bars for
 * monthly job changes) drawn to one scale, with a gap where the source has no figure. With `axis`
 * it adds gridlines, value ticks and the first and last dates. No client JavaScript.
 */
import {dateLabel, type Point} from "@/lib/latest/series";

interface Props {
  points: Point[];
  unit: "percent" | "jobs" | "dollars";
  /** Keep zero inside the value range (changes that can go negative). */
  zero?: boolean;
  axis?: boolean;
  /** Draw bars instead of a line. */
  bars?: boolean;
  label: string;
  width?: number;
  height?: number;
}

/** About four round ticks across [min, max]. */
function ticks(min: number, max: number): number[] {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * power).find(s => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

function tickLabel(value: number, unit: Props["unit"], step: number): string {
  // one decimal on every tick when the ticks are less than a point apart ("3.8%", "4.0%", "4.2%")
  if (unit === "percent") return `${value.toFixed(step < 1 ? 1 : 0)}%`;
  if (unit === "dollars") return `$${value.toFixed(2)}`;
  return value === 0 ? "0" : `${value > 0 ? "" : "−"}${Number(Math.abs(value).toFixed(0))}K`;
}

const shortDate = (date: string) => {
  const label = dateLabel(date.slice(0, 7));
  return `${label.slice(0, 3)} ${label.slice(-4)}`;
};

export function TrendChart({points, unit, zero, axis, bars, label, width = 300, height = 80}: Props) {
  const values = points.map(p => p.value).filter((v): v is number => v !== null);
  if (values.length < 2) return null;
  const left = axis ? 44 : 2;
  const right = axis ? 10 : 6;
  const top = 8;
  const bottom = axis ? 22 : 6;
  let min = Math.min(...values, ...(zero || bars ? [0] : []));
  let max = Math.max(...values, ...(zero || bars ? [0] : []));
  const grid = axis ? ticks(min, max) : [];
  const step = grid.length > 1 ? grid[1] - grid[0] : 1;
  if (grid.length) { min = Math.min(min, grid[0]); max = Math.max(max, grid[grid.length - 1]); }
  if (!axis) { const pad = (max - min || 1) * 0.08; min -= zero || bars ? 0 : pad; max += pad; }
  const x = (i: number) => left + (points.length === 1 ? 0 : i / (points.length - 1)) * (width - left - right);
  const y = (v: number) => top + (1 - (v - min) / (max - min || 1)) * (height - top - bottom);

  // the line, broken where a value is missing
  let path = "";
  points.forEach((p, i) => {
    if (p.value === null) return;
    const joined = i > 0 && points[i - 1].value !== null;
    path += `${joined ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`;
  });
  const lastIndex = points.map(p => p.value !== null).lastIndexOf(true);
  const last = points[lastIndex];
  const band = (width - left - right) / points.length;

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      {grid.map(t => (
        <g key={t} className={t === 0 ? "zero" : "grid"}>
          <line x1={left} x2={width - right} y1={y(t)} y2={y(t)} />
          <text x={left - 6} y={y(t)} dy="0.32em" textAnchor="end">{tickLabel(t, unit, step)}</text>
        </g>
      ))}
      {!axis && (zero || bars) && min < 0 && <line className="zero" x1={left} x2={width - right} y1={y(0)} y2={y(0)} />}
      {bars
        ? points.map((p, i) => p.value === null ? null : (
          <rect
            key={p.date}
            className={`bar ${p.value < 0 ? "negative" : "positive"}${p.preliminary ? " preliminary" : ""}`}
            x={x(i) - band * 0.4}
            width={Math.max(band * 0.8, 1)}
            y={Math.min(y(p.value), y(0))}
            height={Math.max(Math.abs(y(p.value) - y(0)), 0.5)}
          />
        ))
        : <path className="line" d={path} />}
      {!bars && last && <circle className="end" cx={x(lastIndex)} cy={y(last.value as number)} r={axis ? 4 : 3} />}
      {axis && (
        <g className="dates">
          <text x={x(0)} y={height - 4} textAnchor="start">{shortDate(points[0].date)}</text>
          <text x={x(points.length - 1)} y={height - 4} textAnchor="end">{shortDate(points[points.length - 1].date)}</text>
        </g>
      )}
    </svg>
  );
}
