import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análisis de Debilidades",
  description: "Análisis exhaustivo de tu equipo competitivo. Descubre las vulnerabilidades de tipos, debilidades defensivas, capacidad ofensiva y consejos estratégicos.",
  robots: "noindex, follow",
};

export default function AnalisisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
