/**
 * Messages between the batched warmer's coordinator (`scripts/cache/warm-batch.ts`) and its worker
 * processes (`worker.ts`). The coordinator holds what is global to the run: the cap on concurrent
 * Tesseract requests, the responses shared across groups, the verified shapes and the skip
 * templates. Workers plan, batch, split and render one member group at a time.
 */
import type {SplitSpec} from "@/lib/cache/batch-warm/shapes";
import type {WarmResponse} from "@/lib/api/warm-scope";

/** Kinds of upstream request, for the logs and the spreadsheet. */
export type UpstreamKind = "shared" | "parent" | "batch" | "single" | "fallback" | "verify" | "learn" | "attrs" | "geo";

export interface WorkerConfig {
  outDir: string;
  workerIndex: number;
  /** Reports rendered at a time in a worker. */
  renderConcurrency: number;
  /** Prefetches (shared, singles) in flight at a time from a worker (the global cap still applies). */
  fetchConcurrency: number;
  maxUrlLength: number;
  maxIds: number;
  fetchTimeoutMs: number;
  /** Re-render reports that are already a full hit. */
  force: boolean;
  /** Batching off: shared fetches, skips and singles only (for comparison). */
  noBatch: boolean;
  /** Geoservice prefetches in flight at a time from a worker (the run's geoservice limiter still applies). */
  geoConcurrency: number;
  cubeLevels: [string, string[]][];
}

export interface GroupJob {
  gid: number;
  profile: string;
  hierarchy: string;
  ids: string[];
}

/** A verified or rejected shape, as stored in Redis (`warm:shape:<hash>:<cube epoch>`). */
export interface ShapeRecord {
  shape: string;
  cube: string;
  level: string;
  status: "verified" | "rejected";
  reason: string;
  /** Present when verified with members that have data. */
  spec?: SplitSpec;
  /** The verified empty response for members missing from a batch (two real singles agreed). */
  empty?: WarmResponse;
  /** Members per batch: fewer when a member's rows are large (about 4 MB per batched response). */
  batchIds?: number;
  dataChecked: number;
  emptyChecked: number;
  /** A rejection that may pass another time (HTTP 5xx, timeout): kept for this run only. */
  transient?: boolean;
  at: string;
}

export type ToCoordinator =
  | {t: "ready"}
  | {t: "acq"; id: number; url: string; kind: UpstreamKind}
  | {t: "rel"; id: number; url: string; kind: UpstreamKind; cube: string | null; level: string; members: number; status: number; ms: number; bytes: number; error?: string; batchId?: string}
  | {t: "shared"; id: number; url: string; kind: "shared" | "parent"; level: string}
  | {t: "shape"; id: number; key: string; shape: string; cube: string; level: string}
  | {t: "shapeDone"; key: string; record: ShapeRecord}
  | {t: "shapeUse"; key: string; members: number; batches: number; level: string; batchSize: number}
  | {t: "skip"; id: number; key: string}
  | {t: "skipDone"; key: string; template: WarmResponse | null; reason: string}
  | {t: "groupDone"; gid: number; stats: GroupStats}
  | {t: "usage"; rss: number; heapUsed: number; cpuUser: number; cpuSystem: number}
  /** The phase a worker's group just entered, and how many items it covers (for the status view). */
  | {t: "phase"; gid: number; phase: Phase; items: number}
  /** Reports of a group rendered so far (for the status view). */
  | {t: "rendered"; gid: number; rendered: number; of: number}
  | {t: "error"; gid: number; message: string};

export type ToWorker =
  | {t: "init"; config: WorkerConfig}
  | {t: "group"; job: GroupJob}
  | {t: "grant"; id: number}
  | {t: "deny"; id: number; reason: string}
  | {t: "sharedRes"; id: number; response: WarmResponse | null}
  | {t: "shapeRes"; id: number; record: ShapeRecord | null; verify: boolean}
  | {t: "skipRes"; id: number; template: WarmResponse | null; learn: boolean}
  | {t: "stop"};

/** What a worker reports for a group. */
export interface GroupStats {
  gid: number;
  profile: string;
  hierarchy: string;
  reports: number;
  /** Already a full hit: not rendered. */
  fullHits: number;
  rendered: number;
  /** Rendered with at least one failed generator. */
  incomplete: number;
  /** Reports whose render threw. */
  errors: number;
  generators: number;
  stored: number;
  hits: number;
  /** Seconds per phase. */
  phases: Record<Phase, number>;
  /** Logical Tesseract URLs of the group's reports, by how they were served. */
  served: Record<string, number>;
  /** Tesseract URLs the old warmer would have requested for these reports (one per URL group). */
  oldRequests: number;
}

export const PHASES = ["plan", "skip", "shared", "verify", "batch", "single", "geo", "render"] as const;
export type Phase = typeof PHASES[number];
