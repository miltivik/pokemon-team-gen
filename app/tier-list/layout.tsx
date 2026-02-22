import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tier List y Viability Rankings",
  description: "Explora las Tier Lists actualizadas de Pokemon Competitivo. Consulta estadísticas, rankings de viabilidad, y los Pokémon más jugados en el metajuego actual de Smogon y VGC.",
  keywords: ["pokemon tier list", "pokemon viability rankings", "gen 9 ou tier list", "vgc tier list", "mejores pokemon competitivos"],
};

export default function TierListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
