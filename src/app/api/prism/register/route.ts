import {NextResponse} from "next/server";
import {createPrismSubmission, prismDbEnabled, type PrismRegistration} from "@/lib/prism/db";
import {signToken} from "@/lib/prism/jwt";
import {PRISM_COOKIE, prismConfig} from "@/lib/prism/session";

type Issues = Record<string, string[]>;

function validate(body: unknown): {ok: true; data: PrismRegistration} | {ok: false; issues: Issues} {
  const issues: Issues = {};
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (key: string, required: boolean) => {
    const v = typeof b[key] === "string" ? (b[key] as string).trim() : "";
    if (required && !v) issues[key] = ["Required"];
    return v;
  };
  const data: PrismRegistration = {
    firstName: str("firstName", true),
    lastName: str("lastName", true),
    email: str("email", true),
    jobTitle: str("jobTitle", false) || undefined,
    company: str("company", true),
    country: str("country", true),
    state: str("state", false) || undefined,
    reason: str("reason", false) || undefined,
    otherReason: str("otherReason", false) || undefined,
    tellUsMore: str("tellUsMore", false) || undefined,
    consent: b.consent === true
  };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) issues.email = ["Invalid email"];
  if (!data.consent) issues.consent = ["consent is required"];
  return Object.keys(issues).length ? {ok: false, issues} : {ok: true, data};
}

/** Stores a registration and sets the HttpOnly JWT cookie (legacy `POST /api/prism/register`). */
export async function POST(request: Request) {
  const {secret, days} = prismConfig();
  if (!secret || !prismDbEnabled()) return NextResponse.json({ok: false, error: "registration unavailable"}, {status: 503});
  const body = await request.json().catch(() => null);
  const result = validate(body);
  if (!result.ok) return NextResponse.json({ok: false, error: "validation failed", issues: result.issues}, {status: 400});
  let id: number;
  try {
    id = await createPrismSubmission(result.data);
  }
  catch (error) {
    console.error("[prism] db error", error);
    return NextResponse.json({ok: false, error: "registration failed"}, {status: 500});
  }
  const token = signToken({email: result.data.email, user_id: id}, secret, days * 24 * 60 * 60);
  const response = NextResponse.json({ok: true, user_id: id});
  response.cookies.set(PRISM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: days * 24 * 60 * 60,
    path: "/"
  });
  return response;
}
