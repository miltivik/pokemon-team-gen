import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Pokemon Team Generator Works",
  description:
    "Learn how Pokemon Team Generator builds competitive teams using Smogon and Pikalytics data, format rules, synergy checks, and Pokemon Showdown-ready exports.",
  keywords: [
    "how pokemon team generator works",
    "pokemon showdown team generator algorithm",
    "competitive pokemon team builder",
    "smogon pikalytics team generator",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "How Pokemon Team Generator Works",
    description:
      "Learn how Pokemon Team Generator builds competitive teams using Smogon and Pikalytics data, format rules, synergy checks, and Pokemon Showdown-ready exports.",
    url: "/about",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Pokemon Team Generator Works",
    description:
      "Learn how Pokemon Team Generator builds competitive teams using Smogon and Pikalytics data, format rules, synergy checks, and Pokemon Showdown-ready exports.",
    images: ["/og-image.png"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
