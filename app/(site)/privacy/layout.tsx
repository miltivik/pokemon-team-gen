import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Pokemon Team Generator privacy policy to understand how analytics, local storage, advertising, and browser-side team data are handled.",
  keywords: [
    "pokemon team generator privacy policy",
    "pokemon showdown team builder privacy",
    "local storage pokemon teams",
    "adsense privacy policy pokemon tool",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Read the Pokemon Team Generator privacy policy to understand how analytics, local storage, advertising, and browser-side team data are handled.",
    url: "/privacy",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description:
      "Read the Pokemon Team Generator privacy policy to understand how analytics, local storage, advertising, and browser-side team data are handled.",
    images: ["/og-image.png"],
  },
};

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
