// A worker process of the batched warmer, forked by scripts/cache/warm-batch.ts (see there).
// Settings a warm run needs differ from a page view's: Redis may take longer than a page can wait
// (many renders write at once), and Tesseract requests go through the coordinator's global cap
// rather than the worker's own limiter. They are set before the app modules load, since those read
// them once.
const defaults: Record<string, string> = {
  REDIS_READ_TIMEOUT_MS: "2000",
  REDIS_WRITE_TIMEOUT_MS: "20000",
  API_MAX_CONCURRENCY: "50",
  // only the geoservice goes through the worker's own limiter (Tesseract uses the run's cap): it
  // answers 429 when a run sends hundreds of requests at once
  UPSTREAM_MAX_CONCURRENCY: "6",
  UPSTREAM_QUEUE_TIMEOUT_MS: "0",
  API_TIMEOUT_MS: "60000",
  WARMER_ENABLED: "false"
};
for (const [key, value] of Object.entries(defaults)) process.env[key] ??= value;

import("@/lib/cache/batch-warm/worker").then(m => m.startWorker()).catch(error => {
  console.error(error);
  process.exit(1);
});
