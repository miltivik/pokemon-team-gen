import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

// Explicit editorial date. Never derived from new Date() at render time.
const ARTICLE_DATE_MODIFIED = "2026-08-13";

export const metadata: Metadata = {
  title: "VGC 2026 Reg I Team Building Guide for Pokemon Showdown",
  description:
    "Build VGC 2026 Reg I teams for Pokemon Showdown: doubles strategy, speed control, 2 restricted legendaries, unique items clause and no Mythical Pokemon.",
  keywords: [
    "vgc guide",
    "vgc 2026 reg i",
    "regulation i guide",
    "pokemon showdown vgc",
    "vgc team builder",
    "best vgc teams",
  ],
  alternates: {
    canonical: "/guides/vgc",
  },
  openGraph: {
    title: "VGC 2026 Reg I Team Building Guide for Pokemon Showdown",
    description:
      "Build VGC 2026 Regulation I teams for Pokemon Showdown: doubles strategy, restricted legendary rules, item clause and no mythical Pokemon.",
    url: "/guides/vgc",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VGC 2026 Reg I Team Building Guide for Pokemon Showdown",
    description:
      "Build VGC 2026 Regulation I teams for Pokemon Showdown: doubles strategy, restricted legendary rules, item clause and no mythical Pokemon.",
    images: ["/og-image.png"],
  },
};

export default function VGCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "VGC 2026 Reg I Team Building Guide for Pokemon Showdown",
    description:
      "Doubles team building for VGC 2026 Regulation I on Pokemon Showdown: speed control, archetypes, restricted legendary limits, item clause and no mythical Pokemon.",
    dateModified: ARTICLE_DATE_MODIFIED,
    author: { "@type": "Organization", name: "Pokemon Team Generator" },
    publisher: {
      "@type": "Organization",
      name: "Pokemon Team Generator",
      logo: {
        "@type": "ImageObject",
        url: "https://poketeambuilder.com/icons/logo-dark-nobg.png",
      },
    },
    image: "https://poketeambuilder.com/og-image.png",
    mainEntityOfPage: "https://poketeambuilder.com/guides/vgc",
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "VGC Guide", item: "/guides/vgc" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {children}
    </>
  );
}
