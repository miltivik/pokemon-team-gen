import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competitive Pokemon Blog, Guides and Team Building Tips",
  description:
    "Read competitive Pokemon guides, Gen 9 OU rankings, VGC strategy articles, and practical team building tips for Pokemon Showdown.",
  keywords: [
    "competitive pokemon blog",
    "pokemon showdown guides",
    "pokemon team building guide",
    "gen 9 ou guide",
    "vgc strategy guide",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Competitive Pokemon Blog, Guides and Team Building Tips",
    description:
      "Read competitive Pokemon guides, Gen 9 OU rankings, VGC strategy articles, and practical team building tips for Pokemon Showdown.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    title: "Competitive Pokemon Blog, Guides and Team Building Tips",
    description:
      "Read competitive Pokemon guides, Gen 9 OU rankings, VGC strategy articles, and practical team building tips for Pokemon Showdown.",
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
