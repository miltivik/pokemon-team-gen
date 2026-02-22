import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de | Cómo funciona",
  description: "Conoce cómo funciona Pokemon Team Generator. Descubre cómo nuestro algoritmo analiza el meta de Smogon y Pikalytics para generar equipos Pokémon competitivos y balanceados.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
