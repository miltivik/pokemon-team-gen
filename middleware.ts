import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Geo-based consent scoping: cookie consent is only legally required in the
 * EEA, UK and Switzerland. The middleware resolves the visitor's country
 * (Cloudflare in front of Vercel injects CF-IPCountry; x-vercel-ip-country
 * is the fallback) and stores it in a cookie that lib/consent.ts reads to
 * decide whether the consent banner and the ad/analytics gating apply.
 *
 * Unknown geo defaults to consent-required (privacy-conservative).
 */

const CONSENT_REQUIRED_COUNTRIES = new Set([
  // EU 27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // UK + EFTA
  "GB", "UK", "CH", "NO", "IS", "LI",
]);

export function middleware(request: NextRequest) {
  const country = (
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country") ??
    ""
  ).toUpperCase();

  const region =
    country === "" || CONSENT_REQUIRED_COUNTRIES.has(country) ? "eu" : "other";

  const response = NextResponse.next();
  response.cookies.set("ptb_region", region, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|robots.txt|sitemap.xml|ads.txt|og-image.png|icons/).*)",
  ],
};
