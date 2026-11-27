/**
 * The batched warmer's hold on the fetch layer (`src/lib/cache/batch-warm/`, `npm run warm:batch`).
 *
 * A warm run renders reports inside a warm scope (AsyncLocalStorage, like `upstream-scope.ts`).
 * Inside one, `fetchJsonRaw` first asks the scope for the URL's response: the warmer has already
 * fetched it (once for the run, or as part of a batched query split per member), or knows the
 * answer without asking (a level the cube does not have). Anything the scope does not answer is
 * fetched as usual, waiting for the scope's request slot (the run's global cap on Tesseract) instead
 * of the worker's own limiter. `fetchData` fetches directly inside a warm scope, never through
 * Next's `use cache`.
 *
 * Outside a warm run there is no scope and nothing here runs: live renders are unchanged.
 */
import {AsyncLocalStorage} from "node:async_hooks";

/** A response the warmer holds for a URL: what the URL answers, as text. */
export interface WarmResponse {
  status: number;
  body: string;
}

/** Called once the response has been read, with what came back. */
export type WarmRelease = (outcome: {status: number; ms: number; bytes: number; error?: string}) => void;

export interface WarmContext {
  /**
   * The held response for an upstream URL (exactly as `fetchJsonRaw` would request it), if any. It
   * may have to ask the run's coordinator (a URL many members share, fetched once per run).
   */
  lookup(url: string): WarmResponse | undefined | Promise<WarmResponse | undefined>;
  /** A request slot for a URL the scope did not answer, or null to use the worker's own limiter. */
  acquire(url: string): Promise<WarmRelease> | null;
  /** A successful response fetched inside the scope, so a later read of the same URL is served. */
  keep?(url: string, response: WarmResponse): void;
}

const store = globalThis as typeof globalThis & {__warmScopeV1?: AsyncLocalStorage<WarmContext>};
const storage = store.__warmScopeV1 ??= new AsyncLocalStorage<WarmContext>();

export function currentWarm(): WarmContext | undefined {
  return storage.getStore();
}

/** Runs `fn` in a warm scope. */
export function withWarm<T>(context: WarmContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(context, fn);
}
