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
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
