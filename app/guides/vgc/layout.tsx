import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía Competitiva: VGC (Regulation F)",
  description: "Aprende todo sobre VGC, el formato oficial de dobles de Pokémon. Estadísticas de Pikalytics, combinaciones core, speed tiers y estrategias para torneos oficiales.",
  keywords: ["guia vgc 2024", "pokemon vgc", "pikalytics vgc", "dobles pokemon", "equipos campeonato"],
};

export default function VGCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
