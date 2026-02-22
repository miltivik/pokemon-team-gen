import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurar Equipo",
  description: "Selecciona el formato competitivo, tu estilo de juego preferido (Hyper Offense, Balance, Stall, etc.) y elige a tu Pokémon favorito para generar un equipo a medida.",
  robots: "noindex, follow", // No need to heavily index the configuration form
};

export default function ConfigurarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
