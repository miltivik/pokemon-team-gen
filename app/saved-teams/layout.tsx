import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Equipos Guardados",
  description: "Visualiza, edita o exporta todos tus equipos Pokémon competitivos previamente generados. Administra tus estrategias favoritas localmente.",
  robots: "noindex, follow",
};

export default function SavedTeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
