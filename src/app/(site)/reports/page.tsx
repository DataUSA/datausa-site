import type {Metadata} from "next";
import Link from "next/link";
import {LANDING_FAMILIES, landingPath} from "@/content/landing/levels";
import {JsonLd} from "@/components/seo/JsonLd";
import {SearchBox} from "@/components/search/SearchBox";
import {InlineSvg} from "@/components/ui/InlineSvg";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {landingJsonLd} from "@/lib/seo/jsonld";
import {pageImage, social} from "@/lib/seo/metadata";
import {SITE_NAME} from "@/lib/seo/site";
import "@/components/landing/landing.css";

const commas = new Intl.NumberFormat("en-US");

const TITLE = "Reports: Browse U.S. Locations, Industries, Jobs, Degrees & Universities";
const DESCRIPTION = "Every Data USA report in one place. Search by name, or browse locations, industries, occupations, degrees, universities and products by level, from states and counties to detailed occupations.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {canonical: "/reports"},
  ...social({title: "Browse every Data USA report", description: DESCRIPTION, path: "/reports", image: pageImage("search"), imageAlt: `Reports | ${SITE_NAME}`})
};

/** What each family's reports answer, under its name. */
const PITCH: Record<string, string> = {
  locations: "Population, income, housing, health and the economy of every state, county, city and district.",
  industries: "Who works in each industry, what they earn and where the jobs are.",
  occupations: "Wages, workforce, education and demographics of every job.",
  degrees: "Graduates, institutions, tuition and careers by field of study.",
  universities: "Costs, admissions, enrollment and graduates of every college.",
  products: "What the federal government buys, and which agencies buy it."
};

/**
 * The front door to the reports: a search box over all of them and, per report family, its levels
 * with how many reports each has. The levels link to their landing pages.
 */
export default function ReportsPage() {
  const totals = memberTotalsByHierarchy();
  const count = (dimension: string, hierarchy: string) => totals[dimension]?.[hierarchy] ?? 0;
  const families = LANDING_FAMILIES.map(family => ({
    family,
    levels: family.levels.filter(l => count(family.dimension, l.hierarchy) > 0),
    total: Object.values(totals[family.dimension] ?? {}).reduce((a, b) => a + b, 0)
  }));
  const all = families.reduce((sum, f) => sum + f.total, 0);
  return (
    <main className="landing reports-index">
      <JsonLd data={landingJsonLd({path: "/reports", name: "Reports", description: DESCRIPTION, crumbs: [{name: "Reports"}], items: LANDING_FAMILIES.map(f => ({name: f.label, path: landingPath(f)}))})} />
      <header className="landing-hero reports-hero">
        <div className="landing-inner">
          <h1>Explore {commas.format(all)} reports on U.S. public data</h1>
          <p className="landing-lede">Search for a place, an industry, a job, a degree or a university, or browse by type below.</p>
          <div className="reports-search">
            <SearchBox placeholder="Search reports: try “Boston”, “nurses” or “computer science”…" label="Search reports" buttonLabel="Search" autoFocus />
          </div>
          <nav className="reports-jump" aria-label="Report types">
            {families.map(({family, total}) => (
              <a key={family.slug} href={`#${family.slug}`} className={`landing-${family.profile}`}>
                <InlineSvg src={`/icons/dimensions/${family.dimension}.svg`} height={18} />
                <span>{family.label}</span>
                <span className="count">{commas.format(total)}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="landing-body">
        <div className="reports-families">
          {families.map(({family, levels, total}) => (
            <section key={family.slug} id={family.slug} className={`reports-family landing-${family.profile}`}>
              <header>
                <span className="reports-icon"><InlineSvg src={`/icons/dimensions/${family.dimension}.svg`} height={24} /></span>
                <div>
                  <h2><Link href={landingPath(family)}>{family.label}</Link></h2>
                  <p className="reports-total">{commas.format(total)} reports</p>
                </div>
              </header>
              <p>{PITCH[family.slug]}</p>
              <ul>
                {levels.map(level => (
                  <li key={level.slug}>
                    <Link href={landingPath(family, level)}>{level.plural}</Link>
                    {isPendingLevel(level.hierarchy) && <span className="reports-new">New</span>}
                    <span>{commas.format(count(family.dimension, level.hierarchy))}</span>
                  </li>
                ))}
              </ul>
              <Link className="arrow-link" href={landingPath(family)}>Browse {family.label}</Link>
            </section>
          ))}
        </div>
        <section className="landing-section landing-footnotes">
          <h2>More Ways In</h2>
          <p className="landing-links">
            <Link href="/search">Advanced search with filters and maps</Link>
            <Link href="/about/classifications/Geography/State">Classification IDs</Link>
            <Link href="/about/datasets">Data sources</Link>
            <Link href="/about/api">API</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
