/**
 * Exports the legacy dimension tables (`canon_cms_search`, `canon_cms_search_content`,
 * `canon_cms_image`, `canon_cms_image_content`, `canon_cms_profile_meta`) into versioned, diffable
 * JSON Lines files under `data/`. `build-dimensions.ts` turns those into the SQLite database the
 * application reads, so the running site never needs the CMS database.
 *
 *   npm run export:dimensions
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {connectReadOnly} from "./db";

async function main() {
  const client = await connectReadOnly();
  try {
    const outDir = resolve("data");
    mkdirSync(outDir, {recursive: true});

    const members = await client.query(`
      SELECT s.id, s.dimension, s.hierarchy, s.slug, s.zvalue, s."imageId" AS image_id, s."cubeName" AS cube_name,
             c.name, c.keywords, c.attr
      FROM canon_cms_search s
      LEFT JOIN canon_cms_search_content c ON c.id = s."contentId" AND c.locale = 'en'
      ORDER BY s.dimension, s.hierarchy, s.id, s."cubeName"`);
    const memberLines = members.rows.map(r => JSON.stringify({
      id: r.id,
      dimension: r.dimension,
      hierarchy: r.hierarchy,
      slug: r.slug,
      name: r.name ?? "",
      zvalue: r.zvalue,
      imageId: r.image_id,
      cubeName: r.cube_name,
      keywords: r.keywords ?? undefined,
      hidden: r.attr && r.attr.show === false ? true : undefined
    }));
    writeFileSync(resolve(outDir, "members.jsonl"), `${memberLines.join("\n")}\n`);

    const images = await client.query(`
      SELECT i.id, i.url, i.author, i.license, c.meta
      FROM canon_cms_image i
      LEFT JOIN canon_cms_image_content c ON c.id = i.id AND c.locale = 'en'
      ORDER BY i.id`);
    writeFileSync(resolve(outDir, "images.jsonl"), `${images.rows.map(r => JSON.stringify({id: r.id, url: r.url, author: r.author, license: r.license, meta: r.meta ?? undefined})).join("\n")}\n`);

    const meta = await client.query(`
      SELECT m.id, m.profile_id, m.slug, m.dimension, m.levels, m.measure, m."cubeName" AS cube_name, m.ordering, m.visible, p.visible AS profile_visible, p.ordering AS profile_ordering
      FROM canon_cms_profile_meta m JOIN canon_cms_profile p ON p.id = m.profile_id
      ORDER BY p.ordering, m.ordering`);
    writeFileSync(resolve(outDir, "profiles.json"), `${JSON.stringify(meta.rows.map(r => ({
      id: r.id, profileId: r.profile_id, slug: r.slug, dimension: r.dimension, levels: r.levels, measure: r.measure,
      cubeName: r.cube_name, ordering: r.ordering, visible: r.visible && r.profile_visible, profileOrdering: r.profile_ordering
    })), null, 2)}\n`);

    console.log(`Exported ${members.rowCount} members, ${images.rowCount} images, ${meta.rowCount} profile metas to data/`);
  }
  finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
