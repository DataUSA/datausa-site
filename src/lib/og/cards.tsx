/**
 * Layouts of the generated share images, in the Data USA brand kit's language: deep navy ground,
 * the white wordmark, Palanquin Bold headlines, Pathway Gothic One upper-case labels, the report
 * family's category colour for naming and coral for the active focus.
 *
 * Rendered by Satori (`next/og`), which lays out with flexbox only: every element with more than
 * one child declares `display: flex`, there is no grid, no z-index (later siblings paint on top)
 * and no CSS variables, and a style property set to `undefined` makes it throw. Sizes are fixed
 * pixels on a 1200 × 630 canvas.
 */
/* eslint-disable @next/next/no-img-element -- these elements are drawn by Satori, not sent to a browser */
import type {CSSProperties, ReactElement, ReactNode} from "react";
import type {Fact} from "@/lib/seo/report";
import {REPORT_FAMILIES, type ReportFamily} from "@/lib/seo/site";
import {LOGO_RATIO} from "./assets";
import type {Locator} from "./locator";
import {COLORS, OG_SIZE, PALANQUIN, PATHWAY} from "./theme";

const {width: W, height: H} = OG_SIZE;
const MARGIN = 56;
const STRIP = 10;

const label = (size: number, color: string): CSSProperties => ({
  color, fontFamily: PATHWAY, fontSize: size, letterSpacing: size * 0.06, lineHeight: 1.15, textTransform: "uppercase"
});

/** A hex colour at the given opacity. */
function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function Logo({src, height}: {src: string; height: number}) {
  return <img src={src} alt="" width={Math.round(height * LOGO_RATIO)} height={height} />;
}

/** The six category colours as a band along the bottom edge, the active family's segment raised. */
function CategoryStrip({active}: {active?: string}) {
  return (
    <div style={{position: "absolute", left: 0, bottom: 0, width: W, height: STRIP * 2, display: "flex", alignItems: "flex-end"}}>
      {REPORT_FAMILIES.map(f => (
        <div key={f.slug} style={{width: W / REPORT_FAMILIES.length, height: f.slug === active ? STRIP * 2 : STRIP, backgroundColor: f.color}} />
      ))}
    </div>
  );
}

/** Navy ground, optionally a photo under a navy veil that keeps the text side solid. */
function Ground({photo, veil = "side", children}: {photo?: string; veil?: "side" | "even"; children: ReactNode}) {
  return (
    <div style={{position: "relative", display: "flex", width: W, height: H, backgroundColor: COLORS.navy, color: COLORS.white, fontFamily: PALANQUIN}}>
      {photo && <img src={photo} alt="" width={W} height={H} style={{position: "absolute", left: 0, top: 0, objectFit: "cover"}} />}
      {photo && (
        <div
          style={{
            position: "absolute", left: 0, top: 0, width: W, height: H,
            backgroundImage: veil === "side"
              ? "linear-gradient(90deg, rgba(0,17,44,0.97) 0%, rgba(0,17,44,0.93) 46%, rgba(0,17,44,0.62) 100%)"
              : "linear-gradient(180deg, rgba(0,17,44,0.9) 0%, rgba(0,17,44,0.84) 100%)"
          }}
        />
      )}
      {children}
    </div>
  );
}

function Eyebrow({color, parts}: {color: string; parts: string[]}) {
  return (
    <div style={{display: "flex", alignItems: "center"}}>
      <div style={{width: 18, height: 18, borderRadius: 5, backgroundColor: color, marginRight: 14}} />
      <div style={label(27, color)}>{parts.filter(Boolean).join("  /  ")}</div>
    </div>
  );
}

function FactTile({fact, color}: {fact: Fact; color: string}) {
  return (
    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", padding: "14px 24px 16px", marginRight: 16, borderRadius: 12, backgroundColor: "rgba(18,38,74,0.86)"}}>
      <div style={{fontSize: fact.value.length > 9 ? 40 : 50, fontWeight: 700, lineHeight: 1.1}}>{fact.value}</div>
      <div style={{...label(21, color), marginTop: 4}}>{[fact.year, fact.label].filter(Boolean).join(" ")}</div>
    </div>
  );
}

function LocatorMap({locator}: {locator: Locator}) {
  return (
    <svg width={locator.width} height={locator.height} viewBox={`0 0 ${locator.width} ${locator.height}`}>
      {locator.context.map((d, i) => <path key={`c${i}`} d={d} fill="rgba(239,243,253,0.2)" stroke="rgba(239,243,253,0.55)" strokeWidth={1} />)}
      {locator.focus.map((d, i) => <path key={`f${i}`} d={d} fill={COLORS.coral} stroke={COLORS.white} strokeWidth={1} />)}
      {locator.marker && <circle cx={locator.marker[0]} cy={locator.marker[1]} r={15} fill="rgba(239,97,69,0.28)" stroke={COLORS.coral} strokeWidth={3} />}
      {locator.marker && <circle cx={locator.marker[0]} cy={locator.marker[1]} r={4.5} fill={COLORS.coral} stroke={COLORS.white} strokeWidth={1.5} />}
    </svg>
  );
}

/** Headline size for a name: large for "Texas", stepping down so two lines of a long name still fit. */
function titleSize(name: string, wide: boolean): number {
  const n = name.length * (wide ? 1 : 1.35);
  return n <= 14 ? 92 : n <= 22 ? 78 : n <= 34 ? 64 : n <= 52 ? 54 : n <= 80 ? 44 : 36;
}

export interface ReportCardProps {
  logo: string;
  photo?: string;
  /** "Photo by …" */
  credit?: string;
  family?: ReportFamily;
  /** The member's level in its classification ("County", "Industry Group"). */
  level?: string;
  name: string;
  /** Second line under the name (a district's familiar name, a chart title). */
  tagline?: string;
  facts: Fact[];
  locator?: Locator | null;
}

/** One report: wordmark, family and level, the name, up to three key figures and, for places, a locator map. */
export function ReportCard({logo, photo, credit, family, level, name, tagline, facts, locator}: ReportCardProps): ReactElement {
  const color = family?.color ?? COLORS.coral;
  const textWidth = locator ? 640 : 900;
  return (
    <Ground photo={photo}>
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", flexDirection: "column", padding: `44px ${MARGIN}px 0`}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Logo src={logo} height={46} />
          <div style={label(24, COLORS.mist)}>datausa.io</div>
        </div>
        <div style={{display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between"}}>
          <div style={{display: "flex", flexDirection: "column", width: textWidth}}>
            <Eyebrow color={color} parts={[family?.singular ?? "Report", level && level !== family?.singular ? level : ""]} />
            <div style={{display: "block", lineClamp: 2, marginTop: 10, fontSize: titleSize(name, !locator), fontWeight: 700, lineHeight: 1.12, letterSpacing: -0.5}}>{name}</div>
            {tagline && <div style={{display: "block", lineClamp: 1, marginTop: 8, fontSize: 30, color: COLORS.canvas}}>{tagline}</div>}
          </div>
          {locator && (
            <div style={{display: "flex", padding: 14, borderRadius: 16, backgroundColor: "rgba(0,17,44,0.6)", border: "1px solid rgba(239,243,253,0.18)"}}>
              <LocatorMap locator={locator} />
            </div>
          )}
        </div>
        <div style={{display: "flex", height: 108, marginBottom: STRIP * 2 + 30}}>
          {facts.map(fact => <FactTile key={fact.label} fact={fact} color={color} />)}
        </div>
      </div>
      {credit && <div style={{position: "absolute", right: MARGIN, bottom: STRIP * 2 + 12, fontSize: 15, color: "rgba(239,243,253,0.75)"}}>{credit}</div>}
      <CategoryStrip active={family?.slug} />
    </Ground>
  );
}

export interface CompareSide {
  name: string;
  photo?: string;
  facts: Fact[];
}

/** Two reports side by side: each name over its photo, the shared key figures in rows between them. */
export function CompareCard({logo, family, sides}: {logo: string; family?: ReportFamily; sides: [CompareSide, CompareSide]}): ReactElement {
  const color = family?.color ?? COLORS.coral;
  const half = W / 2;
  // only figures both reports have, in the first report's order
  const rows = sides[0].facts.map(a => ({a, b: sides[1].facts.find(f => f.label === a.label)})).filter((r): r is {a: Fact; b: Fact} => Boolean(r.b)).slice(0, 3);
  const size = Math.min(...sides.map(s => titleSize(s.name, false)), 60);
  return (
    <div style={{position: "relative", display: "flex", width: W, height: H, backgroundColor: COLORS.navy, color: COLORS.white, fontFamily: PALANQUIN}}>
      {sides.map((side, i) => side.photo && <img key={i} src={side.photo} alt="" width={half} height={H} style={{position: "absolute", left: i * half, top: 0, objectFit: "cover"}} />)}
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, backgroundImage: "linear-gradient(180deg, rgba(0,17,44,0.78) 0%, rgba(0,17,44,0.93) 62%, rgba(0,17,44,0.97) 100%)"}} />
      <div style={{position: "absolute", left: half - 1, top: 132, width: 2, height: 150, backgroundColor: "rgba(239,243,253,0.25)"}} />
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", flexDirection: "column", padding: `44px ${MARGIN}px 0`}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Logo src={logo} height={46} />
          <Eyebrow color={color} parts={[family?.label ?? "Reports", "Comparison"]} />
        </div>
        <div style={{display: "flex", height: 190, alignItems: "center"}}>
          {sides.map((side, i) => (
            <div key={i} style={{display: "flex", width: half - MARGIN, justifyContent: "center", padding: "0 28px"}}>
              <div style={{display: "block", lineClamp: 2, fontSize: size, fontWeight: 700, lineHeight: 1.12, textAlign: "center"}}>{side.name}</div>
            </div>
          ))}
        </div>
        <div style={{display: "flex", flexDirection: "column", flex: 1}}>
          {rows.map(({a, b}, i) => (
            <div key={a.label} style={{display: "flex", alignItems: "center", height: 78, borderTop: i ? "1px solid rgba(239,243,253,0.16)" : "none"}}>
              <div style={{display: "flex", flex: 1, justifyContent: "flex-end", fontSize: 46, fontWeight: 700}}>{a.value}</div>
              <div style={{...label(22, color), display: "flex", width: 330, justifyContent: "center", textAlign: "center"}}>{[a.year, a.label].filter(Boolean).join(" ")}</div>
              <div style={{display: "flex", flex: 1, justifyContent: "flex-start", fontSize: 46, fontWeight: 700}}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: "absolute", left: half - 34, top: 173, width: 68, height: 68, borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.coral, ...label(30, COLORS.white), letterSpacing: 1}}>vs</div>
      <CategoryStrip active={family?.slug} />
    </div>
  );
}

export interface PageCardProps {
  logo: string;
  photo?: string;
  /** Section the page belongs to ("About", "Search"). */
  eyebrow?: string;
  /** One string wraps where it must; an array sets the line breaks. */
  headline: string | string[];
  text?: string;
  /** Report counts per family for the category tiles; a family slug highlights its tile. */
  counts?: Record<string, number>;
  active?: string;
}

const commas = new Intl.NumberFormat("en-US");

/** The site and its static pages: wordmark, headline, a line of context and the six category tiles. */
export function PageCard({logo, photo, eyebrow, headline, text, counts, active}: PageCardProps): ReactElement {
  const tile = (W - MARGIN * 2 - 5 * 14) / REPORT_FAMILIES.length;
  const lines = Array.isArray(headline) ? headline : [headline];
  const longest = Math.max(...lines.map(l => l.length));
  const size = longest > 44 ? 54 : longest > 26 ? 64 : 78;
  return (
    <Ground photo={photo} veil="even">
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", flexDirection: "column", padding: `48px ${MARGIN}px ${MARGIN - 6}px`}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Logo src={logo} height={eyebrow ? 50 : 84} />
          {eyebrow && <Eyebrow color={COLORS.coral} parts={[eyebrow]} />}
        </div>
        <div style={{display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", width: 1000}}>
          {lines.map(line => <div key={line} style={{display: "block", lineClamp: 2, fontSize: size, fontWeight: 700, lineHeight: 1.14, letterSpacing: -0.5}}>{line}</div>)}
          {text && <div style={{display: "block", lineClamp: 2, marginTop: 14, fontSize: 29, lineHeight: 1.35, color: COLORS.mist}}>{text}</div>}
        </div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          {REPORT_FAMILIES.map(f => {
            // the other families step back to a tint with their label in the category colour
            const dimmed = active !== undefined && active !== f.slug;
            const ink = dimmed ? f.color : COLORS.navy;
            return (
              <div key={f.slug} style={{display: "flex", flexDirection: "column", justifyContent: "center", width: tile, height: 96, padding: "0 16px", borderRadius: 10, backgroundColor: dimmed ? tint(f.color, 0.16) : f.color, color: ink}}>
                {counts?.[f.slug] !== undefined && <div style={{fontSize: 30, fontWeight: 700, lineHeight: 1.1}}>{commas.format(counts[f.slug])}</div>}
                <div style={{...label(counts ? 21 : 24, ink), marginTop: 2}}>{f.tile}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Ground>
  );
}
