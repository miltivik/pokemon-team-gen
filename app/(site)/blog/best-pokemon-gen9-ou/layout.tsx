import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Pokemon for Gen 9 OU in 2026",
  description:
    "See the best Pokemon for Gen 9 OU in 2026, why they dominate the metagame, and how to build stronger Pokemon Showdown teams around them.",
  keywords: [
    "best pokemon gen 9 ou",
    "gen 9 ou viability",
    "pokemon showdown ou guide",
    "top ou pokemon 2026",
    "gen 9 ou team building",
  ],
  alternates: {
    canonical: "/blog/best-pokemon-gen9-ou",
  },
  openGraph: {
    title: "Best Pokemon for Gen 9 OU in 2026",
    description:
      "See the best Pokemon for Gen 9 OU in 2026, why they dominate the metagame, and how to build stronger Pokemon Showdown teams around them.",
    url: "/blog/best-pokemon-gen9-ou",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Pokemon for Gen 9 OU in 2026",
    description:
      "See the best Pokemon for Gen 9 OU in 2026, why they dominate the metagame, and how to build stronger Pokemon Showdown teams around them.",
    images: ["/og-image.png"],
  },
};

export default function BestPokemonGen9OuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
