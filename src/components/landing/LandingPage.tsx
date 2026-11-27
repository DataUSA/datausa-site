import Link from "next/link";
import {LANDING_FAMILIES, landingPath, landingStateBase, pluralInSentence, type LandingFamily, type LandingLevel, type LandingMeasure} from "@/content/landing/levels";
import {JsonLd} from "@/components/seo/JsonLd";
import {SearchBox} from "@/components/search/SearchBox";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {stateCounts, universityLocations} from "@/lib/dimensions/geo-db";
import {getUniversityFigures} from "@/lib/dimensions/universities";
import {isPendingLevel} from "@/lib/geo/levels";
import {formatChange, formatValue} from "@/lib/landing/data";
import {shortName, sortKeys, stateBySlug, tableView, type LandingModel, type LandingRow, type LandingScope, type Ranking} from "@/lib/landing/model";
import {landingJsonLd} from "@/lib/seo/jsonld";
import {searchPath} from "@/lib/seo/site";
import {LANDING_MAP_VERSION} from "@/lib/landing/map-version";
import {LevelMap} from "./LevelMap";
import {LevelTreemap} from "./LevelTreemap";
import {RowFilter} from "./RowFilter";
import {StateSelect} from "./StateSelect";
import {landingHeading, landingLede} from "./text";
import "./landing.css";

const commas = new Intl.NumberFormat("en-US");
const tenths = new Intl.NumberFormat("en-US", {minimumFractionDigits: 1, maximumFractionDigits: 1});

export interface LandingQuery {sort?: string; dir?: string; page?: string}

interface LandingPageProps {
  family: LandingFamily;
  level: LandingLevel;
  scope?: LandingScope;
  model: LandingModel;
  query: LandingQuery;
}

const reportPath = (family: LandingFamily, row: {slug: string; id: string}) => `/profile/${family.profile}/${row.slug || row.id}`;

/**
 * The trail above the heading: Data USA › Locations › Counties › Massachusetts. The level a family
 * opens on is the family's page, and has no step of its own (Universities › Massachusetts).
 */
export function Crumbs({family, level, scope}: {family: LandingFamily; level?: LandingLevel; scope?: LandingScope}) {
  const home = level?.slug === family.home;
  return (
    <nav className="landing-crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Data USA</Link></li>
        <li><Link href="/reports">Reports</Link></li>
        <li>{level && !(home && !scope) ? <Link href={landingPath(family)}>{family.label}</Link> : <span aria-current="page">{family.label}</span>}</li>
        {level && !home && <li>{scope ? <Link href={landingPath(family, level)}>{level.plural}</Link> : <span aria-current="page">{level.plural}</span>}</li>}
        {scope && <li><span aria-current="page">{scope.state.name}</span></li>}
      </ol>
    </nav>
  );
}

/** The levels of the family, as tabs; inside a state they stay in that state where the level has state pages. */
function LevelTabs({family, level, scope}: {family: LandingFamily; level: LandingLevel; scope?: LandingScope}) {
  return (
    <nav className="landing-tabs" aria-label={`${family.label} by level`}>
      {family.levels.map(l => (
        <Link key={l.slug} href={landingPath(family, l, l.byState ? scope?.state.slug : undefined)} className={l === level ? "active" : ""} aria-current={l === level ? "page" : undefined}>
          {l.plural}
        </Link>
      ))}
    </nav>
  );
}

function Stat({value, label}: {value: string; label: string}) {
  return (
    <div className={`landing-stat ${/[a-z]{2}/i.test(value) ? "named" : ""}`}>
      <span className="landing-stat-value">{value}</span>
      <span className="landing-stat-label">{label}</span>
    </div>
  );
}

/** Headline figures of the level: how many members, what they add up to, and the extremes. */
function Stats({level, model, scope}: {level: LandingLevel; model: LandingModel; scope?: LandingScope}) {
  const {primary, rows, years} = model;
  const name = (row: LandingRow) => scope ? shortName(row.name) : row.name;
  const stats: {value: string; label: string}[] = [{value: commas.format(rows.length), label: level.plural}];
  if (model.total !== null) stats.push({value: formatValue(primary.format, model.total, true), label: `${years[primary.key] ?? ""} ${primary.label}`.trim()});
  const first = model.rankings.find(r => r.key === primary.key)?.rows[0];
  if (first && rows.length > 1) stats.push({value: name(first.row), label: `${primary.ascending ? "Lowest" : primary.additive ? "Largest" : "Highest"}: ${formatValue(primary.format, first.value, true)}`});
  const second = model.measures[1];
  const lead = second ? model.rankings.find(r => r.key === second.key) : undefined;
  const best = lead && !lead.tied ? lead.rows[0] : undefined;
  if (second && best && rows.length > 1) stats.push({value: name(best.row), label: `${second.ascending ? "Lowest" : "Highest"} ${second.label}: ${formatValue(second.format, best.value, true)}`});
  return <div className="landing-stats">{stats.map(s => <Stat key={s.label} {...s} />)}</div>;
}

/** A top-ten list with bars: the figures are in the page's HTML, the bars are plain elements. */
function RankingList({ranking, family, scope}: {ranking: Ranking; family: LandingFamily; scope?: LandingScope}) {
  const max = Math.max(...ranking.rows.map(r => Math.abs(r.value)));
  return (
    <section className="landing-ranking">
      <h3>{ranking.title}</h3>
      <p className="landing-caption">{ranking.caption}</p>
      <ol>
        {ranking.rows.map(({row, value}) => (
          <li key={row.id}>
            <Link href={reportPath(family, row)}>{scope ? shortName(row.name) : row.name}</Link>
            <span className="landing-ranking-value">{ranking.format === "change" ? formatChange(value) : formatValue(ranking.format, value)}</span>
            <span className="landing-bar" aria-hidden="true"><span style={{width: `${max > 0 ? Math.max(2, Math.abs(value) / max * 100) : 0}%`}} /></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** How the members and their total spread over size classes: most counties are small, most people live in the large ones. */
function Distribution({level, model}: {level: LandingLevel; model: LandingModel}) {
  const {sizes, primary} = model;
  const members = sizes.reduce((sum, s) => sum + s.members, 0);
  const total = sizes.reduce((sum, s) => sum + s.total, 0);
  if (!members || !total) return null;
  const maxShare = Math.max(...sizes.flatMap(s => [s.members / members, s.total / total]));
  const pct = (share: number) => `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`;
  return (
    <section className="landing-section" id="sizes">
      <h2>{level.plural} by Size</h2>
      <p className="landing-caption">Share of {pluralInSentence(level)} and share of their combined {primary.phrase} in each size class{model.years[primary.key] ? `, ${model.years[primary.key]}` : ""}.</p>
      <table className="landing-sizes">
        <thead>
          <tr><th scope="col">{primary.label}</th><th scope="col">{level.plural}</th><th scope="col" className="bars">Share of {pluralInSentence(level)}</th><th scope="col" className="bars">Share of {primary.phrase}</th></tr>
        </thead>
        <tbody>
          {sizes.map(s => (
            <tr key={s.label}>
              <th scope="row">{s.label}</th>
              <td>{commas.format(s.members)}</td>
              <td className="bars"><span className="landing-bar members" aria-hidden="true"><span style={{width: `${s.members / members / maxShare * 100}%`}} /></span>{pct(s.members / members)}</td>
              <td className="bars"><span className="landing-bar" aria-hidden="true"><span style={{width: `${s.total / total / maxShare * 100}%`}} /></span>{pct(s.total / total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Links to the level's page for each state, with how many members the state has. */
function ByState({family, level, scope, counts}: {family: LandingFamily; level: LandingLevel; scope?: LandingScope; counts: Map<string, number>}) {
  const states = [...stateBySlug().values()].filter(s => counts.get(s.fips)).sort((a, b) => a.name.localeCompare(b.name));
  if (states.length < 2) return null;
  return (
    <section className="landing-section" id="states">
      <h2>{level.plural} by State</h2>
      <ul className="landing-states">
        {states.map(s => (
          <li key={s.id}>
            <Link href={landingPath(family, level, s.slug)} aria-current={scope?.state.id === s.id ? "page" : undefined}>{s.name}</Link>
            <span>{commas.format(counts.get(s.fips) ?? 0)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function cell(model: LandingModel, row: LandingRow, key: string): string {
  if (key === "change") return formatChange(row.change);
  if (key === "density") return row.density === undefined ? "–" : tenths.format(row.density);
  if (key === "area") return row.landSqMi === undefined ? "–" : tenths.format(row.landSqMi);
  const measure = model.measures.find(m => m.key === key) as LandingMeasure;
  return formatValue(measure.format, row.values[key]);
}

function columnTitle(model: LandingModel, key: string): string {
  if (key === "change") return `${model.changeFrom}–${model.years[model.primary.key]} Change`;
  if (key === "density") return "People per Sq. Mile";
  if (key === "area") return "Land (Sq. Miles)";
  return model.measures.find(m => m.key === key)?.short ?? key;
}

/**
 * Every member of the level with its figures, a hundred to a page. Sorting and paging are links
 * (`?sort=income&dir=asc&page=2`), so the table works without JavaScript and every page of it can
 * be crawled; the page's canonical address stays the unsorted one.
 */
function MemberTable({family, level, scope, model, query, path}: LandingPageProps & {path: string}) {
  const view = tableView(model, query);
  // universities: the city or town of each one's address, after its name
  const places = level.hierarchy === "University" ? universityLocations() : undefined;
  const columns = sortKeys(model).filter(k => k !== "name");
  const href = (sort: string, ascending: boolean | undefined, page = 1) => {
    const params = new URLSearchParams();
    if (sort !== model.primary.key) params.set("sort", sort);
    if (ascending !== undefined) params.set("dir", ascending ? "asc" : "desc");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `${path}${qs ? `?${qs}` : ""}#table`;
  };
  // a click on the sorted column turns it round; on another column, sorts by it in its usual order
  const header = (key: string, title: string) => {
    const active = view.sort === key;
    return (
      <th key={key} scope="col" className={key === "name" ? "name" : "num"} aria-sort={active ? view.ascending ? "ascending" : "descending" : undefined}>
        <Link href={href(key, active ? !view.ascending : undefined)} scroll={false} rel="nofollow">{title}{active ? <span aria-hidden="true">{view.ascending ? " ▲" : " ▼"}</span> : null}</Link>
      </th>
    );
  };
  const dir = query.dir === "asc" || query.dir === "desc" ? view.ascending : undefined;
  return (
    <section className="landing-section" id="table">
      <h2>All {scope ? `${level.plural} in ${scope.state.name}` : level.plural}</h2>
      <p className="landing-caption">
        {commas.format(model.rows.length)} {model.rows.length === 1 ? level.singular : pluralInSentence(level)}, {view.sort === "name" ? "in name order" : `ranked by ${columnTitle(model, view.sort).toLowerCase()}`}. Select a column to sort by it; select a name to open its report.
      </p>
      <div className="landing-table-scroll">
        <table className="landing-table">
          <thead>
            <tr>
              <th scope="col" className="rank">#</th>
              {header("name", level.plural)}
              {places && <th scope="col" className="place">City</th>}
              {columns.map(key => header(key, columnTitle(model, key)))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row, i) => (
              <tr key={row.id}>
                <td className="rank">{view.start + i}</td>
                <th scope="row" className="name">
                  <Link href={reportPath(family, row)}>{scope ? shortName(row.name) : row.name}</Link>
                  {row.note && <span className="note">{row.note}</span>}
                </th>
                {places && <td className="place">{places.get(row.id)?.place ?? "–"}</td>}
                {columns.map(key => <td key={key} className="num">{cell(model, row, key)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view.pages > 1 && (
        <nav className="landing-pages" aria-label="Pages of the table">
          {view.page > 1 ? <Link href={href(view.sort, dir, view.page - 1)} scroll={false} rel="prev">← Previous</Link> : <span />}
          <span>Page {view.page} of {commas.format(view.pages)}</span>
          {view.page < view.pages ? <Link href={href(view.sort, dir, view.page + 1)} scroll={false} rel="next">Next →</Link> : <span />}
        </nav>
      )}
    </section>
  );
}

/**
 * Every member of a classification level, grouped under the member one level up it belongs to and
 * ordered by the level's main figure, with a box that narrows the list as you type.
 */
function Directory({family, level, model}: {family: LandingFamily; level: LandingLevel; model: LandingModel}) {
  const {primary, measures} = model;
  const value = (row: LandingRow) => row.values[primary.key] ?? -1;
  const groups = new Map<string, {parent?: LandingRow["parent"]; rows: LandingRow[]; total: number}>();
  for (const row of model.rows) {
    const key = row.parent?.id ?? "";
    if (!groups.has(key)) groups.set(key, {parent: row.parent, rows: [], total: 0});
    const group = groups.get(key)!;
    group.rows.push(row);
    group.total += row.values[primary.key] ?? 0;
  }
  const ordered = [...groups.values()].sort((a, b) => Number(Boolean(b.parent)) - Number(Boolean(a.parent)) || b.total - a.total);
  const max = Math.max(1, ...model.rows.map(value));
  const parentLevel = family.levels.find(l => l.hierarchy === level.parent);
  return (
    <section className="landing-section" id="table">
      <h2>All {level.plural}</h2>
      <p className="landing-caption">
        {commas.format(model.rows.length)} {pluralInSentence(level)}{model.hasParents && parentLevel ? `, grouped by ${parentLevel.singular}` : ""}, ordered by {primary.phrase}{model.years[primary.key] ? ` (${model.years[primary.key]})` : ""}. Select a name to open its report.
      </p>
      {model.rows.length > 12 && <RowFilter target="landing-directory" placeholder={`Filter ${pluralInSentence(level)}`} />}
      <div id="landing-directory" className="landing-directory" style={{"--figures": measures.length} as React.CSSProperties}>
        {ordered.map(group => (
          <div key={group.parent?.id ?? "other"} className="landing-group" data-group="">
            {model.hasParents && (
              <h3>
                {group.parent ? <Link href={reportPath(family, group.parent)}>{group.parent.name}</Link> : "Other"}
                {primary.additive && group.total > 0 && <span>{formatValue(primary.format, group.total, true)}</span>}
              </h3>
            )}
            <ul>
              {group.rows.sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name)).map(row => (
                <li key={row.id} data-name={row.name.toLowerCase()}>
                  <Link href={reportPath(family, row)}>{row.name}</Link>
                  <span className="landing-bar" aria-hidden="true"><span style={{width: `${Math.max(0, value(row)) / max * 100}%`}} /></span>
                  {measures.map(m => <span key={m.key} className="num" title={m.label}>{formatValue(m.format, row.values[m.key])}</span>)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="landing-legend">Figures: {measures.map(m => `${m.label.toLowerCase()}${model.years[m.key] ? ` (${model.years[m.key]})` : ""}`).join(", ")}.</p>
    </section>
  );
}

/** Where the figures come from, and the other ways into the same members. */
function Footnotes({family, level, model}: {family: LandingFamily; level: LandingLevel; model: LandingModel}) {
  const sources = Array.from(new Set(model.measures.map(m => m.source)));
  return (
    <section className="landing-section landing-footnotes">
      <h2>About This Page</h2>
      <p>{level.blurb} Each {level.singular} links to a Data USA report with charts, maps and downloadable data.</p>
      {model.withData > 0 && (
        <p>
          Source{sources.length > 1 ? "s" : ""}: {sources.join("; ")}.{" "}
          {model.withData < model.rows.length && `Figures are available for ${commas.format(model.withData)} of the ${commas.format(model.rows.length)} ${pluralInSentence(level)}. `}
          {model.changeFrom !== null && model.primary.cube.endsWith("_5") && `Change compares the ${model.changeFrom} and ${model.years[model.primary.key]} five-year estimates, which do not share survey years. `}
        </p>
      )}
      <p className="landing-links">
        <Link href={searchPath(family.dimension, level.hierarchy)}>Search {pluralInSentence(level)}</Link>
        <Link href={`/about/classifications/${encodeURIComponent(family.dimension)}/${encodeURIComponent(level.hierarchy)}`}>Classification IDs</Link>
        <Link href="/about/datasets">Data sources</Link>
        <Link href="/about/api">API</Link>
      </p>
    </section>
  );
}

/** The page of one level of a report family, or of that level in one state. */
export function LandingPage(props: LandingPageProps) {
  const {family, level, scope, model} = props;
  const isGeo = family.dimension === "Geography";
  const isUniversity = level.hierarchy === "University";
  const path = landingPath(family, level, scope?.state.slug);
  const heading = landingHeading(family, level, scope);
  const lede = landingLede(family, level, model, scope);
  const counts = level.byState && isGeo ? stateCounts(level.hierarchy) : undefined;
  // universities are mapped by state nationally and by county inside a state
  const hasMap = isGeo ? Boolean(scope ? level.shapes ?? level.stateShapes : true) : isUniversity;
  const states = level.byState ? [...stateBySlug().values()].filter(s => !counts || counts.get(s.fips)).sort((a, b) => a.name.localeCompare(b.name)) : [];
  const mapSrc = `/api/landing/map?family=${family.slug}&level=${level.slug}${scope ? `&state=${scope.state.slug}` : ""}&v=${LANDING_MAP_VERSION}`;
  const tabular = isGeo || isUniversity;
  const treemap = !tabular && model.primary.additive
    ? model.rows.filter(r => r.values[model.primary.key] !== undefined).map(r => ({
      id: r.id, name: r.name, slug: r.slug, value: r.values[model.primary.key], text: formatValue(model.primary.format, r.values[model.primary.key]), ...(r.parent ? {group: r.parent.name} : {})
    }))
    : [];
  const otherLevels = scope ? family.levels.filter(l => l.byState && l !== level && !isPendingLevel(l.hierarchy)) : [];
  const top = model.rankings.find(r => r.key === model.primary.key)?.rows.map(r => r.row) ?? model.rows.slice(0, 10);

  return (
    <main className={`landing landing-${family.profile}`}>
      <JsonLd data={landingJsonLd({
        path,
        name: heading,
        description: lede,
        crumbs: level.slug === family.home
          ? [{name: "Reports", path: "/reports"}, ...(scope ? [{name: family.label, path: landingPath(family)}, {name: scope.state.name}] : [{name: family.label}])]
          : [{name: "Reports", path: "/reports"}, {name: family.label, path: landingPath(family)}, ...(scope ? [{name: level.plural, path: landingPath(family, level)}, {name: scope.state.name}] : [{name: level.plural}])],
        items: top.map(row => ({name: row.name, path: reportPath(family, row)}))
      })} />
      <header className="landing-hero">
        <div className="landing-inner">
          <Crumbs family={family} level={level} scope={scope} />
          <h1>{heading}</h1>
          <p className="landing-lede">{lede}</p>
          {level.explainer && (
            <aside className="landing-explainer" aria-labelledby="landing-explainer">
              <h2 id="landing-explainer">{level.explainer.question}</h2>
              {level.explainer.answer.map(text => <p key={text.slice(0, 24)}>{text}</p>)}
              <p className="landing-explainer-source"><a href={level.explainer.source.href} rel="noopener" target="_blank">{level.explainer.source.label}</a></p>
            </aside>
          )}
          <Stats level={level} model={model} scope={scope} />
          <div className="landing-controls">
            <div className="landing-search">
              <SearchBox placeholder={`Search ${family.label.toLowerCase()}`} dimension={family.dimension} />
            </div>
            {states.length > 1 && <StateSelect base={landingStateBase(family, level)} national={landingPath(family, level)} states={states.map(s => ({slug: s.slug, name: s.name}))} current={scope?.state.slug ?? ""} label={level.plural} />}
          </div>
          <LevelTabs family={family} level={level} scope={scope} />
        </div>
        {hasMap && (
          <div className="landing-inner landing-map-wrap">
            {isUniversity && (
              <div className="landing-map-head">
                {scope && <Link className="landing-back" href={landingPath(family, level)}><span aria-hidden="true">←</span> All States</Link>}
                <p className="landing-map-note">
                  {scope
                    ? `Each circle is a college or university, sized by enrollment. Select one to open its report; all are listed below the map.`
                    : "Select a state to zoom in and see its colleges and universities."}
                </p>
              </div>
            )}
            <LevelMap src={mapSrc} label={`Map of ${heading}`} />
          </div>
        )}
      </header>

      <div className="landing-body">
        {isUniversity && scope && <MemberTable {...props} path={path} />}

        {treemap.length > 2 && (
          <section className="landing-section" id="chart">
            <h2>{level.plural} by {model.primary.label}</h2>
            <p className="landing-caption">Each rectangle is one {level.singular}, sized by its {model.primary.phrase}{model.years[model.primary.key] ? ` in ${model.years[model.primary.key]}` : ""}{model.hasParents ? " and coloured by the group it belongs to" : ""}. Select one to open its report.</p>
            <LevelTreemap rows={treemap} profile={family.profile} measure={`${model.years[model.primary.key] ?? ""} ${model.primary.label}`.trim()} label={`Treemap of ${pluralInSentence(level)} by ${model.primary.phrase}`} />
          </section>
        )}

        {model.rankings.length > 0 && (
          <section className="landing-section" id="rankings">
            <h2>{scope ? `${level.plural} in ${scope.state.name}` : level.plural} at a Glance</h2>
            <div className="landing-rankings">
              {model.rankings.map(r => <RankingList key={r.key} ranking={r} family={family} scope={scope} />)}
            </div>
          </section>
        )}

        {model.sizes.length > 1 && <Distribution level={level} model={model} />}

        {isUniversity && scope ? null : tabular ? <MemberTable {...props} path={path} /> : <Directory family={family} level={level} model={model} />}

        {scope && (
          <section className="landing-section" id="more">
            <h2>More in {scope.state.name}</h2>
            <p className="landing-links">
              {isGeo && <Link href={`/profile/geo/${scope.state.slug}`}>{scope.state.name} report</Link>}
              {otherLevels.map(l => <Link key={l.slug} href={landingPath(family, l, scope.state.slug)}>{l.plural} in {scope.state.name}</Link>)}
              {LANDING_FAMILIES.filter(f => f !== family).flatMap(f => f.levels.filter(l => l.byState && !isPendingLevel(l.hierarchy)).map(l => (
                <Link key={`${f.slug}/${l.slug}`} href={landingPath(f, l, scope.state.slug)}>{l.plural} in {scope.state.name}</Link>
              )))}
            </p>
          </section>
        )}

        {counts && <ByState family={family} level={level} scope={scope} counts={counts} />}
        {isUniversity && <UniversityStates family={family} level={level} scope={scope} />}

        <Footnotes family={family} level={level} model={model} />
      </div>
    </main>
  );
}

/** Universities have no state in their id: the states, with how many universities each has, come from the enrollment figures. */
async function UniversityStates({family, level, scope}: {family: LandingFamily; level: LandingLevel; scope?: LandingScope}) {
  const figures = await getUniversityFigures();
  const states = [...stateBySlug().values()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section className="landing-section" id="states">
      <h2>{level.plural} by State</h2>
      <ul className="landing-states">
        {states.map(s => (
          <li key={s.id}>
            <Link href={landingPath(family, level, s.slug)} aria-current={scope?.state.id === s.id ? "page" : undefined}>{s.name}</Link>
            <span>{figures.states.get(s.id) ? commas.format(figures.states.get(s.id)!.universities) : ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What a landing page shows while its figures load: the shape of the page, with the family's name. */
export function LandingSkeleton({family}: {family?: LandingFamily}) {
  return (
    <main className={`landing ${family ? `landing-${family.profile}` : ""}`} aria-busy="true">
      <div className="landing-hero">
        <div className="landing-inner">
          <nav className="landing-crumbs" aria-label="Breadcrumb">
            <ol><li><Link href="/">Data USA</Link></li><li><Link href="/reports">Reports</Link></li>{family && <li><Link href={landingPath(family)}>{family.label}</Link></li>}</ol>
          </nav>
          <div className="landing-skeleton title" />
          <div className="landing-skeleton line" />
          <div className="landing-skeleton line short" />
          <div className="landing-stats">
            {[0, 1, 2, 3].map(i => <div key={i} className="landing-stat"><div className="landing-skeleton value" /><div className="landing-skeleton label" /></div>)}
          </div>
          <div className="landing-skeleton box" />
        </div>
        <div className="landing-inner landing-map-wrap"><div className="landing-skeleton map" /></div>
      </div>
      <div className="landing-body">
        <div className="landing-section">
          <div className="landing-skeleton heading" />
          <div className="landing-rankings">
            {[0, 1, 2].map(i => <div key={i}>{[0, 1, 2, 3, 4, 5].map(j => <div key={j} className="landing-skeleton row" />)}</div>)}
          </div>
        </div>
      </div>
      <p className="landing-visually-hidden" role="status">Loading…</p>
    </main>
  );
}

/** The hub of a report family: its levels, each with its largest members, and for locations the map of states. */
export function HubPage({family, levels}: {family: LandingFamily; levels: {level: LandingLevel; model: LandingModel}[]}) {
  const totals = memberTotalsByHierarchy()[family.dimension] ?? {};
  const total = family.levels.reduce((sum, l) => sum + (totals[l.hierarchy] ?? 0), 0);
  const path = landingPath(family);
  const lede = `Data USA has reports on ${family.about}: ${commas.format(total)} in all. Choose a level to compare its members, or search for one by name.`;
  return (
    <main className={`landing landing-${family.profile}`}>
      <JsonLd data={landingJsonLd({path, name: family.label, description: lede, crumbs: [{name: "Reports", path: "/reports"}, {name: family.label}], items: family.levels.map(l => ({name: l.plural, path: landingPath(family, l)}))})} />
      <header className="landing-hero">
        <div className="landing-inner">
          <Crumbs family={family} />
          <h1>{family.label}</h1>
          <p className="landing-lede">{lede}</p>
          <div className="landing-search">
            <SearchBox placeholder={`Search ${family.label.toLowerCase()}`} dimension={family.dimension} />
          </div>
          <nav className="landing-tabs" aria-label="Report families">
            {LANDING_FAMILIES.map(f => <Link key={f.slug} href={landingPath(f)} className={f === family ? "active" : ""} aria-current={f === family ? "page" : undefined}>{f.label}</Link>)}
          </nav>
        </div>
        {family.dimension === "Geography" && (
          <div className="landing-inner landing-map-wrap">
            <LevelMap src={`/api/landing/map?family=${family.slug}&level=states&v=${LANDING_MAP_VERSION}`} label="Map of the states" />
          </div>
        )}
      </header>
      <div className="landing-body">
        <section className="landing-section">
          <h2>Browse {family.label} by Level</h2>
          <div className="landing-cards">
            {levels.map(({level, model}) => {
              const top = model.rankings.find(r => r.key === model.primary.key);
              const rows = top?.rows.slice(0, 5) ?? model.rows.slice(0, 5).map(row => ({row, value: undefined}));
              return (
                <article key={level.slug} className="landing-card">
                  <h3><Link href={landingPath(family, level)}>{level.plural}</Link><span>{commas.format(model.rows.length)}</span></h3>
                  <p>{level.blurb}</p>
                  <ol>
                    {rows.map(({row, value}) => (
                      <li key={row.id}>
                        <Link href={reportPath(family, row)}>{row.name}</Link>
                        {value !== undefined && <span>{formatValue(model.primary.format, value, true)}</span>}
                      </li>
                    ))}
                  </ol>
                  {top && <p className="landing-caption">{top.title.toLowerCase().replace(/^./, c => c.toUpperCase())}, {top.caption.replace(/ .*/, "")}</p>}
                  <Link className="arrow-link" href={landingPath(family, level)}>All {level.plural}</Link>
                </article>
              );
            })}
          </div>
        </section>
        <section className="landing-section landing-footnotes">
          <h2>More Ways In</h2>
          <p className="landing-links">
            <Link href={searchPath(family.dimension)}>Search {family.label.toLowerCase()}</Link>
            {LANDING_FAMILIES.filter(f => f !== family).map(f => <Link key={f.slug} href={landingPath(f)}>{f.label}</Link>)}
            <Link href="/about/datasets">Data sources</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
