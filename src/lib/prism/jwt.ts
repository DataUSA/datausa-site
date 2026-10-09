/**
 * Minimal HS256 JSON Web Token signing/verification for the PeoplePrism registration cookie.
 * Compatible with the tokens the legacy site issued with `jsonwebtoken` (same algorithm and claims),
 * so existing visitor cookies keep working after cutover.
 */
import {createHmac, timingSafeEqual} from "node:crypto";

export interface PrismClaims {
  email: string;
  user_id: number;
  iat: number;
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload: {email: string; user_id: number}, secret: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({alg: "HS256", typ: "JWT"}));
  const body = base64url(JSON.stringify({...payload, iat: now, exp: now + ttlSeconds}));
  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string | undefined, secret: string): PrismClaims | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PrismClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
    return claims;
  }
  catch {
    return null;
  }
}
