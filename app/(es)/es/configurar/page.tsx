import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import ConfigurarPageClient from "@/app/(site)/configurar/configurar-page-client";

const SPANISH_DESCRIPTION =
  "Configura y genera equipos Pokémon competitivos para Pokémon Showdown: Gen 9 OU, VGC, UU, RU, NU y más formatos. Elige formato, plantilla y estilo de juego.";
const SPANISH_TITLE = "Configurar Equipos Pokémon para Showdown | PokeTeamBuilder";

export const metadata: Metadata = {
  title: SPANISH_TITLE,
  description: SPANISH_DESCRIPTION,
  keywords: [
    "configurar equipo pokemon",
    "generador de equipos pokemon",
    "equipos pokemon competitivos",
    "crear equipo pokemon showdown",
    "mejores equipos pokemon gen 9",
    "vgc equipos pokemon",
  ],
  alternates: {
    canonical: "/es/configurar",
    languages: {
      en: "/configurar",
      es: "/es/configurar",
      "x-default": "/configurar",
    },
  },
  openGraph: {
    title: SPANISH_TITLE,
    description: SPANISH_DESCRIPTION,
    url: "/es/configurar",
    type: "website",
    locale: "es_ES",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: SPANISH_TITLE,
    description: SPANISH_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function ConfigurarSpanishPage() {
  return (
    <>
      <p
        lang="es"
        className="container mx-auto px-4 pt-4 text-center text-sm text-blue-600 dark:text-blue-400"
      >
        <Link href="/pokemon-showdown-team-builder" className="underline-offset-4 hover:underline">
          Aprende a usar el creador de equipos de Pokemon Showdown
        </Link>
      </p>
      <header
        lang="es"
        className="container mx-auto flex min-h-28 flex-col items-center justify-center space-y-4 px-4 pt-8 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Configuración del Generador
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Configura tus preferencias de equipo
        </p>
      </header>
      <Suspense
        fallback={
          <ConfigurarPageSkeleton
            title="Configuración del Generador"
            description="Configura tus preferencias de equipo"
            showHeading={false}
          />
        }
      >
        <ConfigurarPageClient initialLang="es" hideHeader />
      </Suspense>
      <section
        lang="es"
        aria-labelledby="configurar-seo-heading-es"
        className="container mx-auto max-w-4xl px-4 pb-12 pt-4"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2
            id="configurar-seo-heading-es"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
          >
            Configura tu equipo de Pokemon Showdown
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
            Elige un formato como Gen 9 OU o VGC, selecciona un arquetipo y
            ajusta el estilo de juego antes de generar un equipo legal de seis
            Pokemon. El creador aplica las reglas del formato y los datos de
            sets competitivos de las páginas de análisis.
          </p>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Elige un formato</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Empieza con las reglas que coinciden con tus combates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Selecciona un estilo</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Prueba Lluvia, Hiper Ofensiva, Stall, Equilibrado y otros núcleos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Exporta y prueba</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Exporta tu equipo a Pokemon Showdown y ajústalo después de probarlo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
