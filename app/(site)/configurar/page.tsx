import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import ConfigurarPageClient from "./configurar-page-client";

export const metadata: Metadata = {
  title: "Team Generator Settings — Formats, Archetypes & Strategies | PokeTeamBuilder",
  description:
    "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose formats, templates and strategies.",
  keywords: [
    "pokemon team generator",
    "pokemon showdown team builder",
    "gen 9 ou team generator",
    "vgc team generator",
    "competitive pokemon teams",
  ],
  alternates: {
    canonical: "/configurar",
    languages: {
      en: "/configurar",
      es: "/es/configurar",
      "x-default": "/configurar",
    },
  },
  openGraph: {
    title: "Team Generator Settings — Formats, Archetypes & Strategies",
    description:
      "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more.",
    url: "/configurar",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Generator Settings — Formats, Archetypes & Strategies",
    description:
      "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more.",
    images: ["/og-image.png"],
  },
};

export default function ConfigurarPage() {
  return (
    <>
      <p className="container mx-auto px-4 pt-4 text-center text-sm text-blue-600 dark:text-blue-400">
        <Link href="/pokemon-showdown-team-builder" className="underline-offset-4 hover:underline">
          Learn how to use the Pokemon Showdown team builder
        </Link>
      </p>
      <Suspense fallback={<ConfigurarPageSkeleton />}>
        <ConfigurarPageClient />
      </Suspense>
    </>
  );
}
