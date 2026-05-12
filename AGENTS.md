# Agent Context: Pokemon Team Generator

## Project Overview

Pokemon Team Generator is a Next.js 16 web application that generates competitive Pokemon teams for Pokemon Showdown. It supports multiple formats (Gen 9 OU, VGC, UU, RU, NU, Monotype, Ubers) and provides team analysis, export, and strategy guides.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Runtime:** React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Fonts:** Geist (Vercel)
- **State:** React Context + cookies (i18n, team data)
- **Analytics:** Google Analytics 4 (optional via `NEXT_PUBLIC_GA_ID`)
- **Monetization:** Google AdSense (`ca-pub-7981415143867065`)
- **Deployment:** Vercel

## Key Directories

- `app/` – Next.js App Router pages and API routes
- `components/` – React components (ui/, home/, guides/, monetization/)
- `lib/` – Utility libraries, data sources, builders
- `config/` – Static config (formats, templates)
- `data/` – Raw data files
- `scripts/` – Build/utility scripts
- `.kilo/agent/` – Custom Kilo agents (e.g., seo-auditor)

## SEO & Traffic Context

- **Current baseline:** ~200 unique visitors/day
- **Primary keywords:** pokemon team generator, gen 9 ou team generator, pokemon showdown team builder, vgc team generator
- **Languages:** English (default) + Spanish (cookie-based, no URL prefix)
- **Content:** Blog (3 articles), Guides (Gen 9 OU, VGC), Tier List
- **Programmatic SEO (pSEO):**
  - `/pokemon/[name]` — 300+ individual Pokemon profile pages (stats, abilities, sets)
  - `/teams/[template]` — 14 team archetype pages (Rain, Hyper Offense, Stall, etc.)
  - `/pokemon` & `/teams` — index/hub pages
- **Structured data:** WebApplication (root), Article (blog posts), BreadcrumbList, FAQPage (guides), Pokemon profiles
- **Sitemap:** `app/sitemap.ts` — 330+ URLs including pSEO pages
- **Robots:** `app/robots.ts` ✅
- **Core Web Vitals:** Tracked via `web-vitals` library sent to GA4

## Build & Dev

```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build (standalone output)
npm run lint     # ESLint
```

## Agent Instructions

- Prefer editing existing files over creating new ones.
- Keep Next.js App Router conventions (Server Components by default, Client Components only when needed).
- When adding metadata to a Client Component page, create a wrapper Server Component (page.tsx) that exports metadata and renders the Client Component.
- Use `next/image` over `<img>` wherever possible.
- Maintain i18n support via `useTranslation` hook and `lib/i18n-shared.ts`.
- Update `sitemap.ts` when adding new routes.
- Use the `seo-auditor` agent for any SEO-related tasks.
