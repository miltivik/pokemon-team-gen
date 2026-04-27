import type { ReactNode } from "react";
import { AdBanner, AdHero, AdInline, AdResponsive } from "@/components/monetization/Ads";

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

function SkeletonPill({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

function ShellFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export function AnalysisPageSkeleton() {
  return (
    <ShellFrame>
      <section className="w-full flex justify-center">
        <AdHero />
      </section>

      <div className="mb-2 flex w-full max-w-5xl justify-start">
        <SkeletonPill className="h-10 w-36" />
      </div>

      <section className="mx-auto w-full max-w-5xl space-y-10">
        <div className="space-y-3 text-center">
          <SkeletonBlock className="mx-auto h-10 w-56" />
          <SkeletonBlock className="mx-auto h-5 w-48" />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="mt-4 h-8 w-72" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonBlock className="mx-auto h-7 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-56 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} className="h-64 w-full" />
          ))}
        </div>
      </section>

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>
    </ShellFrame>
  );
}

export function ExportPageSkeleton() {
  return (
    <ShellFrame>
      <section className="w-full flex justify-center">
        <AdHero />
      </section>

      <div className="flex w-full max-w-4xl justify-start">
        <SkeletonPill className="h-9 w-36" />
      </div>

      <header className="w-full max-w-2xl space-y-4 text-center">
        <SkeletonBlock className="mx-auto h-10 w-40" />
        <SkeletonBlock className="mx-auto h-5 w-80 max-w-full" />
      </header>

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>

      <div className="w-full max-w-2xl space-y-6">
        <SkeletonBlock className="h-96 w-full" />
        <SkeletonBlock className="h-44 w-full" />
      </div>

      <AdInline />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <SkeletonPill className="h-10 w-32" />
        <SkeletonPill className="h-10 w-36" />
        <SkeletonPill className="h-10 w-40" />
      </div>

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>
    </ShellFrame>
  );
}

export function ConfigurarPageSkeleton() {
  return (
    <ShellFrame>
      <header className="flex min-h-28 w-full flex-col items-center justify-center space-y-4 text-center">
        <SkeletonBlock className="h-10 w-64 max-w-full" />
        <SkeletonBlock className="h-5 w-72 max-w-full" />
        <div className="flex min-h-8 items-center justify-center gap-2">
          <SkeletonPill className="h-8 w-20" />
          <SkeletonPill className="h-8 w-28" />
        </div>
      </header>

      <section className="w-full flex justify-center">
        <AdHero />
      </section>

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>

      <section className="w-full flex justify-center">
        <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-10 w-full" />
              <div className="flex flex-wrap gap-2 pt-2">
                <SkeletonPill className="h-8 w-24" />
                <SkeletonPill className="h-8 w-28" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <SkeletonPill className="h-6 w-11" />
            <SkeletonBlock className="h-4 w-48" />
          </div>

          <SkeletonBlock className="mt-6 h-11 w-full" />
        </div>
      </section>

      <AdInline />

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>

      <div className="flex min-h-14 w-full items-center justify-center pt-4">
        <SkeletonPill className="h-10 w-40" />
      </div>
    </ShellFrame>
  );
}

export function SavedTeamsPageSkeleton() {
  return (
    <ShellFrame>
      <section className="w-full flex justify-center">
        <AdResponsive />
      </section>

      <header className="w-full max-w-2xl space-y-4 text-center">
        <SkeletonBlock className="mx-auto h-10 w-56" />
        <SkeletonBlock className="mx-auto h-5 w-96 max-w-full" />
      </header>

      <div className="flex gap-4">
        <SkeletonPill className="h-10 w-40" />
      </div>

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>

      <div className="grid w-full max-w-4xl gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <SkeletonPill className="h-6 w-56" />
                <SkeletonBlock className="h-4 w-40" />
              </div>
              <div className="flex gap-2">
                <SkeletonPill className="h-9 w-9" />
                <SkeletonPill className="h-9 w-28" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: 6 }, (_, pillIndex) => (
                <SkeletonPill key={pillIndex} className="h-8 w-28" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AdInline />

      <section className="w-full flex justify-center py-4">
        <AdBanner />
      </section>
    </ShellFrame>
  );
}

export function TierListLoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl space-y-8" aria-hidden="true">
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, cardIndex) => (
              <div
                key={cardIndex}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <SkeletonBlock className="h-10 w-10 flex-shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
