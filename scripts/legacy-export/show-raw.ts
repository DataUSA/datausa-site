/**
 * Prints the raw JavaScript body of CMS objects, for writing patches that must match the original
 * text exactly: `npx tsx --env-file=.env.migration.local scripts/legacy-export/show-raw.ts visualization 100 340`
 * Kinds: generator, materializer, visualization. Add `--grep <text>` to show only the text around
 * each occurrence of `text`.
 */
import {connectReadOnly, readCmsTables, type CmsTables} from "./db";

const TABLE: Record<string, keyof CmsTables> = {generator: "generator", materializer: "materializer", visualization: "section_visualization"};

async function main() {
  const args = process.argv.slice(2);
  const grepIdx = args.indexOf("--grep");
  const needle = grepIdx >= 0 ? args[grepIdx + 1] : undefined;
  const [kind, ...ids] = args.filter((_a, i) => i !== grepIdx && i !== grepIdx + 1);
  const table = TABLE[kind];
  if (!table) throw new Error("usage: show-raw.ts <generator|materializer|visualization> <id...> [--grep text]");
  const client = await connectReadOnly();
  try {
    const tables = await readCmsTables(client);
    for (const id of ids.map(Number)) {
      const row = (tables[table] as unknown as {id: number; logic?: string}[]).find(r => r.id === id);
      const logic = row?.logic ?? "";
      console.log(`=== ${kind} ${id} (${logic.length} chars) ===`);
      if (!needle) { console.log(logic); continue; }
      let idx = logic.indexOf(needle);
      while (idx !== -1) {
        console.log(`--- offset ${idx} ---\n${JSON.stringify(logic.slice(Math.max(0, idx - 60), idx + 120))}`);
        idx = logic.indexOf(needle, idx + 1);
      }
    }
  }
  finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
