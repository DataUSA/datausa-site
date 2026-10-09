import {NextResponse} from "next/server";
import {State} from "country-state-city";

export async function GET(_request: Request, {params}: {params: Promise<{code: string}>}) {
  const {code} = await params;
  const states = State.getStatesOfCountry(code).map(s => ({value: s.isoCode, label: s.name}));
  return NextResponse.json(states, {headers: {"Cache-Control": "public, max-age=86400"}});
}
