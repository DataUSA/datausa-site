// A read-only Redis sampler, for the warm UI's Monitor panel (docs/deployment.md, "Warm UI"). Every
// `--interval` ms it times a PING and an MGET of a fixed sample of real `gen:*` keys, reads INFO, and
// appends one line to `<out>/samples.jsonl`. It never writes to Redis: every command goes through
// `ro()`, which only lets INFO, PING, MGET and SCAN through.
//
//   REDIS_URL=redis://127.0.0.1:6379 npx tsx scripts/cache/monitor.ts --out warm-runs/<id> \
//     [--interval 1000] [--keys 100] [--keys-file <keys.json from an earlier run>]
//
// Timestamps (`t`) are milliseconds since the epoch (UTC), so samples line up with a stress run's
// requests.jsonl taken on another machine. On Linux it also reads /proc/meminfo (the host's, from
// inside a container) for the memory left on the machine.
import {appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";
import Redis from "ioredis";

const argv = process.argv.slice(2);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const OUT = resolve(opt("out", ""));
const INTERVAL_MS = Math.max(250, Number(opt("interval", "1000")));
const WANT_KEYS = Math.max(1, Math.min(1000, Number(opt("keys", "100"))));
const KEYS_FILE = opt("keys-file", "");
const REDIS_URL = process.env.REDIS_URL ?? "";

if (!REDIS_URL || !opt("out", "")) {
  console.error("usage: REDIS_URL=... tsx scripts/cache/monitor.ts --out <dir> [--interval 1000] [--keys 100] [--keys-file keys.json]");
  process.exit(2);
}
mkdirSync(OUT, {recursive: true});

const client = new Redis(REDIS_URL, {
  // a sample that can't be sent is recorded as an error, not queued behind a reconnect
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  commandTimeout: 5000,
  connectTimeout: 3000,
  connectionName: "warm-ui-monitor",
  retryStrategy: times => Math.min(times * 500, 5000)
});
client.on("error", error => console.warn(`[monitor] ${(error as Error).message}`));

/** The only commands this sampler sends (besides the client's own connection handshake). */
const READ_ONLY = new Set(["INFO", "PING", "MGET", "SCAN"]);
function guard(command: string) {
  if (!READ_ONLY.has(command)) throw new Error(`monitor: refusing ${command}, which is not on the read-only list`);
}
const ro = (command: string, ...args: (string | number)[]) => {
  guard(command);
  return client.call(command, ...args);
};
const roBuffer = (command: string, ...args: (string | number)[]) => {
  guard(command);
  return client.callBuffer(command, ...args);
};

const waitReady = () => new Promise<void>(ok => {
  if (client.status === "ready") ok();
  else client.once("ready", () => ok());
});

/** About `want` keys spread over the keyspace: SCAN pages are in hash order, so already well mixed. */
async function sampleKeys(want: number): Promise<string[]> {
  const found: string[] = [];
  let cursor = "0", rounds = 0;
  do {
    const [next, keys] = await ro("SCAN", cursor, "MATCH", "gen:*", "COUNT", 1000) as [string, string[]];
    cursor = next;
    found.push(...keys);
    rounds++;
  } while (cursor !== "0" && found.length < want * 20 && rounds < 400);
  for (let i = found.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [found[i], found[j]] = [found[j], found[i]];
  }
  return found.slice(0, want);
}

const INFO_FIELDS = [
  "redis_version", "uptime_in_seconds", "instantaneous_ops_per_sec", "total_commands_processed", "used_cpu_user", "used_cpu_sys",
  "used_cpu_user_main_thread", "used_cpu_sys_main_thread", "connected_clients", "blocked_clients", "total_connections_received",
  "rejected_connections", "used_memory", "used_memory_rss", "maxmemory", "mem_fragmentation_ratio", "keyspace_hits", "keyspace_misses",
  "evicted_keys", "expired_keys", "total_net_input_bytes", "total_net_output_bytes", "rdb_bgsave_in_progress", "aof_rewrite_in_progress",
  "latest_fork_usec", "aof_delayed_fsync", "aof_pending_bio_fsync", "rdb_changes_since_last_save", "rdb_last_bgsave_status",
  "aof_last_write_status", "loading", "io_threads_active"
] as const;

function parseInfo(text: string): Record<string, number | string> {
  const all: Record<string, string> = {};
  for (const line of text.split("\r\n")) {
    const i = line.indexOf(":");
    if (i > 0 && !line.startsWith("#")) all[line.slice(0, i)] = line.slice(i + 1);
  }
  const out: Record<string, number | string> = {};
  for (const f of INFO_FIELDS) {
    if (all[f] === undefined) continue;
    const n = Number(all[f]);
    out[f] = Number.isFinite(n) ? n : all[f];
  }
  const db0 = all.db0?.match(/keys=(\d+)/);
  if (db0) out.keys = Number(db0[1]);
  return out;
}

/** MemAvailable and MemTotal in MB, from the host's /proc/meminfo; null elsewhere. */
function hostMemory(): {availableMb: number; totalMb: number} | null {
  try {
    const text = readFileSync("/proc/meminfo", "utf8");
    const kb = (name: string) => Number(text.match(new RegExp(`^${name}:\\s+(\\d+)`, "m"))?.[1] ?? NaN);
    const a = kb("MemAvailable"), t = kb("MemTotal");
    return Number.isFinite(a) ? {availableMb: Math.round(a / 1024), totalMb: Math.round(t / 1024)} : null;
  }
  catch {
    return null;
  }
}
const loadAverage = () => {
  try {
    return Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);
  }
  catch {
    return null;
  }
};

const ms = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

let stopping = false;
let prev: {t: number; info: Record<string, number | string>} | null = null;

async function sample(keys: string[]) {
  const t = Date.now();
  const line: Record<string, unknown> = {t};
  try {
    let s = process.hrtime.bigint();
    await ro("PING");
    line.pingMs = round(ms(s), 3);
    if (keys.length) {
      s = process.hrtime.bigint();
      const values = await roBuffer("MGET", ...keys) as (Buffer | null)[];
      line.mgetMs = round(ms(s), 3);
      line.mgetBytes = values.reduce((n, v) => n + (v?.length ?? 0), 0);
      line.mgetNulls = values.filter(v => v === null).length;
    }
  }
  catch (error) {
    line.error = (error as Error).message;
  }
  try {
    const info = parseInfo(await ro("INFO", "server", "clients", "memory", "persistence", "stats", "cpu", "keyspace") as string);
    line.info = info;
    if (prev && typeof info.uptime_in_seconds === "number" && info.uptime_in_seconds >= (prev.info.uptime_in_seconds as number)) {
      const dt = (t - prev.t) / 1000;
      const d = (f: string) => ((info[f] as number) - (prev!.info[f] as number)) / dt;
      line.rates = {
        opsPerS: round(d("total_commands_processed"), 1),
        cpuUserPct: round(100 * d("used_cpu_user"), 1),
        cpuSysPct: round(100 * d("used_cpu_sys"), 1),
        cpuMainPct: info.used_cpu_user_main_thread !== undefined ? round(100 * (d("used_cpu_user_main_thread") + d("used_cpu_sys_main_thread")), 1) : null,
        hitsPerS: round(d("keyspace_hits"), 1),
        missesPerS: round(d("keyspace_misses"), 1),
        evictedPerS: round(d("evicted_keys"), 2),
        rejectedPerS: round(d("rejected_connections"), 2),
        netOutMBps: round(d("total_net_output_bytes") / 1e6, 3),
        netInMBps: round(d("total_net_input_bytes") / 1e6, 3),
        connectionsPerS: round(d("total_connections_received"), 2)
      };
    }
    prev = {t, info};
  }
  catch (error) {
    line.infoError = (error as Error).message;
  }
  line.host = hostMemory();
  line.load1 = loadAverage();
  appendFileSync(join(OUT, "samples.jsonl"), JSON.stringify(line) + "\n");
}

async function main() {
  await waitReady();
  let keys: string[];
  if (KEYS_FILE && existsSync(KEYS_FILE)) keys = JSON.parse(readFileSync(KEYS_FILE, "utf8")) as string[];
  else keys = await sampleKeys(WANT_KEYS);
  if (!keys.length) {
    console.error("[monitor] no gen:* keys found to time an MGET with; timing PING and INFO only");
  }
  writeFileSync(join(OUT, "keys.json"), JSON.stringify(keys));
  console.log(`[monitor] sampling every ${INTERVAL_MS} ms with an MGET of ${keys.length} gen:* keys into ${join(OUT, "samples.jsonl")}`);
  // one sample at a time, on a fixed schedule; a slow sample delays the next instead of piling up
  let next = Date.now();
  while (!stopping) {
    await sample(keys);
    next += INTERVAL_MS;
    const wait = next - Date.now();
    if (wait < 0) next = Date.now();
    else await new Promise(ok => setTimeout(ok, wait));
  }
  client.disconnect();
}

const stop = () => {
  stopping = true;
  setTimeout(() => process.exit(0), 2000).unref();
};
process.once("SIGTERM", stop);
process.once("SIGINT", stop);

main().catch(error => {
  console.error(`[monitor] ${(error as Error).message}`);
  process.exit(1);
});
