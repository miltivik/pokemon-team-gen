import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Pokemon Tier List and Viability Rankings",
  description:
    "Explore Pokemon tier lists, viability rankings, and usage stats for Gen 9 OU, VGC 2026, UU, Ubers, and Monotype based on the current competitive metagame.",
  keywords: [
    "pokemon tier list",
    "pokemon viability rankings",
    "gen 9 ou tier list",
    "vgc 2026 tier list",
    "pokemon usage stats",
  ],
  alternates: {
    canonical: "/tier-list",
  },
};

export default function TierListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Tier List", item: "/tier-list" },
        ]}
      />
      {children}
    </>
  );
}
