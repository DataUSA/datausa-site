/**
 * Builders for the Next.js `Metadata` of each page type. A page's `openGraph` replaces the root
 * layout's rather than merging with it, so every page states the complete set (site name, locale,
 * URL, image) through `social()`.
 */
import type {Metadata} from "next";
import {OG_SIZE} from "@/lib/og/theme";
import {SITE_NAME} from "./site";

export interface SocialInput {
  /** Title of the card: the page's subject without the site name (`og:site_name` carries that). */
  title: string;
  description?: string;
  /** Canonical path of the page (omitted by the site-wide default). */
  path?: string;
  /** Path of the 1200 × 630 share image. */
  image: string;
  imageAlt: string;
  type?: "website" | "article";
}

/** Open Graph and Twitter card tags for one page. */
export function social({title, description, path, image, imageAlt, type = "website"}: SocialInput): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [{url: image, ...OG_SIZE, alt: imageAlt}];
  return {
    openGraph: {title, description, url: path, siteName: SITE_NAME, locale: "en_US", type, images},
    twitter: {card: "summary_large_image", title, description, images: [{url: image, alt: imageAlt}]}
  };
}

export interface StaticPage {
  path: string;
  /** `<title>` (the layout appends the site name). */
  title: string;
  description: string;
  /** Share image: section label, headline and one line of context. */
  eyebrow: string;
  headline: string;
  text: string;
}

/** The site's fixed pages: one definition feeds the head tags, the share image and the sitemap. */
export const STATIC_PAGES = {
  search: {
    path: "/search",
    title: "Search Reports: U.S. Places, Industries, Jobs & Degrees",
    description: "Search every Data USA report: states, counties, cities and metro areas, industries, occupations, degrees, universities and products. Rank locations by population and browse them on a map.",
    eyebrow: "Search",
    headline: "Search every report",
    text: "Locations, industries, occupations, degrees, universities and products."
  },
  background: {
    path: "/about/background",
    title: "About Data USA: Background & Team",
    description: "Data USA was created in 2014 by Deloitte, Datawheel and Cesar Hidalgo to make U.S. government data on jobs, skills, education and places easy to explore. Learn about the project and its visualizations.",
    eyebrow: "About",
    headline: "Background",
    text: "How Deloitte, Datawheel and Cesar Hidalgo built an open platform for U.S. public data."
  },
  press: {
    path: "/about/press",
    title: "Data USA in the Press",
    description: "News coverage of Data USA, the free platform for exploring and visualizing U.S. public data, from national and industry publications.",
    eyebrow: "About",
    headline: "In the Press",
    text: "News coverage of Data USA."
  },
  glossary: {
    path: "/about/glossary",
    title: "Glossary: Data USA Measures, Classifications & Methods",
    description: "Definitions of the calculations and classifications used on Data USA: GINI, margin of error, RCA, average net price, census places, MSAs, PUMAs, CIP, NAICS and SOC codes.",
    eyebrow: "About",
    headline: "Glossary",
    text: "The calculations and classifications behind every report, defined."
  },
  usage: {
    path: "/about/usage",
    title: "Terms of Use & License",
    description: "How Data USA content may be used: license, content usage and attribution, and disclaimers for the public datasets shown on the site.",
    eyebrow: "About",
    headline: "Terms of Use",
    text: "License, content usage and disclaimers."
  },
  datasets: {
    path: "/about/datasets",
    title: "Data Sources: The Public Datasets Behind Data USA",
    description: "Every dataset used on Data USA, with its publisher, what it measures, where it is used on the site, known caveats and links to the original source.",
    eyebrow: "Data",
    headline: "Data Sources",
    text: "Every public dataset behind the reports: publisher, coverage, caveats and source links."
  },
  api: {
    path: "/about/api",
    title: "Data USA API: Query U.S. Public Data as JSON",
    description: "Documentation for the free Data USA API: endpoints, cubes, drilldowns, measures, filters, pagination and response format, with example requests for population and other public data.",
    eyebrow: "Data",
    headline: "API",
    text: "Query the whole database with a URL and get JSON back."
  }
} satisfies Record<string, StaticPage>;

export type StaticPageKey = keyof typeof STATIC_PAGES;

/** Share image of a static page. */
export const pageImage = (key: string, params?: Record<string, string>): string => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `/og/page/${key}${query}`;
};

/** Complete head metadata of one of the fixed pages. */
export function staticMetadata(key: StaticPageKey): Metadata {
  const page: StaticPage = STATIC_PAGES[key];
  return {
    // a title that already names the site does not get the site name appended
    title: page.title.includes(SITE_NAME) ? {absolute: page.title} : page.title,
    description: page.description,
    alternates: {canonical: page.path},
    ...social({title: page.title, description: page.description, path: page.path, image: pageImage(key), imageAlt: `${page.headline} | ${SITE_NAME}`})
  };
}
