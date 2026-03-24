import type { Metadata } from "next";
import { CURRENT_VGC_FORMAT, FORMATS, type FormatId } from "@/config/formats";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawFormat = resolvedParams.format;
  const formatDefinition = FORMATS[rawFormat as FormatId];
  const displayFormat = formatDefinition
    ? formatDefinition.label.replace(/^\[Gen \d+\]\s*/, "").trim()
    : rawFormat === "gen9-ou"
      ? "Gen 9 OU"
      : rawFormat === "vgc"
        ? `VGC ${CURRENT_VGC_FORMAT === "gen9vgc2026f" ? "2026 Reg F" : "Guide"}`
        : rawFormat.replace(/-/g, " ");
  const isCuratedGuide = rawFormat === "gen9-ou" || rawFormat === "vgc";

  return {
    title: `${displayFormat} Guide, Meta Trends and Team Building Tips`,
    description: `Learn the ${displayFormat} metagame with top threats, sample cores, matchup advice, and practical team building tips inspired by Smogon and Pikalytics data.`,
    keywords: [
      `${displayFormat} guide`,
      `${displayFormat} team building`,
      `${displayFormat} meta`,
      `pokemon showdown ${rawFormat}`,
      `best teams ${displayFormat}`,
    ],
    alternates: {
      canonical: `/guides/${rawFormat}`,
    },
    robots: isCuratedGuide ? undefined : {
      index: false,
      follow: true,
    },
  };
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
