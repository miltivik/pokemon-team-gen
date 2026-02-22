import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía Competitiva: Gen 9 OU (OverUsed)",
  description: "Aprende a dominar el metajuego de Gen 9 OU en Pokémon Showdown. Descubre los mejores Pokémon, cores defensivos, amenazas ofensivas y estrategias de Smogon.",
  keywords: ["guia gen 9 ou", "pokemon ou", "smogon ou teams", "estrategias gen 9", "mejores pokemon ou"],
};

export default function Gen9OULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
