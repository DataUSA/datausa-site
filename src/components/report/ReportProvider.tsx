"use client";

import {createContext, useContext, type ReactNode} from "react";
import type {SelectorValues} from "@/lib/template";
import type {Variables} from "@/lib/reports/types";

export interface ReportClientState {
  variables: Variables;
  selectors: SelectorValues;
  labels: Variables;
  memberSlug: string;
}

export interface ReportContextValue {
  profileSlug: string;
  primary: ReportClientState;
  /** Present in comparison mode (`?compare=`). */
  comparison?: ReportClientState;
}

const ReportContext = createContext<ReportContextValue | null>(null);

/**
 * Serialises the report variables the page's charts need exactly once and shares them with every
 * chart island and selector on the page.
 */
export function ReportProvider({children, ...value}: ReportContextValue & {children: ReactNode}) {
  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport(): ReportContextValue {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used inside a ReportProvider");
  return ctx;
}

/** The client state for the primary report or, when requested and present, the comparison. */
export function useReportState(which: "primary" | "comparison" = "primary"): ReportClientState {
  const ctx = useReport();
  return which === "comparison" && ctx.comparison ? ctx.comparison : ctx.primary;
}
