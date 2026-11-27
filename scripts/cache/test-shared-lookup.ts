/**
 * Checks the shared lookups (`src/lib/cache/shared-lookup.ts`) across worker processes, against a
 * real Redis and a fake computation: no query is sent to Tesseract.
 *
 *   REDIS_URL=redis://127.0.0.1:6379 npx tsx scripts/cache/test-shared-lookup.ts
 *
 * 1. Four workers miss at once: one computes, the others read its result.
 * 2. Restarted workers read it back: nothing is computed.
 * 3. After a purge of its cube, the next four workers compute it once.
 * 4. A failure is not stored; the workers that meet it skip the lookup (no query) until the mark
 *    expires, then one computes it again.
 * 5. A worker that dies holding the lock: the others take over once the lock expires.
 * 6. Without Redis, each worker computes it, as before.
 * 7. Without a code version (no generator manifest), the same: nothing is read from Redis or stored.
 *
 * It writes only its own keys (`lookup:test-<id>…`, a made-up cube tag) and removes them at the end.
 */
import {spawn} from "node:child_process";
import {appendFileSync, mkdtempSync, readFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import Redis from "ioredis";

const FAILED_MS = 6000;
const LOCK_MS = 3000;

interface Value {n: number; pid: number}

if (process.argv.includes("--child")) void child();
else void main();

/** One worker: reads the lookup once, prints what it got, exits. */
async function child() {
  const {sharedLookup, sharedLookupKey} = await import("../../src/lib/cache/shared-lookup");
  const {noteFetch} = await import("../../src/lib/api/upstream-scope");
  const id = process.env.TEST_ID!;
  const mode = process.env.TEST_MODE ?? "ok";
  const value = await sharedLookup<Value>({
    key: sharedLookupKey(`test-${id}`, 1),
    shared: process.env.TEST_SHARED !== "0",
    label: `test lookup (${process.pid})`,
    compute: async () => {
      appendFileSync(process.env.TEST_COUNT_FILE!, "x");
      if (mode === "crash") setTimeout(() => process.exit(3), 200);
      await new Promise(r => setTimeout(r, Number(process.env.TEST_DELAY_MS ?? 1000)));
      noteFetch(`https://example.invalid/tesseract/data.jsonrecords?cube=__test_${id}`, mode === "fail" ? "timed out after 20000 ms" : undefined);
      return {n: 42, pid: process.pid};
    },
    encode: v => v,
    decode: v => v as Value,
    fallback: {n: 0, pid: 0}
  });
  console.log(`RESULT ${JSON.stringify(value)}`);
  process.exit(0);
}

function runWorkers(count: number, env: Record<string, string | undefined>): Promise<Value[]> {
  return Promise.all(Array.from({length: count}, () => new Promise<Value>((resolve, reject) => {
    const proc = spawn(process.execPath, ["--import", "tsx", process.argv[1], "--child"], {
      env: {...process.env, LOOKUP_FAILED_MS: String(FAILED_MS), LOOKUP_LOCK_MS: String(LOCK_MS), ...env},
      stdio: ["ignore", "pipe", "inherit"]
    });
    let out = "";
    proc.stdout.on("data", d => { out += d; });
    proc.on("exit", code => {
      const line = out.split("\n").find(l => l.startsWith("RESULT "));
      if (line) resolve(JSON.parse(line.slice(7)) as Value);
      else if (env.TEST_MODE === "crash") resolve({n: -1, pid: 0});
      else reject(new Error(`worker exited with ${code} and no result:\n${out}`));
    });
  })));
}

async function main() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("set REDIS_URL (a Redis you can write test keys to)");
  const {sharedLookupKey} = await import("../../src/lib/cache/shared-lookup");
  const {purgeTag} = await import("../../src/lib/cache/purge");
  const {EPOCH_KEY, TAG_REGISTRY_KEY} = await import("../../src/lib/cache/store");
  const id = Math.random().toString(36).slice(2, 10);
  const key = sharedLookupKey(`test-${id}`, 1);
  const tag = `cube:__test_${id}`;
  const dir = mkdtempSync(join(tmpdir(), "shared-lookup-"));
  const countFile = join(dir, "computes");
  appendFileSync(countFile, "");
  const computes = () => readFileSync(countFile, "utf8").length;
  const redis = new Redis(url);
  let failed = 0;
  const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${detail}`);
    if (!ok) failed++;
  };
  const env = {TEST_ID: id, TEST_COUNT_FILE: countFile, REDIS_URL: url};
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  try {
    // 1. a cold start: four workers at once
    let values = await runWorkers(4, env);
    check("four workers miss at once", computes() === 1 && values.every(v => v.n === 42 && v.pid === values[0].pid),
      `${computes()} computation(s), values ${JSON.stringify(values.map(v => v.n))}`);
    check("stored with its cube tag", (await redis.exists(key)) === 1 && (await redis.sismember(tag, `${key}|lookup|${key}`)) === 1, `${key} in ${tag}`);
    check("lock released", (await redis.exists(`lock:${key}`)) === 0, "no lock left");

    // 2. a restart: read back
    values = await runWorkers(4, env);
    check("restarted workers read it back", computes() === 1 && values.every(v => v.n === 42), `${computes()} computation(s) in total`);

    // 3. a release purge of its cube
    const purged = await purgeTag(redis, tag);
    values = await runWorkers(4, env);
    check("a purge refreshes it, once", purged.deleted === 1 && computes() === 2 && values.every(v => v.n === 42),
      `purge deleted ${purged.deleted}, ${computes()} computation(s) in total`);

    // 4. a failure
    await purgeTag(redis, tag);
    values = await runWorkers(4, {...env, TEST_MODE: "fail"});
    const afterFailure = computes();
    check("a failure is computed once and not stored", afterFailure === 3 && (await redis.exists(key)) === 0
      && values.filter(v => v.n === 0).length === 3,
      `${afterFailure - 2} computation(s); ${values.filter(v => v.n === 0).length} workers answered without figures`);
    const mark = await redis.get(`lock:${key}`);
    check("the failure is remembered", Boolean(mark?.startsWith("failed|")), String(mark).slice(0, 80));
    values = await runWorkers(2, {...env, TEST_MODE: "fail"});
    check("workers skip it while the mark lasts", computes() === afterFailure && values.every(v => v.n === 0), `${computes() - afterFailure} new computation(s)`);
    await sleep(FAILED_MS + 300);
    values = await runWorkers(3, env);
    check("after the mark, one worker computes it again", computes() === afterFailure + 1 && values.every(v => v.n === 42),
      `${computes() - afterFailure} new computation(s)`);

    // 5. a worker that dies holding the lock
    await purgeTag(redis, tag);
    const before = computes();
    const crashed = runWorkers(1, {...env, TEST_MODE: "crash", TEST_DELAY_MS: "5000"});
    await sleep(600);
    const started = Date.now();
    values = await runWorkers(2, env);
    await crashed;
    check("others take over when the lock expires", computes() === before + 2 && values.every(v => v.n === 42) && Date.now() - started < LOCK_MS + 3000,
      `${computes() - before} computation(s) (the dead one and one more), waited ${((Date.now() - started) / 1000).toFixed(1)} s`);

    // 6. no Redis
    const noRedis = computes();
    values = await runWorkers(3, {...env, REDIS_URL: ""});
    check("without Redis each worker computes", computes() === noRedis + 3 && values.every(v => v.n === 42), `${computes() - noRedis} computation(s)`);

    // 7. no code version: kept out of Redis even though one holds the value
    await redis.del(`lock:${key}`);
    const unversioned = computes();
    values = await runWorkers(3, {...env, TEST_SHARED: "0"});
    check("without a code version each worker computes", computes() === unversioned + 3 && values.every(v => v.n === 42) && (await redis.exists(`lock:${key}`)) === 0,
      `${computes() - unversioned} computation(s), no lock taken`);
  }
  finally {
    await redis.del(key, `lock:${key}`, tag);
    await redis.hdel(EPOCH_KEY, tag);
    await redis.srem(TAG_REGISTRY_KEY, tag);
    redis.disconnect();
    rmSync(dir, {recursive: true, force: true});
  }
  console.log(failed ? `${failed} check(s) failed` : "all checks passed");
  process.exit(failed ? 1 : 0);
}
