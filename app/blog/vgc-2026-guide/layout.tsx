import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VGC 2026 Guide, Teams and Meta Strategies",
  description:
    "Master VGC 2026 with a practical guide to top teams, speed control, Trick Room, positioning, and the best doubles strategies.",
  keywords: [
    "vgc 2026 guide",
    "best vgc teams",
    "pokemon doubles strategy",
    "vgc meta guide",
    "pokemon vgc team building",
  ],
  alternates: {
    canonical: "/blog/vgc-2026-guide",
  },
  openGraph: {
    title: "VGC 2026 Guide, Teams and Meta Strategies",
    description:
      "Master VGC 2026 with a practical guide to top teams, speed control, Trick Room, positioning, and the best doubles strategies.",
    url: "/blog/vgc-2026-guide",
    type: "article",
  },
  twitter: {
    title: "VGC 2026 Guide, Teams and Meta Strategies",
    description:
      "Master VGC 2026 with a practical guide to top teams, speed control, Trick Room, positioning, and the best doubles strategies.",
  },
};

export default function Vgc2026GuideLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
