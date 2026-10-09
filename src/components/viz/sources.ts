"use client";

import {useSyncExternalStore} from "react";

/** Dataset annotations as returned by Tesseract alongside query results. */
export interface DataSource {
  source_name?: string;
  source_description?: string;
  source_link?: string;
  dataset_name?: string;
  dataset_description?: string;
  dataset_link?: string;
  [key: string]: unknown;
}

type Listener = () => void;

const sourcesBySection = new Map<string, DataSource[]>();
const listeners = new Map<string, Set<Listener>>();
const EMPTY: DataSource[] = [];

function emit(sectionSlug: string) {
  listeners.get(sectionSlug)?.forEach(l => l());
}

/** Registers data sources loaded by a chart so the topic can print "Data from ...". */
export function addSources(sectionSlug: string, sources: DataSource[]) {
  const current = sourcesBySection.get(sectionSlug) ?? [];
  let changed = false;
  for (const source of sources) {
    if (!source || !source.source_name) continue;
    if (!current.find(s => s.source_name === source.source_name && s.dataset_name === source.dataset_name)) {
      current.push(source);
      changed = true;
    }
  }
  if (changed) {
    sourcesBySection.set(sectionSlug, [...current]);
    emit(sectionSlug);
  }
}

export function clearSources(sectionSlug: string) {
  if (sourcesBySection.has(sectionSlug)) {
    sourcesBySection.delete(sectionSlug);
    emit(sectionSlug);
  }
}

export function useSources(sectionSlug: string): DataSource[] {
  return useSyncExternalStore(
    listener => {
      if (!listeners.has(sectionSlug)) listeners.set(sectionSlug, new Set());
      listeners.get(sectionSlug)!.add(listener);
      return () => listeners.get(sectionSlug)?.delete(listener);
    },
    () => sourcesBySection.get(sectionSlug) ?? EMPTY,
    () => EMPTY
  );
}

/** Extracts annotation objects from one or many API responses (legacy `analyzeData`). */
export function extractSources(resp: unknown): DataSource[] {
  const out: DataSource[] = [];
  const visit = (r: unknown) => {
    if (!r || typeof r !== "object") return;
    const obj = r as Record<string, unknown>;
    if (obj.source) {
      if (Array.isArray(obj.source)) obj.source.forEach(s => s && out.push(s as DataSource));
      else out.push(obj.source as DataSource);
    }
    if (obj.annotations && typeof obj.annotations === "object") out.push(obj.annotations as DataSource);
  };
  if (Array.isArray(resp) && resp.length < 6) resp.forEach(visit);
  else visit(resp);
  return out;
}
