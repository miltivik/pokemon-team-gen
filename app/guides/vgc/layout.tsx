import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "VGC Doubles Guide and Legacy Regulation F Strategy",
  description:
    "Learn general VGC doubles strategy with speed control and team building tips, plus clearly labeled archived Regulation F data.",
  keywords: [
    "vgc guide",
    "best vgc teams",
    "pokemon doubles strategy",
    "legacy regulation f guide",
    "pikalytics vgc",
  ],
  alternates: {
    canonical: "/guides/vgc",
  },
  openGraph: {
    title: "VGC Doubles Guide and Legacy Regulation F Strategy",
    description:
      "Learn general VGC doubles strategy with speed control and team building tips, plus clearly labeled archived Regulation F data.",
    url: "/guides/vgc",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VGC Doubles Guide and Legacy Regulation F Strategy",
    description:
      "Learn general VGC doubles strategy with speed control and team building tips, plus clearly labeled archived Regulation F data.",
    images: ["/og-image.png"],
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
