import type {Metadata} from "next";
import Link from "next/link";
import {Suspense} from "react";
import {SearchBox} from "@/components/search/SearchBox";
import {InlineSvg} from "@/components/ui/InlineSvg";
import {Column} from "@/components/home/Column";
import {CategoryBars} from "@/components/latest/CategoryBars";
import {StateUnemploymentMap} from "@/components/latest/StateUnemploymentMap";
import {TrendChart} from "@/components/latest/TrendChart";
import {PRISM_TOPICS} from "@/content/home/prism-topics";
import {getHomeColumns} from "@/lib/home/tiles";
import {getNationalFigures, getStateFigures, getUpcomingReleases} from "@/lib/latest/data";
import type {NationalFigures} from "@/lib/latest/data";
import type {Indicator} from "@/lib/latest/indicators";
import {dateLabel} from "@/lib/latest/series";
import {SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE} from "@/lib/seo/site";
import "../home.css";
import "./latest.css";

/**
 * Draft of a new home page that leads with the latest national figures (inflation, gas prices,
 * jobs, pay and unemployment by state), each with a sentence computed from the data that puts it
 * in context. The current home page at `/` is unchanged; this one is not indexed until it replaces it.
 */
export const metadata: Metadata = {
  title: {absolute: `${SITE_NAME}: The Latest U.S. Economic Data, Explained`},
  description: SITE_DESCRIPTION,
  alternates: {canonical: "/"},
  robots: {index: false, follow: true}
};

const commas = new Intl.NumberFormat("en-US");
const clock = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", hour: "numeric", minute: "2-digit"});

/** "14 October" (or "14 October 2026" when `withYear`). */
const day = (date: string, withYear = false) => dateLabel(date, withYear);

function checked(iso: string): string {
  return `${clock.format(new Date(iso)).replace("AM", "a.m.").replace("PM", "p.m.")} ET on ${day(iso.slice(0, 10))}`;
}

function Released({indicator}: {indicator: Indicator}) {
  return (
    <p className="ln-meta">
      <span>{indicator.period}</span>
      {indicator.released && <span>Released {day(indicator.released)}</span>}
    </p>
  );
}

function Source({indicator}: {indicator: Indicator}) {
  return <p className="ln-source">Source: <a href={indicator.source.url} target="_blank" rel="noopener noreferrer">{indicator.source.name}</a></p>;
}

async function ReportCounts() {
  const columns = await getHomeColumns();
  return (
    <div className="report-counts">
      {columns.map(column => (
        <Link href={column.url} className={`report-count ${column.slug}`} key={column.slug}>
          <span className="report-count-icon"><InlineSvg src={column.icon} height={25} /></span>
          <span>
            <span className="report-count-total">{commas.format(column.total)}</span>
            <span className="report-count-title">{column.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** The header panel: every headline figure at a glance, linked to its explanation below. */
async function LatestPanel({national}: {national: Promise<NationalFigures | null>}) {
  const figures = await national;
  if (!figures?.indicators.length) return null;
  const newest = figures.indicators.filter(i => i.released).sort((a, b) => (b.released as string).localeCompare(a.released as string))[0];
  return (
    <div className="ln-panel" aria-labelledby="ln-panel-title">
      <div className="ln-panel-head">
        <h2 id="ln-panel-title"><span className="ln-pulse" aria-hidden="true" />The latest numbers</h2>
        {newest?.released && <span>Last release {day(newest.released)}</span>}
      </div>
      <ul className="ln-ticker">
        {figures.indicators.map(indicator => (
          <li key={indicator.key}>
            <a href={`#${indicator.key}`}>
              <span className="ln-ticker-label">{indicator.label}<small>{indicator.period}</small></span>
              <span className="ln-ticker-spark"><TrendChart points={indicator.spark.points} unit={indicator.spark.unit} zero={indicator.spark.zero} bars={indicator.key === "jobs"} label={`${indicator.label}, recent trend`} width={120} height={34} /></span>
              <span className="ln-ticker-value">{indicator.value}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="ln-panel-foot">Checked for new releases at {checked(figures.checkedAt)}</p>
    </div>
  );
}

/** Inflation, the lead story: the trend, the explanation and what is driving it. */
async function LeadStory({national}: {national: Promise<NationalFigures | null>}) {
  const figures = await national;
  const cpi = figures?.indicators.find(i => i.key === "cpi");
  if (!figures || !cpi) return null;
  return (
    <section className="light ln-section ln-lead" id="cpi" aria-labelledby="ln-lead-title">
      <div className="ln-wrap ln-lead-grid">
        <div className="ln-lead-main">
          <p className="ln-eyebrow">{cpi.label}</p>
          <h2 id="ln-lead-title">{cpi.headline}</h2>
          <Released indicator={cpi} />
          <div className="ln-figure">
            <span className="ln-big">{cpi.value}</span>
            <span className="ln-measure">{cpi.measure}</span>
          </div>
          {cpi.blurb.map(text => <p key={text} className="ln-blurb">{text}</p>)}
          <figure className="ln-chart">
            <TrendChart points={cpi.spark.points} unit={cpi.spark.unit} zero axis label={`${cpi.measure}, monthly, last three years`} width={560} height={200} />
            <figcaption>{cpi.measure}, each month for the last three years. A break in the line marks October 2025, which was never collected.</figcaption>
          </figure>
          <Source indicator={cpi} />
        </div>
        {figures.categories.length > 0 && (
          <div className="ln-lead-side">
            <h3>Change over the year, by category</h3>
            <p className="ln-meta"><span>{figures.cpiPeriod}</span></p>
            <CategoryBars categories={figures.categories} />
          </div>
        )}
      </div>
    </section>
  );
}

/** The other headline figures, one card each. */
async function MoreFigures({national}: {national: Promise<NationalFigures | null>}) {
  const figures = await national;
  const rest = figures?.indicators.filter(i => i.key !== "cpi") ?? [];
  if (!rest.length) return null;
  return (
    <section className="light ln-section ln-cards-section" aria-label="More of the latest figures">
      <div className="ln-wrap ln-cards">
        {rest.map(indicator => (
          <article className="ln-card" id={indicator.key} key={indicator.key}>
            <p className="ln-eyebrow">{indicator.label}</p>
            <h3>{indicator.headline}</h3>
            <Released indicator={indicator} />
            <div className="ln-figure">
              <span className="ln-big">{indicator.value}</span>
              <span className="ln-measure">{indicator.measure}</span>
            </div>
            <TrendChart points={indicator.spark.points} unit={indicator.spark.unit} zero={indicator.spark.zero} bars={indicator.key === "jobs"} axis label={`${indicator.measure}, last three years`} width={250} height={110} />
            {indicator.blurb.map(text => <p key={text} className="ln-blurb">{text}</p>)}
            <Source indicator={indicator} />
          </article>
        ))}
      </div>
    </section>
  );
}

/** Unemployment by state on a map, a month behind the national figure. */
async function StateSection() {
  const states = await getStateFigures();
  if (!states?.rows.length) return null;
  const sorted = [...states.rows].filter(r => r.id !== "04000US72").sort((a, b) => b.rate - a.rate);
  const list = (rows: typeof sorted) => (
    <ol>
      {rows.map(r => <li key={r.id}><Link href={`/profile/geo/${r.slug}`}>{r.name}</Link><span>{r.rate.toFixed(1)}%</span></li>)}
    </ol>
  );
  return (
    <section className="ln-section ln-states" id="states" aria-labelledby="ln-states-title">
      <div className="ln-wrap ln-states-grid">
        <div className="ln-states-text">
          <p className="ln-eyebrow">Unemployment by state</p>
          <h2 id="ln-states-title">Where joblessness is highest</h2>
          <p className="ln-meta"><span>{dateLabel(states.period)}</span><span>Seasonally adjusted</span></p>
          {states.blurb.map(text => <p key={text} className="ln-blurb">{text}</p>)}
          <div className="ln-rank">
            <div><h3>Highest</h3>{list(sorted.slice(0, 5))}</div>
            <div><h3>Lowest</h3>{list(sorted.slice(-5).reverse())}</div>
          </div>
          <p className="ln-source">Source: <a href="https://www.bls.gov/lau/" target="_blank" rel="noopener noreferrer">Bureau of Labor Statistics, Local Area Unemployment Statistics</a>. Click a state for its report.</p>
        </div>
        <StateUnemploymentMap rows={states.rows} period={dateLabel(states.period)} />
      </div>
    </section>
  );
}

/** What is released next, so a visitor knows when to come back. */
async function Calendar({national}: {national: Promise<NationalFigures | null>}) {
  const figures = await national;
  const upcoming = await getUpcomingReleases(figures?.fuelNext);
  if (!upcoming.length) return null;
  return (
    <section className="light ln-section ln-calendar" aria-labelledby="ln-calendar-title">
      <div className="ln-wrap">
        <h2 id="ln-calendar-title">Coming up</h2>
        <ol className="ln-releases">
          {upcoming.map(r => (
            <li key={`${r.name}-${r.date}`}>
              <time dateTime={r.date}><span>{day(r.date).split(" ")[1].slice(0, 3)}</span><b>{day(r.date).split(" ")[0]}</b></time>
              <span className="ln-release-text"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a><small>{r.covers}</small></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

async function ReportColumns() {
  const columns = await getHomeColumns();
  return <div className="report-columns">{columns.map(column => <Column key={column.slug} data={column} />)}</div>;
}

export default function LatestHomePage() {
  // One call for every section: separate calls made at once would each fetch the same sources, and
  // a cached function may not wait on a request another call started.
  const national = getNationalFigures();
  return (
    <main className="home latest-home">
      <header className="home-header">
        <div className="home-bg" />
        <div className="home-header-content">
          <div className="home-left">
            <img className="logo" src="/images/home/logo-shadow.png" alt="Data USA" width={400} height={125} />
            <h1 className="tagline">{SITE_TAGLINE}</h1>
            <SearchBox className="home-search mobile" placeholder="Search reports" buttonLabel="Search" />
            <Suspense fallback={<div className="report-counts" />}>
              <ReportCounts />
            </Suspense>
          </div>
          <div className="home-right">
            <SearchBox className="home-search" placeholder="Search reports" buttonLabel="Search" />
            <Suspense fallback={<div className="ln-panel ln-panel-loading" />}>
              <LatestPanel national={national} />
            </Suspense>
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        <LeadStory national={national} />
      </Suspense>
      <Suspense fallback={null}>
        <MoreFigures national={national} />
      </Suspense>
      <Suspense fallback={null}>
        <StateSection />
      </Suspense>
      <Suspense fallback={null}>
        <Calendar national={national} />
      </Suspense>

      {/* PeoplePrism promo, as on the current home page */}
      <section id="prism" className="prism-promo light">
        <div className="home-flex">
          <div className="prism-container">
            <p>
              <strong>New data is now available through Deloitte’s PeoplePrism™</strong>. This product brings together population insights that can support research, planning, and analysis across agencies and organizations. Drawing on predictive and geospatial analysis, it helps examine the environmental and social factors associated with health and quality of life in communities. Explore the new data below, available across all 50 states.
            </p>
            <div className="prism-topics">
              {PRISM_TOPICS.map(topic => (
                <div className="prism-topic" key={topic.title}>
                  <p className="prism-topic-title" style={{color: topic.color}}>{topic.title}</p>
                  {topic.links.length > 0
                    ? <div className="prism-topic-links">
                      {topic.links.map(link => <Link key={link.href} className={`arrow-link prism-topic-link ${link.more ? "prism-topic-link-more" : ""}`} href={link.href}>{link.label}</Link>)}
                    </div>
                    : <div className="prism-coming-soon"><p className="prism-coming-soon-text">Coming Soon!</p></div>}
                </div>
              ))}
            </div>
            <div className="prism-footer-promo">
              <img className="prism-notice-logo" src="/images/footer/deloitte_dark.png" alt="Deloitte." />
              <p>Look for the Deloitte logo to spot new additions from PeoplePrism.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="report-grid">
        <h2>Recent popular reports</h2>
        <Suspense fallback={<div className="report-columns" />}>
          <ReportColumns />
        </Suspense>
        <Link href="/search" className="arrow-link light">Search All Reports</Link>
      </section>
    </main>
  );
}
