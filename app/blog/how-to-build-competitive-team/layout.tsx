import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Build a Competitive Pokemon Team",
  description:
    "Learn how to build a competitive Pokemon team step by step, from format choice and team roles to coverage, speed tiers, and win conditions.",
  keywords: [
    "how to build a competitive pokemon team",
    "pokemon team building guide",
    "pokemon showdown team builder guide",
    "competitive pokemon beginner guide",
    "pokemon team roles",
  ],
  alternates: {
    canonical: "/blog/how-to-build-competitive-team",
  },
  openGraph: {
    title: "How to Build a Competitive Pokemon Team",
    description:
      "Learn how to build a competitive Pokemon team step by step, from format choice and team roles to coverage, speed tiers, and win conditions.",
    url: "/blog/how-to-build-competitive-team",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build a Competitive Pokemon Team",
    description:
      "Learn how to build a competitive Pokemon team step by step, from format choice and team roles to coverage, speed tiers, and win conditions.",
    images: ["/og-image.png"],
  },
};

export default function HowToBuildCompetitiveTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
