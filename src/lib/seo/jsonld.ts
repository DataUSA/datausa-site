/**
 * schema.org descriptions of the site's pages. Everything stated here is also visible on the page
 * it describes: names, the breadcrumb trail and what the page is about.
 */
import type {MemberRow} from "@/lib/dimensions/db";
import {familyBySlug, searchPath, SITE_DESCRIPTION, SITE_NAME, SITE_URL} from "./site";

type Json = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const graph = (...nodes: (Json | undefined)[]): Json => ({"@context": "https://schema.org", "@graph": nodes.filter(Boolean)});

export interface Crumb {
  name: string;
  /** Site path; the last crumb (the page itself) needs none. */
  path?: string;
}

function breadcrumbList(pageUrl: string, crumbs: Crumb[]): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [{name: SITE_NAME, path: "/"}, ...crumbs].map((crumb, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": crumb.name,
      ...(crumb.path ? {item: `${SITE_URL}${crumb.path}`} : {})
    }))
  };
}

function webPage(pageUrl: string, name: string, description: string | undefined, extra: Json = {}): Json {
  return {
    "@type": "WebPage",
    "@id": pageUrl,
    "url": pageUrl,
    name,
    ...(description ? {description} : {}),
    "inLanguage": "en-US",
    "isPartOf": {"@id": WEBSITE_ID},
    "breadcrumb": {"@id": `${pageUrl}#breadcrumb`},
    ...extra
  };
}

/** Home page: the site and who publishes it, with the search page as the site's search action. */
export function siteJsonLd(): Json {
  return graph(
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      "name": SITE_NAME,
      "url": `${SITE_URL}/`,
      "description": "Data USA is a free platform for exploring U.S. public data, built by Deloitte and Datawheel.",
      "sameAs": ["https://github.com/DataUSA"]
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      "url": `${SITE_URL}/`,
      "name": SITE_NAME,
      "alternateName": "DataUSA",
      "description": SITE_DESCRIPTION,
      "inLanguage": "en-US",
      "publisher": {"@id": ORGANIZATION_ID},
      "potentialAction": {
        "@type": "SearchAction",
        "target": {"@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}`},
        "query-input": "required name=search_term_string"
      }
    }
  );
}

/** A static page under a section ("About" → "Glossary"). */
export function pageJsonLd({path, name, description, crumbs, type = "WebPage"}: {path: string; name: string; description?: string; crumbs: Crumb[]; type?: string}): Json {
  const url = `${SITE_URL}${path}`;
  return graph({...webPage(url, name, description), "@type": type}, breadcrumbList(url, crumbs));
}

const GEO_TYPES: Record<string, string> = {"Nation": "Country", "State": "State", "Place": "City", "School District": "SchoolDistrict"};

/** What a report is about, as the closest schema.org type for its family. */
function reportSubject(member: MemberRow, name: string, state: MemberRow | undefined, website: string | undefined): Json {
  if (member.dimension === "Geography") {
    return {
      "@type": GEO_TYPES[member.hierarchy] ?? "AdministrativeArea",
      name,
      ...(state ? {containedInPlace: {"@type": "State", "name": state.name, "url": `${SITE_URL}/profile/geo/${state.slug}`}} : {})
    };
  }
  if (member.dimension === "University" && member.hierarchy === "University") {
    return {"@type": "CollegeOrUniversity", name, ...(website ? {url: website} : {})};
  }
  if (member.dimension === "PUMS Occupation") {
    // six-digit members are SOC detailed occupations ("29-1141")
    return {"@type": "Occupation", name, ...(/^\d{6}$/.test(member.id) ? {occupationalCategory: `${member.id.slice(0, 2)}-${member.id.slice(2)}`} : {})};
  }
  const sets: Record<string, string> = {
    "CIP": "Classification of Instructional Programs (CIP)",
    "NAPCS": "North American Product Classification System (NAPCS)",
    "PUMS Industry": "Census industry classification (NAICS-based)",
    "University": "Carnegie Classification of Institutions of Higher Education"
  };
  return {"@type": "DefinedTerm", name, ...(sets[member.dimension] ? {inDefinedTermSet: sets[member.dimension]} : {})};
}

export interface ReportJsonLdInput {
  profileSlug: string;
  member: MemberRow;
  name: string;
  title: string;
  description: string;
  image: string;
  /** The state a location lies in, when it is not itself a state or the nation. */
  state?: MemberRow;
  /** A university's own website. */
  website?: string;
}

/** A report page: the page, its breadcrumb trail (home, family, state, report) and its subject. */
export function reportJsonLd({profileSlug, member, name, title, description, image, state, website}: ReportJsonLdInput): Json {
  const url = `${SITE_URL}/profile/${profileSlug}/${member.slug}`;
  const family = familyBySlug(profileSlug);
  const crumbs: Crumb[] = [
    ...(family ? [{name: family.label, path: searchPath(family.dimension)}] : []),
    ...(state ? [{name: state.name, path: `/profile/geo/${state.slug}`}] : []),
    {name}
  ];
  return graph(
    webPage(url, title, description, {
      "about": reportSubject(member, name, state, website),
      "primaryImageOfPage": {"@type": "ImageObject", "url": image, "width": 1200, "height": 630},
      "publisher": {"@id": ORGANIZATION_ID}
    }),
    breadcrumbList(url, crumbs)
  );
}
