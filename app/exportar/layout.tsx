import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Pokemon Showdown Team",
  description:
    "Copy or share your generated Pokemon Showdown team in export format. This page depends on your current generated team and is not indexed.",
  robots: "noindex, follow",
  alternates: {
    canonical: "/exportar",
  },
};

export default function ExportarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
