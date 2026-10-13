/**
 * Renders the share-image layouts to PNG files without a running server, for design work:
 *
 *   npx tsx scripts/og/preview.tsx <output directory>
 *
 * Uses sample figures and the live image host; the routes under `src/app/og` supply real data.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import type {ReactElement} from "react";
import {ImageResponse} from "next/og";
import {fetchPhoto, ogFonts, ogLogo} from "@/lib/og/assets";
import {CompareCard, PageCard, ReportCard} from "@/lib/og/cards";
import {geoLocator} from "@/lib/og/locator";
import {OG_SIZE} from "@/lib/og/theme";
import {familyBySlug} from "@/lib/seo/site";

const out = process.argv[2] ?? "og-preview";
const only = process.argv[3];
const photo = (slug: string, member: string) => fetchPhoto(`https://datausa.io/api/profile/${slug}/${member}/splash`, 15000);

async function save(name: string, element: ReactElement) {
  if (only && !name.includes(only)) return;
  const response = new ImageResponse(element, {...OG_SIZE, fonts: await ogFonts()});
  writeFileSync(join(out, `${name}.png`), Buffer.from(await response.arrayBuffer()));
  console.log(`${name}.png`);
}

async function main() {
  mkdirSync(out, {recursive: true});
  const logo = await ogLogo();
  const geo = familyBySlug("geo"), soc = familyBySlug("soc"), university = familyBySlug("university"), napcs = familyBySlug("napcs");

  await save("place", <ReportCard
    logo={logo} photo={await photo("geo", "cambridge-ma")} credit="Photo by Robbie Shade" family={geo} level="Census Place" name="Cambridge, MA"
    facts={[{label: "Population", value: "118,796", year: "2024"}, {label: "Median Household Income", value: "$130,748", year: "2024"}, {label: "Median Age", value: "30.4", year: "2024"}]}
    locator={geoLocator("16000US2511000", "Place", 330, 220)}
  />);
  await save("state", <ReportCard
    logo={logo} photo={await photo("geo", "massachusetts")} family={geo} level="State" name="Massachusetts"
    facts={[{label: "Population", value: "7.04M", year: "2024"}, {label: "Median Household Income", value: "$103,960", year: "2024"}, {label: "Poverty Rate", value: "10%", year: "2024"}]}
    locator={geoLocator("04000US25", "State", 330, 220)}
  />);
  await save("district", <ReportCard
    logo={logo} photo={await photo("geo", "congressional-district-5-ky")} family={geo} level="Congressional District" name="Congressional District 5, KY" tagline="Appalachian Kentucky"
    facts={[{label: "Population", value: "742,663", year: "2024"}, {label: "Median Household Income", value: "$45,798", year: "2024"}, {label: "Poverty Rate", value: "24.8%", year: "2024"}]}
    locator={geoLocator("50000US2105", "Congressional District", 330, 220)}
  />);
  await save("county", <ReportCard
    logo={logo} family={geo} level="County" name="Middlesex County, MA"
    facts={[{label: "Population", value: "1.64M", year: "2024"}, {label: "Median Household Income", value: "$130,847", year: "2024"}, {label: "Poverty Rate", value: "7.74%", year: "2024"}]}
    locator={geoLocator("05000US25017", "County", 330, 220)}
  />);
  await save("nation", <ReportCard
    logo={logo} photo={await photo("geo", "united-states")} family={geo} level="Nation" name="United States"
    facts={[{label: "Population", value: "335M", year: "2024"}, {label: "Median Household Income", value: "$80,734", year: "2024"}, {label: "Median Age", value: "38.9", year: "2024"}]}
    locator={geoLocator("01000US", "Nation", 330, 220)}
  />);
  await save("occupation", <ReportCard
    logo={logo} photo={await photo("soc", "registered-nurses")} family={soc} level="Detailed Occupation" name="Registered nurses"
    facts={[{label: "Workforce", value: "3.54M", year: "2024"}, {label: "Average Salary", value: "$82,141"}, {label: "Estimated Job Growth", value: "4.9%"}]}
  />);
  await save("university", <ReportCard
    logo={logo} photo={await photo("university", "harvard-university")} family={university} name="Harvard University"
    facts={[{label: "Undergraduate Tuition", value: "$56,550", year: "2024"}, {label: "Acceptance Rate", value: "3.65%", year: "2024"}, {label: "Enrolled Students", value: "30,259", year: "2024"}]}
  />);
  await save("product", <ReportCard
    logo={logo} family={napcs} level="NAPCS Section" name="Accounting, management, administrative, and miscellaneous services"
    facts={[{label: "Federal Obligation", value: "$100B", year: "2017"}]}
  />);
  await save("compare", <CompareCard
    logo={logo} family={geo}
    sides={[
      {name: "Cambridge, MA", photo: await photo("geo", "cambridge-ma"), facts: [{label: "Population", value: "118,796", year: "2024"}, {label: "Median Household Income", value: "$130,748", year: "2024"}, {label: "Median Age", value: "30.4", year: "2024"}]},
      {name: "Beverly, MA", photo: await photo("geo", "beverly-ma"), facts: [{label: "Population", value: "42,446", year: "2024"}, {label: "Median Household Income", value: "$101,907", year: "2024"}, {label: "Median Age", value: "40.1", year: "2024"}]}
    ]}
  />);
  const counts = {geo: 36558, naics: 308, soc: 648, cip: 1837, university: 7587, napcs: 254};
  await save("home", <PageCard logo={logo} headline={["The definitive place", "to explore US public data"]} text="Explore, map, compare, and download U.S. data." counts={counts} />);
  await save("page", <PageCard logo={logo} eyebrow="About" headline="Glossary" text="Definitions of the measures, classifications and methods used across Data USA." />);
  await save("level", <PageCard logo={logo} eyebrow="Search" headline="3,197 Counties" text="Every county report on Data USA, ranked by population." counts={counts} active="geo" />);
}

main().catch(error => { console.error(error); process.exit(1); });
