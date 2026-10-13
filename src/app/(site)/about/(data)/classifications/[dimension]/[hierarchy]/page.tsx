import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {JsonLd} from "@/components/seo/JsonLd";
import {getProfiles, listMembers, memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {pageJsonLd} from "@/lib/seo/jsonld";
import {pageImage, social} from "@/lib/seo/metadata";
import {familyByDimension, inSentence, levelPlural, SITE_NAME} from "@/lib/seo/site";

const DIMENSIONS = [
  {key: "Geography", label: "Locations", cls: "geo", icon: "Geography - Black", first: "State"},
  {key: "PUMS Industry", label: "Industries", cls: "naics", icon: "PUMS Industry - Black", first: "Industry Sector"},
  {key: "PUMS Occupation", label: "Occupations", cls: "soc", icon: "PUMS Occupation - Black", first: "Major Occupation Group"},
  {key: "CIP", label: "Degrees", cls: "cip", icon: "CIP - Black", first: "CIP2"},
  {key: "University", label: "Universities", cls: "university", icon: "University - Black", first: "Carnegie Parent"},
  {key: "NAPCS", label: "Products & Services", cls: "napcs", icon: "NAPCS - Black", first: "NAPCS Section"}
];

const commas = new Intl.NumberFormat("en-US");
const classificationPath = (dimension: string, hierarchy: string) => `/about/classifications/${encodeURIComponent(dimension)}/${encodeURIComponent(hierarchy)}`;
const sum = (obj: Record<string, number> = {}) => Object.values(obj).reduce((a, b) => a + b, 0);

type Params = Promise<{dimension: string; hierarchy: string}>;

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {dimension, hierarchy} = await params;
  const d = decodeURIComponent(dimension), h = decodeURIComponent(hierarchy);
  const path = classificationPath(d, h);
  const total = memberTotalsByHierarchy()[d]?.[h];
  const family = familyByDimension(d);
  if (!total || !family) return {title: "Classifications", alternates: {canonical: path}};
  const what = levelPlural(h);
  const title = `${what}: Classification IDs & Names`;
  const description = `Identifiers and names of ${total > 1 ? `all ${commas.format(total)} ` : "the "}${inSentence(what)} in the ${inSentence(family.label)} classification used by Data USA and its API, each linked to its report.`;
  return {
    title,
    description,
    alternates: {canonical: path},
    ...social({title, description, path, image: pageImage("classifications", {dimension: d, hierarchy: h}), imageAlt: `${title} | ${SITE_NAME}`})
  };
}

/** Blocks on the route params so an unknown classification answers a real 404. */
export const instant = false;

/** All members of one classification level, with links to their reports (legacy `Data/Classifications.jsx`). */
export default async function ClassificationPage({params}: {params: Params}) {
  const raw = await params;
  const dimension = decodeURIComponent(raw.dimension);
  const hierarchy = decodeURIComponent(raw.hierarchy);
  const totals = memberTotalsByHierarchy();
  if (!totals[dimension]?.[hierarchy]) notFound();
  const slugByDimension = Object.fromEntries(getProfiles().filter(p => p.ordering === 0).map(p => [p.dimension, p.slug]));
  const profile = slugByDimension[dimension] ?? "geo";
  const members = listMembers(dimension, hierarchy, 100000).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div id="Classifications">
      <JsonLd
        data={pageJsonLd({
          path: classificationPath(dimension, hierarchy),
          name: `${levelPlural(hierarchy)}: Classification IDs & Names`,
          crumbs: [{name: "Data", path: "/about/datasets"}, {name: "Classifications", path: "/about/classifications/Geography/State"}, {name: levelPlural(hierarchy)}]
        })}
      />
      <div id="SideNav">
        <div className="content">
          <ul className="classifications">
            <li><span className="title">Report Type</span><span className="num">Count</span></li>
            {DIMENSIONS.map(d => (
              <li key={d.key} className={`${d.cls} ${dimension === d.key ? "active" : ""}`}>
                <img src={`/icons/dimensions/${d.icon}.svg`} alt="" />
                <Link className="title" href={`/about/classifications/${encodeURIComponent(d.key)}/${encodeURIComponent(d.first)}`}>{d.label}</Link>
                <span className="num">{commas.format(sum(totals[d.key]))}</span>
                {dimension === d.key && (
                  <ul>
                    {Object.keys(totals[d.key] ?? {})
                      .sort((a, b) => totals[d.key][a] - totals[d.key][b])
                      .filter(key => totals[d.key][key] > 1)
                      .map(key => (
                        <li key={key} className={hierarchy === key ? "active" : ""}>
                          <span className="dot" aria-hidden="true" />
                          <Link className="title" href={`/about/classifications/${encodeURIComponent(d.key)}/${encodeURIComponent(key)}`}>{key}</Link>
                          <span className="num">{commas.format(totals[d.key][key])}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="content table">
        <div className="table-container">
          <table>
            <thead><tr><th>id</th><th>name</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td><Link href={`/profile/${profile}/${m.slug || m.id}`}>{m.name}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
