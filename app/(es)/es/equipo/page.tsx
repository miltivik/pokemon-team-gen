import type { Metadata } from "next";
import { cookies } from "next/headers";
import { EquipoPageClient } from "@/app/(site)/equipo/equipo-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export const metadata: Metadata = {
  title: "Tu Equipo Pokémon Generado",
  description:
    "Consulta tu equipo Pokémon competitivo con movimientos, EVs, objetos y guía estratégica. Exporta el equipo a Pokémon Showdown.",
  alternates: {
    canonical: "/es/equipo",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Tu Equipo Pokémon Generado",
    description: "Consulta y exporta tu equipo competitivo para Pokémon Showdown.",
    url: "/es/equipo",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu Equipo Pokémon Generado",
    description: "Consulta y exporta tu equipo competitivo para Pokémon Showdown.",
    images: ["/og-image.png"],
  },
};

export default async function SpanishEquipoPage() {
  const cookieStore = await cookies();
  const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

  return <EquipoPageClient expectsTeam={expectsTeam} />;
}
