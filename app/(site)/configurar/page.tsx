import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import ConfigurarPageClient from "./configurar-page-client";

export const metadata: Metadata = {
  title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
  description:
    "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
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
    title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
    description:
      "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
    url: "/configurar",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
    description:
      "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
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
