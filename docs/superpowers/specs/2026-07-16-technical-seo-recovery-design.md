# Technical SEO Recovery Design

**Date:** 2026-07-16
**Status:** Approved for implementation planning
**Scope:** Technical P0/P1 recovery for the current English-first site

## Objective

Restore the site's existing SEO surface so search engines receive working Pokemon profile pages, a complete canonical sitemap, cacheable public HTML, and meaningful server-rendered content on the highest-value routes.

This release also removes inaccurate claims that VGC 2026 Regulation F is current. It does not implement Pokemon Champions Regulation M-B or introduce language-prefixed URLs.

## Verified Starting State

- `https://poketeambuilder.com/pokemon/garchomp` returns HTTP 500.
- The production sitemap contains 32 URLs and no `/pokemon/[name]` profiles.
- All 32 sitemap routes respond with `private, no-cache, no-store` because the root layout reads the language cookie.
- `/configurar` has no H1 in initial HTML; tier-list and guide data load after hydration.
- Homepage visible content is English while root description and social metadata are Spanish.
- Indexable pages describe Regulation F as the current VGC format.
- `https://www.poketeambuilder.com` fails at the CDN/TLS layer with HTTP 526.

## Design Decisions

### 1. Reuse the existing Pokemon set resolver

`getPokemonSets()` already performs case-insensitive lookup against the competitive set database. `hasCompetitiveData()` will delegate to it instead of performing its current exact-key check.

The existing consumers in the Pokemon index, `generateStaticParams()`, and the sitemap continue to call `hasCompetitiveData()`. This fixes the root cause once without introducing another name-normalization abstraction.

The existing ceiling of 300 Pokemon profile pages remains. Only profiles with summary and competitive-set data are eligible.

### 2. Make the public shell static and English-first

The root layout will stop reading `ptg_lang`. It will always emit English metadata and `<html lang="en">`, allowing Next.js to statically render and publicly cache routes that have no other dynamic dependency.

`LanguageProvider` will restore the saved language from `document.cookie` after hydration, update its React state, and synchronize `document.documentElement.lang`. The language switcher continues to write the same cookie.

This deliberately accepts a brief English-first render for returning Spanish users. Fully indexable Spanish content requires `/es/...` URLs and is outside this release.

### 3. Guarantee meaningful initial HTML

#### Configurator

The route will always render its H1, description, explanatory copy, and page structure. Hydration will gate only the state-dependent form controls. The client component remains responsible for URL parameters and team state.

#### Tier list

The route will gain a server wrapper that obtains the default Gen 9 OU data and passes serializable initial tier data to the existing interactive client view. Switching format and retrying remain client interactions.

If the upstream source is unavailable, the server renders useful evergreen copy and the current retry control instead of failing the route or returning only a skeleton.

#### Guides

The server route obtains the initial meta overview and passes it to `MetaOverview`. The component renders that initial payload immediately and uses its existing client request only when it needs to refresh.

The calculation currently embedded in the meta-overview API route will move to one shared server helper because it will have two consumers: the API and server-rendered pages.

### 4. Align metadata with the canonical audience

Homepage description, Open Graph, Twitter, and WebApplication JSON-LD will be English and consistent with the visible English page. Existing self-referencing canonicals remain unchanged.

Sitemap `lastModified` values will reflect the significant content update in this release. Google-ignored `priority` and `changeFrequency` fields are not expanded or made more complex.

### 5. Be explicit about legacy VGC support

The internal format identifier remains `gen9vgc2026f`; renaming it to Regulation M-B would imply rules and data the generator does not support.

Visible labels will identify Regulation F as legacy where the generator still exposes it. The VGC guide becomes evergreen, explains the current limitation honestly, and stops claiming that its pool is the current official regulation.

VGC 2026 articles whose core premise is outdated will become `noindex, follow` and leave the sitemap until they are substantively rewritten. Historical changelog entries remain unchanged.

### 6. Treat `www` as external infrastructure

The HTTP 526 occurs before Next.js receives the request. No application redirect can repair it.

The deployment owner must add `www.poketeambuilder.com` to the Vercel project, correct its DNS record, wait for a valid certificate, and configure a permanent redirect to the apex domain while preserving the path and query string.

## Data Flow

### Pokemon profiles

1. Summary names enter `hasCompetitiveData()`.
2. The existing case-insensitive set resolver finds the matching competitive record.
3. Up to 300 eligible slugs feed both static params and the sitemap.
4. Each generated profile resolves the same normalized summary and competitive sets at render time.

### Server-rendered meta data

1. A server route requests normalized Smogon data through the existing data source.
2. A shared pure helper builds tier groups, items, abilities, and threats.
3. The page serializes the initial result into its client component.
4. Later format changes use the existing API endpoint and replace the client state.

### Language restoration

1. Server sends canonical English HTML without reading cookies.
2. `LanguageProvider` hydrates with English.
3. After mount, it reads `ptg_lang`, changes state when necessary, and updates the HTML language attribute.
4. Manual language changes continue to persist the same cookie.

## Error Handling

- Missing Pokemon data returns the existing 404 path, never a server error.
- Upstream meta-stat failures render evergreen content plus retry controls.
- API failures keep their existing explicit HTTP error responses.
- Client language restoration treats an absent or invalid cookie as English.
- The build must not depend on live third-party data being available.

## Testing Strategy

Add one dependency-free Node SEO regression script using the existing project style. It will verify:

- case-insensitive competitive-data lookup for representative Pokemon;
- exactly 300 Pokemon sitemap entries with unique canonical URLs;
- representative multiword/form slugs resolve correctly;
- no indexable page labels Regulation F as current;
- homepage metadata uses English copy.

The implementation will follow red-green cycles: add each failing assertion, observe the expected failure, then make the minimum production change.

After implementation:

1. Run the SEO regression script.
2. Run existing generation, style, and type matrix scripts.
3. Run TypeScript with unused-local checks.
4. Run ESLint and distinguish pre-existing failures from new regressions.
5. Run `npm run build`.
6. Start the production build locally and inspect raw HTML without JavaScript.
7. Crawl the local sitemap and sample at least 20 Pokemon profiles.

## Acceptance Criteria

- Production build completes without `DYNAMIC_SERVER_USAGE` for Pokemon profiles.
- `/pokemon/garchomp`, `/pokemon/great-tusk`, and `/pokemon/ogerpon-wellspring` return 200 locally.
- Sitemap contains 300 unique Pokemon profile URLs, and a 20-URL sample has no non-200 responses.
- Public indexable routes no longer inherit global `private, no-store` solely from language selection.
- `/configurar` raw HTML contains one H1 and explanatory text.
- `/tier-list` raw HTML contains one H1 plus Pokemon names or a meaningful upstream fallback.
- `/guides/gen9-ou` and `/guides/vgc` raw HTML contain substantive content without requiring client JavaScript.
- Homepage title, description, Open Graph, Twitter, and JSON-LD are consistently English.
- No indexable page states or implies that Regulation F is the current official VGC regulation.
- The legacy Regulation F generator remains usable under its existing internal identifier.
- Git diff contains no unrelated cleanup or dependency additions.

## Out of Scope

- `/en` and `/es` URL migration, hreflang, or translated metadata.
- Pokemon Champions Regulation M-B legality, SP training, moves, formats, or generator support.
- New content clusters, backlink campaigns, author profiles, or Search Console configuration.
- Vercel, DNS, Cloudflare, or certificate mutations for `www`.
- Deploying, committing the implementation, or pushing without a separate user request.

## External Handoff for `www`

After application deployment, verify infrastructure with:

```powershell
curl.exe -sS -I https://www.poketeambuilder.com/
```

Success is HTTP 301 or 308 with `Location: https://poketeambuilder.com/`. Until DNS and TLS are corrected in Vercel/Cloudflare, this item remains externally blocked.
