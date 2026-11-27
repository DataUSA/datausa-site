import Link from "next/link";
import {formatValue} from "@/lib/landing/data";
import type {HierarchyGroup, HierarchyRank, ReportHierarchy} from "@/lib/reports/hierarchy";
import styles from "./Hierarchy.module.css";

const commas = new Intl.NumberFormat("en-US");
const tenths = new Intl.NumberFormat("en-US", {minimumFractionDigits: 1, maximumFractionDigits: 1});

function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${commas.format(n)}${suffix}`;
}

/** "County in Massachusetts, United States", each part a link: the level to its landing page, the parents to their reports. */
export function HierarchyContext({hierarchy}: {hierarchy: ReportHierarchy}) {
  const {level, parents} = hierarchy;
  if (!level && !parents.length) return null;
  return (
    <>
      {level && <Link href={level.href}>{level.name}</Link>}
      {parents.length > 0 && (level ? " in " : "In ")}
      {parents.map((p, i) => (
        <span key={p.href}>{i > 0 && ", "}{p.name === "United States" && "the "}<Link href={p.href}>{p.name}</Link></span>
      ))}
    </>
  );
}

function Rank({rank}: {rank: HierarchyRank}) {
  return (
    <li>
      <strong>{rank.rank === 1 ? "Largest" : `${ordinal(rank.rank)} largest`}</strong> of {commas.format(rank.of)}{" "}
      {rank.href ? <Link href={rank.href}>{rank.among}</Link> : rank.among} by {rank.by}
    </li>
  );
}

/** How many of a group are listed before the rest fold away. */
const SHOWN = 8;

function Group({group}: {group: HierarchyGroup}) {
  const max = Math.max(1, ...group.children.map(c => c.value ?? 0));
  const item = (child: HierarchyGroup["children"][number]) => (
    <li key={child.id}>
      <Link href={child.href}>{child.name}</Link>
      {group.measure && <span className={styles.value}>{formatValue(group.measure.format, child.value)}</span>}
      {group.measure && <span className={styles.bar} aria-hidden="true"><span style={{width: `${(child.value ?? 0) / max * 100}%`}} /></span>}
    </li>
  );
  const rest = group.children.slice(SHOWN);
  return (
    <section className={styles.group}>
      <h4>
        {group.label}
        <span>{commas.format(group.total)}</span>
      </h4>
      {group.measure && <p className={styles.caption}>{group.measure.year ? `${group.measure.year} ` : ""}{group.measure.label.toLowerCase()}</p>}
      <ol>{group.children.slice(0, SHOWN).map(item)}</ol>
      {rest.length > 0 && (
        <details>
          <summary>{commas.format(rest.length)} more</summary>
          <ol start={SHOWN + 1}>{rest.map(item)}</ol>
        </details>
      )}
      {group.more && <Link className={styles.more} href={group.more.href}>{group.more.name} →</Link>}
    </section>
  );
}

/**
 * The report's member in its hierarchy: how it ranks among its peers, how large and dense it is,
 * and what it contains (the places and school districts of a county, the sub-sectors of an
 * industry sector), each a link to that member's report.
 */
export function Hierarchy({hierarchy, name}: {hierarchy: ReportHierarchy; name: string}) {
  const {ranks, groups, landSqMi, density} = hierarchy;
  const hasFacts = ranks.length > 0 || landSqMi !== undefined || Boolean(hierarchy.metro);
  if (!hasFacts && !groups.length) return null;
  return (
    <div className={styles.hierarchy} id="context">
      <h3 className={styles.heading}>{name} in Context</h3>
      <div className={styles.columns}>
        {hasFacts && (
          <div className={styles.facts}>
            {(hierarchy.level || hierarchy.parents.length > 0) && <p className={styles.where}><HierarchyContext hierarchy={hierarchy} /></p>}
            <ul>
              {hierarchy.metro && <li>Part of the <Link href={hierarchy.metro.href}>{hierarchy.metro.name}</Link> metropolitan area</li>}
              {ranks.map(r => <Rank key={r.among} rank={r} />)}
              {landSqMi !== undefined && <li><strong>{tenths.format(landSqMi)}</strong> square miles of land</li>}
              {density !== undefined && <li><strong>{tenths.format(density)}</strong> people per square mile</li>}
            </ul>
          </div>
        )}
        {groups.map(g => <Group key={g.hierarchy} group={g} />)}
      </div>
    </div>
  );
}
