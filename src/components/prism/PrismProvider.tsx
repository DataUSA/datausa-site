"use client";

import {useRouter} from "next/navigation";
import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from "react";
import {PrismForm} from "./PrismForm";

export interface PrismContextValue {
  /** Registered visitor id, or null when the gate is closed. */
  userId: number | null;
  unlocked: boolean;
  openForm: () => void;
  refresh: () => Promise<void>;
}

const PrismContext = createContext<PrismContextValue>({userId: null, unlocked: false, openForm: () => {}, refresh: async () => {}});

/** Tracks the PeoplePrism registration state for the page and hosts the registration dialog. */
export function PrismProvider({children, initialUserId}: {children: ReactNode; initialUserId: number | null}) {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(initialUserId);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/prism/status", {cache: "no-store"});
      const body = res.ok ? await res.json() : null;
      const id = body && typeof body.user_id === "number" ? body.user_id : null;
      setUserId(id);
      if (id !== null) router.refresh(); // server components re-render with the real (unlocked) data
    }
    catch {
      setUserId(null);
    }
  }, [router]);

  useEffect(() => {
    if (initialUserId === null) void refresh();
  }, [initialUserId, refresh]);

  return (
    <PrismContext.Provider value={{userId, unlocked: userId !== null, openForm: () => setFormOpen(true), refresh}}>
      {children}
      <PrismForm open={formOpen} onClose={() => setFormOpen(false)} onRegistered={refresh} />
    </PrismContext.Provider>
  );
}

export function usePrism(): PrismContextValue {
  return useContext(PrismContext);
}

const PRISM_HOST = "peopleprism.ai";

/** Adds Data USA referral parameters to links that point at PeoplePrism (legacy `withPrismReferral`). */
export function withPrismReferral(url: string, {pathname = "", sectionSlug = "", userId}: {pathname?: string; sectionSlug?: string; userId?: number | null} = {}): string {
  try {
    const target = new URL(url);
    if (target.hostname.replace(/^www\./, "") !== PRISM_HOST) return url;
    target.searchParams.set("referrer", "data-usa");
    target.searchParams.set("ref_location", sectionSlug ? `${pathname}#${sectionSlug}` : pathname);
    if (userId) target.searchParams.set("uid", String(userId));
    return target.toString();
  }
  catch {
    return url;
  }
}
