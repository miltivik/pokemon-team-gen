# AdSense Readiness Design

**Date:** 2026-07-17

**Goal:** Prepare the existing SEO recovery branch for an AdSense review while preserving crawlable content, avoiding low-value ad placements, and using Google CMP for advertising consent.

## Scope

This change covers only repository behavior that can be verified locally:

- align Smogon fetch caching with the one-hour ISR policy used by the tier list and guides;
- make AdSense the only advertising network loaded by the application;
- let Google CMP own advertising consent while the existing banner retains the analytics choice;
- keep placeholder manual ad units disabled and rely on Auto Ads initially;
- update the privacy policy to describe the resulting behavior;
- add regression coverage for the cache and monetization rules.

Dokploy deployment, Cloudflare `www` TLS, Google CMP activation, Auto Ads page exclusions, and the AdSense review request remain external dashboard actions. They will be documented and verified from public HTTP responses where possible, but this repository will not attempt to automate those accounts.

## Architecture

### Smogon data caching

`SmogonDataSource` remains the single fetch path for Smogon statistics. Its three upstream requests will use Next.js revalidation with a 3600-second lifetime instead of `cache: "no-store"`. This matches the existing one-hour in-memory, disk, API, tier-list, and guide cache policy and prevents static pages from switching to dynamic behavior at runtime.

No new cache wrapper or abstraction will be added.

### Advertising scripts

`ConsentAwareScripts` will always render the AdSense loader so Google's Privacy & messaging CMP can run before an advertising choice exists. Infolinks and Ezoic loaders will be deleted. GA4 will continue to load only after analytics consent.

AdSense will be the only advertising provider in application code. The existing manual units will remain disabled because their slot IDs are placeholders. Initial monetization will use Auto Ads configured in AdSense.

### Consent ownership

Google CMP will own advertising consent and the TCF signal. The local consent model and banner will retain only `analytics`, controlling GA4 and Web Vitals. Language and theme persistence are essential storage and remain outside the optional consent model.

Legacy stored consent objects may contain an `advertising` property. Readers will ignore that extra property; no migration routine is needed.

The custom banner must not claim that it controls AdSense. The privacy policy will state that Google Privacy & messaging manages advertising consent where required, while the local settings control analytics only.

### Ad placement

No real manual slot IDs will be added. This avoids enabling ads on empty team states, loading skeletons, or interactive controls. Auto Ads page exclusions for `/equipo`, `/analisis`, `/exportar`, `/saved-teams`, and `/configurar` will be configured in the AdSense dashboard before review.

## Data flow

1. The initial HTML includes the AdSense account marker and AdSense loader.
2. Google CMP applies the region-specific advertising consent policy and TCF signal.
3. The local banner asks only for the analytics choice.
4. GA4 and Web Vitals read local analytics consent.
5. Auto Ads serves only on dashboard-approved content pages.

## Error handling

- Smogon failures continue to return the existing textual fallback without failing the route.
- Missing GA4 configuration continues to skip GA4.
- Placeholder manual slots continue to return `null`.
- Google CMP or Auto Ads dashboard misconfiguration cannot be repaired in code; the release checklist must detect it through account status and public verification.

## Testing

The existing SEO regression runner will gain checks that fail when:

- Smogon server fetches use `cache: "no-store"` instead of one-hour revalidation;
- Infolinks or Ezoic loaders remain in the application script path;
- AdSense is still gated by local advertising consent;
- the local consent category list still exposes advertising;
- the privacy policy claims the local banner blocks AdSense.

Verification will run the regression test against a production build, inspect server logs for static-to-dynamic errors, confirm 330 sitemap URLs and 300 working Pokemon profiles, run TypeScript and changed-file ESLint checks, and execute a production build.

## Acceptance criteria

- No `cache: "no-store"` remains in `lib/data-sources/smogon.ts`.
- Tier list and guide requests do not produce static-to-dynamic errors.
- Application code loads no Infolinks or Ezoic scripts.
- The local consent UI contains analytics only, not advertising.
- AdSense is present independently of local consent so Google CMP can render.
- Manual placeholder slots do not mount.
- Privacy copy matches the implementation.
- Existing SEO regression checks pass.
- Production build succeeds.

## External release gate

Before requesting AdSense review, the operator must:

1. Enable Google's certified European regulations message in AdSense Privacy & messaging.
2. Enable Auto Ads and exclude the five empty or interaction-heavy routes listed above.
3. Deploy the verified commit through Dokploy.
4. Configure a permanent `www` to apex redirect with a valid certificate.
5. Verify the public sitemap, profile responses, legacy VGC `noindex`, `ads.txt`, and CMP message.
6. Request review only after AdSense reports the site connection and `ads.txt` as valid.
