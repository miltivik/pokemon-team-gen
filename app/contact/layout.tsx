import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Pokemon Team Generator for feedback, bug reports, feature requests, or questions about competitive Pokemon teams and Pokemon Showdown support.",
  keywords: [
    "contact pokemon team generator",
    "pokemon showdown team builder support",
    "report pokemon team generator bug",
    "pokemon competitive tool contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Pokemon Team Generator",
    description:
      "Contact Pokemon Team Generator for feedback, bug reports, feature requests, or questions about competitive Pokemon teams and Pokemon Showdown support.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    title: "Contact Pokemon Team Generator",
    description:
      "Contact Pokemon Team Generator for feedback, bug reports, feature requests, or questions about competitive Pokemon teams and Pokemon Showdown support.",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
