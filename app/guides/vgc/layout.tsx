import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "VGC Guide, Regulation F Teams and Doubles Strategy",
  description:
    "Improve at VGC with regulation guides, doubles strategy, top Pokemon, speed control tips, and team building ideas based on competitive data.",
  keywords: [
    "vgc guide",
    "best vgc teams",
    "pokemon doubles strategy",
    "regulation f guide",
    "pikalytics vgc",
  ],
  alternates: {
    canonical: "/guides/vgc",
  },
};

export default function VGCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "VGC Guide", item: "/guides/vgc" },
        ]}
      />
      {children}
    </>
  );
}
