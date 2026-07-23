import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog and Updates",
  description:
    "Track Pokemon Team Generator updates, new features, SEO improvements, competitive format support, and major releases for the team builder.",
  keywords: [
    "pokemon team generator changelog",
    "pokemon showdown team builder updates",
    "competitive pokemon tool updates",
    "team generator release notes",
  ],
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "Pokemon Team Generator Changelog and Updates",
    description:
      "Track Pokemon Team Generator updates, new features, SEO improvements, competitive format support, and major releases for the team builder.",
    url: "/changelog",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokemon Team Generator Changelog and Updates",
    description:
      "Track Pokemon Team Generator updates, new features, SEO improvements, competitive format support, and major releases for the team builder.",
    images: ["/og-image.png"],
  },
};

export default function ChangelogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
