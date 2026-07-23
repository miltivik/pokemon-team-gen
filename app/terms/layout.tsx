import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the Pokemon Team Generator terms of service, acceptable use rules, intellectual property notice, and service limitations.",
  keywords: [
    "pokemon team generator terms of service",
    "pokemon showdown team builder terms",
    "competitive pokemon tool terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description:
      "Review the Pokemon Team Generator terms of service, acceptable use rules, intellectual property notice, and service limitations.",
    url: "/terms",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description:
      "Review the Pokemon Team Generator terms of service, acceptable use rules, intellectual property notice, and service limitations.",
    images: ["/og-image.png"],
  },
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
