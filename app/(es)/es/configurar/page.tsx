import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import ConfigurarPageClient from "@/app/(site)/configurar/configurar-page-client";

const SPANISH_DESCRIPTION =
  "Configura y genera equipos Pokémon competitivos para Pokémon Showdown: Gen 9 OU, VGC, UU, RU, NU y más formatos. Elige formato, plantilla y estilo de juego.";

export const metadata: Metadata = {
  title: "Configurar y Generar Equipos Pokémon para Showdown | PokeTeamBuilder",
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
    title: "Configurar y Generar Equipos Pokémon para Showdown",
    description: SPANISH_DESCRIPTION,
    url: "/es/configurar",
    type: "website",
    locale: "es_ES",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Configurar y Generar Equipos Pokémon para Showdown",
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
      <Suspense
        fallback={
          <ConfigurarPageSkeleton
            title="Configuración del Generador"
            description="Configura tus preferencias de equipo"
          />
        }
      >
        <ConfigurarPageClient initialLang="es" />
      </Suspense>
    </>
  );
}
