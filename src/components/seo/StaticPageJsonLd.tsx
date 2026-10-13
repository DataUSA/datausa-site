import {pageJsonLd} from "@/lib/seo/jsonld";
import {STATIC_PAGES, type StaticPage, type StaticPageKey} from "@/lib/seo/metadata";
import {JsonLd} from "./JsonLd";

/** First page of each section of the navigation. */
const SECTIONS: Record<string, string> = {About: "/about/background", Data: "/about/datasets"};

/** Structured data of a fixed page: the page and its breadcrumb trail (home, section, page). */
export function StaticPageJsonLd({page, type}: {page: StaticPageKey; type?: string}) {
  const {path, title, description, eyebrow, headline}: StaticPage = STATIC_PAGES[page];
  const sectionPath = SECTIONS[eyebrow];
  const section = sectionPath && sectionPath !== path ? [{name: eyebrow, path: sectionPath}] : [];
  return <JsonLd data={pageJsonLd({path, name: title, description, type, crumbs: [...section, {name: headline}]})} />;
}
