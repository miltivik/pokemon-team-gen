import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Pokemon Tier List and Viability Rankings",
  description:
    "Explore Pokemon tier lists, viability rankings, and usage stats for Gen 9 OU, UU, Ubers, Monotype, and archived VGC formats.",
  keywords: [
    "pokemon tier list",
    "pokemon viability rankings",
    "gen 9 ou tier list",
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
