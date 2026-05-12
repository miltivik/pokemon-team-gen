import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Rain Team Pokemon for Gen 9 OU",
  description:
    "Discover the best Rain team Pokemon in Gen 9 OU. From Drizzle setters to Swift Swim sweepers, build a dominant weather team for Pokemon Showdown.",
  keywords: [
    "rain team pokemon",
    "gen 9 ou rain",
    "pelipper rain team",
    "swift swim pokemon",
  ],
  alternates: {
    canonical: "/blog/best-rain-team-gen9-ou",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
