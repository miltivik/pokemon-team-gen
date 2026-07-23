import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Gen 9 OU Guide, Meta Picks and Team Building Tips",
  description:
    "Learn the Gen 9 OU metagame with top Pokemon, sample cores, team building tips, and competitive Pokemon Showdown strategy for the current Smogon format.",
  keywords: [
    "gen 9 ou guide",
    "best pokemon gen 9 ou",
    "smogon ou teams",
    "pokemon showdown ou guide",
    "gen 9 ou team building",
  ],
  alternates: {
    canonical: "/guides/gen9-ou",
  },
  openGraph: {
    title: "Gen 9 OU Guide, Meta Picks and Team Building Tips",
    description:
      "Learn the Gen 9 OU metagame with top Pokemon, sample cores, team building tips, and competitive Pokemon Showdown strategy for the current Smogon format.",
    url: "/guides/gen9-ou",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gen 9 OU Guide, Meta Picks and Team Building Tips",
    description:
      "Learn the Gen 9 OU metagame with top Pokemon, sample cores, team building tips, and competitive Pokemon Showdown strategy for the current Smogon format.",
    images: ["/og-image.png"],
  },
};

export default function Gen9OULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Gen 9 OU Guide", item: "/guides/gen9-ou" },
        ]}
      />
      {children}
    </>
  );
}
