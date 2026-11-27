// The warm UI's side of the Monitor panel: reads a monitor run's samples.jsonl (written by
// scripts/cache/monitor.ts) and sums it up for the page: the latest values, PING and MGET p50, p95
// and max over the last minute, and series for the charts. Reads files only; never Redis.
export interface Sample {
  t: number;
  pingMs?: number;
  mgetMs?: number;
  mgetBytes?: number;
  mgetNulls?: number;
  error?: string;
  infoError?: string;
  info?: Record<string, number | string>;
  rates?: Record<string, number | null>;
  host?: {availableMb: number; totalMb: number} | null;
  load1?: number | null;
}

const quantile = (values: number[], q: number) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};
const stats = (values: number[]) => ({p50: quantile(values, 0.5), p95: quantile(values, 0.95), p99: quantile(values, 0.99), max: values.length ? Math.max(...values) : null, n: values.length});

export function parseSamples(text: string): Sample[] {
  return text.split("\n").filter(Boolean).flatMap(l => {
    try {
      return [JSON.parse(l) as Sample];
    }
    catch {
      return [];
    }
  });
}

/** The last minute's latency quantiles and the newest INFO values, compact (the stress tool polls this). */
export function latest(samples: Sample[]) {
  const last = samples[samples.length - 1];
  if (!last) return null;
  const from = last.t - 60_000;
  const minute = samples.filter(s => s.t > from);
  const info = [...samples].reverse().find(s => s.info)?.info ?? {};
  const rates = [...samples].reverse().find(s => s.rates)?.rates ?? {};
  return {
    t: last.t,
    ageS: Math.round((Date.now() - last.t) / 1000),
    errorsLastMinute: minute.filter(s => s.error || s.infoError).length,
    lastError: [...minute].reverse().find(s => s.error || s.infoError)?.error ?? null,
    pingMs: stats(minute.flatMap(s => s.pingMs ?? [])),
    mgetMs: stats(minute.flatMap(s => s.mgetMs ?? [])),
    mgetBytes: last.mgetBytes ?? null,
    mgetNulls: last.mgetNulls ?? null,
    opsPerS: rates.opsPerS ?? null,
    cpuUserPct: rates.cpuUserPct ?? null,
    cpuSysPct: rates.cpuSysPct ?? null,
    cpuMainPct: rates.cpuMainPct ?? null,
    hitsPerS: rates.hitsPerS ?? null,
    missesPerS: rates.missesPerS ?? null,
    evictedPerS: rates.evictedPerS ?? null,
    netOutMBps: rates.netOutMBps ?? null,
    connectedClients: info.connected_clients ?? null,
    blockedClients: info.blocked_clients ?? null,
    rejectedConnections: info.rejected_connections ?? null,
    evictedKeys: info.evicted_keys ?? null,
    keyspaceHits: info.keyspace_hits ?? null,
    keyspaceMisses: info.keyspace_misses ?? null,
    usedMemory: info.used_memory ?? null,
    maxmemory: info.maxmemory ?? null,
    fragmentation: info.mem_fragmentation_ratio ?? null,
    keys: info.keys ?? null,
    bgsaveInProgress: info.rdb_bgsave_in_progress ?? null,
    aofRewriteInProgress: info.aof_rewrite_in_progress ?? null,
    latestForkUsec: info.latest_fork_usec ?? null,
    aofDelayedFsync: info.aof_delayed_fsync ?? null,
    redisVersion: info.redis_version ?? null,
    host: last.host ?? null,
    load1: last.load1 ?? null
  };
}

/** Series for the charts: one point per sample over the last `minutes`, thinned to about 600 points. */
export function series(samples: Sample[], minutes: number) {
  const last = samples[samples.length - 1];
  if (!last) return [];
  const from = last.t - minutes * 60_000;
  const window = samples.filter(s => s.t > from);
  const step = Math.max(1, Math.ceil(window.length / 600));
  const out = [];
  for (let i = 0; i < window.length; i += step) {
    const chunk = window.slice(i, i + step);
    const max = (f: (s: Sample) => number | null | undefined) => {
      const v = chunk.map(f).filter((x): x is number => typeof x === "number");
      return v.length ? Math.max(...v) : null;
    };
    const lastOf = (f: (s: Sample) => number | null | undefined) => {
      for (let j = chunk.length - 1; j >= 0; j--) {
        const v = f(chunk[j]);
        if (typeof v === "number") return v;
      }
      return null;
    };
    out.push({
      t: chunk[chunk.length - 1].t,
      // latency: the worst sample of each point, so thinning never hides a spike
      pingMs: max(s => s.pingMs), mgetMs: max(s => s.mgetMs),
      opsPerS: max(s => s.rates?.opsPerS), cpuMainPct: max(s => s.rates?.cpuMainPct ?? ((s.rates?.cpuUserPct ?? 0) + (s.rates?.cpuSysPct ?? 0))),
      cpuUserPct: max(s => s.rates?.cpuUserPct), cpuSysPct: max(s => s.rates?.cpuSysPct),
      netOutMBps: max(s => s.rates?.netOutMBps), clients: lastOf(s => s.info?.connected_clients as number | undefined),
      usedMemory: lastOf(s => s.info?.used_memory as number | undefined), fragmentation: lastOf(s => s.info?.mem_fragmentation_ratio as number | undefined),
      availableMb: lastOf(s => s.host?.availableMb), evictedPerS: max(s => s.rates?.evictedPerS),
      persisting: max(s => ((s.info?.rdb_bgsave_in_progress as number | undefined) ?? 0) + ((s.info?.aof_rewrite_in_progress as number | undefined) ?? 0)),
      errors: chunk.filter(s => s.error || s.infoError).length
    });
  }
  return out;
}
