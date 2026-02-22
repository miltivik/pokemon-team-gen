import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawFormat = resolvedParams.format;

  // Create a nice display name like "Gen 9 OU" or "VGC 2026"
  let displayFormat = rawFormat
    .replace("-", " ")
    .replace("gen9", "Gen 9 ")
    .toUpperCase();

  if (rawFormat === "gen9-ou") displayFormat = "Gen 9 OU";
  if (rawFormat === "vgc") displayFormat = "VGC (Regulation F)";

  return {
    title: `Guía Competitiva: ${displayFormat}`,
    description: `Aprende a dominar el metajuego de ${displayFormat}. Mejores Pokémon, cores defensivos y ofensivos, counterplays y estrategias avanzadas recomendadas por expertos de Smogon y Pikalytics.`,
    keywords: [`guia ${displayFormat}`, `pokemon ${rawFormat}`, `mejores equipos ${displayFormat}`, `estrategias pokemon showdown`, `como jugar ${displayFormat}`],
  };
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
