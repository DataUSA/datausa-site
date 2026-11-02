/**
 * Runs once when a server process starts (each PM2 worker): connects to the shared cache and starts
 * the warmer loop, of which only the worker holding the Redis leader lock does any work
 * (`src/lib/cache/warmer.ts`). Nothing happens without `REDIS_URL`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.REDIS_URL) return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const {redisClient} = await import("@/lib/cache/redis");
  redisClient(); // connect now, so the first report finds the client ready
  const {startWarmer} = await import("@/lib/cache/warmer");
  startWarmer();
}
