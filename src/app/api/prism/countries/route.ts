import {NextResponse} from "next/server";
import {Country} from "country-state-city";

export async function GET() {
  const countries = Country.getAllCountries().map(c => ({value: c.isoCode, label: c.name}));
  return NextResponse.json(countries, {headers: {"Cache-Control": "public, max-age=86400"}});
}
