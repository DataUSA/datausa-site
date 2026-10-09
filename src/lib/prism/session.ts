/**
 * Server-side access to the PeoplePrism registration state (JWT in an HttpOnly cookie).
 */
import {cookies} from "next/headers";
import {verifyToken, type PrismClaims} from "@/lib/prism/jwt";

export const PRISM_COOKIE = "prism_token";

export function prismConfig() {
  const secret = process.env.PRISM_JWT_SECRET;
  const days = Number(process.env.PRISM_COOKIE_DAYS ?? 365) || 365;
  return {secret, days, enabled: Boolean(secret)};
}

/** The registered Prism visitor for the current request, or null. */
export async function getPrismUser(): Promise<PrismClaims | null> {
  const {secret} = prismConfig();
  if (!secret) return null;
  const store = await cookies();
  return verifyToken(store.get(PRISM_COOKIE)?.value, secret);
}
