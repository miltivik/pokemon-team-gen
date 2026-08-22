import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const ARTICLE_TITLE = "Gen 9 OU Guide, Meta Picks and Team Building Tips";
const ARTICLE_DESCRIPTION =
  "Learn the Gen 9 OU metagame with top Pokemon, sample cores, team building tips, and competitive Pokemon Showdown strategy for the current Smogon format.";
// Explicit editorial date. Never derive this from the render time.
const ARTICLE_DATE_MODIFIED = "2026-08-22";

export const metadata: Metadata = {
  title: ARTICLE_TITLE,
  description: ARTICLE_DESCRIPTION,
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
    title: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
    url: "/guides/gen9-ou",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function Gen9OULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
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
    mainEntityOfPage: "https://poketeambuilder.com/guides/gen9-ou",
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Gen 9 OU Guide", item: "/guides/gen9-ou" },
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
