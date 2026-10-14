import {NextResponse} from "next/server";
import {getPrismUser} from "@/lib/prism/session";

/** Whether the visitor has registered for PeoplePrism data (legacy `GET /api/prism/status`). */
export async function GET() {
  const user = await getPrismUser();
  // Per-visitor: never let a shared proxy cache this.
  const headers = {"Cache-Control": "no-store, private"};
  // A closed gate is a normal answer, not a 401: a 401 makes browsers drop cached HTTP Basic
  // credentials, which re-prompts on every page behind the password-protected sandbox.
  if (!user) return NextResponse.json({gated: true}, {headers});
  return NextResponse.json({verified: true, user_id: user.user_id}, {headers});
}
