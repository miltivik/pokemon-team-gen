import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu Equipo Generado",
  description: "Visualiza tu equipo Pokémon generado con movesets óptimos, spreads de EVs e ítems recomendados para Showdown.",
  robots: "noindex, follow", // Generated teams are dynamic client-side, don't index
};

export default function EquipoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
