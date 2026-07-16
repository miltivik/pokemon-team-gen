import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top VGC 2026 Pokemon and Team Cores",
  description:
    "Explore the strongest Pokemon and cores dominating VGC 2026 Regulation F. From Flutter Mane to Incineroar, build winning doubles teams.",
  keywords: [
    "vgc 2026 pokemon",
    "best vgc pokemon",
    "vgc regulation f",
    "flutter mane vgc",
  ],
  alternates: {
    canonical: "/blog/top-vgc-2026-pokemon",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
