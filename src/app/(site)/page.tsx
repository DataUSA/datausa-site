import type {Metadata} from "next";
import Link from "next/link";
import {Suspense} from "react";
import {SearchBox} from "@/components/search/SearchBox";
import {InlineSvg} from "@/components/ui/InlineSvg";
import {Column} from "@/components/home/Column";
import {HomeGeomap} from "@/components/home/HomeGeomap";
import {PRISM_TOPICS} from "@/content/home/prism-topics";
import {getHomeColumns} from "@/lib/home/tiles";
import {getHomeGeomapData} from "@/lib/home/geomap";
import {JsonLd} from "@/components/seo/JsonLd";
import {siteJsonLd} from "@/lib/seo/jsonld";
import {pageImage, social} from "@/lib/seo/metadata";
import {SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE} from "@/lib/seo/site";
import "./home.css";

const TITLE = `${SITE_NAME}: Explore, Map, Compare & Download U.S. Public Data`;

export const metadata: Metadata = {
  title: {absolute: TITLE},
  description: SITE_DESCRIPTION,
  alternates: {canonical: "/"},
  ...social({title: `${SITE_NAME}: ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, path: "/", image: pageImage("home"), imageAlt: `${SITE_NAME}: ${SITE_TAGLINE}`})
};

const commas = new Intl.NumberFormat("en-US");

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

async function StateMap() {
  const data = await getHomeGeomapData();
  return <HomeGeomap data={data} />;
}

async function ReportColumns() {
  const columns = await getHomeColumns();
  return <div className="report-columns">{columns.map(column => <Column key={column.slug} data={column} />)}</div>;
}

/** Home page (legacy `app/pages/Home/index.jsx`). */
export default function HomePage() {
  return (
    <main className="home">
      <JsonLd data={siteJsonLd()} />
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
            <Suspense fallback={<div className="viz" />}>
              <StateMap />
            </Suspense>
          </div>
        </div>
        <div className="company-logos">
          <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html"><img id="deloitte" src="/images/home/logos/deloitte.png" alt="Deloitte" /></a>
          <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/"><img id="datawheel" src="/images/home/logos/datawheel.png" alt="Datawheel" /></a>
        </div>
      </header>

      <section className="light">
        <div className="home-flex">
          <div className="home-text">
            <h2>Browse through more than 47,000 automated reports</h2>
            <p>
              Data USA puts public US Government data in your hands. Instead of searching through multiple data sources that are often incomplete and difficult to access, our platform provides an open, easy-to-use platform that turns data into knowledge.
            </p>
            <div className="feature-items">
              <div className="feature-item"><span className="feature-icon"><InlineSvg className="feature-data" src="/icons/features/data.svg" width={25} /></span><span>View aggregated data</span></div>
              <div className="feature-item"><span className="feature-icon"><InlineSvg src="/icons/features/cart.svg" width={25} /></span><span>Download data</span></div>
              <div className="feature-item"><span className="feature-icon"><InlineSvg src="/icons/features/compare.svg" width={25} /></span><span>Compare reports</span></div>
            </div>
            <Link href="/search" className="arrow-link">Search Reports</Link>
          </div>
          <div className="home-image home-mockup" role="img" aria-label="Data USA report mockups" style={{backgroundImage: "url(/images/home/home-mockup.png)"}} />
        </div>
      </section>

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
