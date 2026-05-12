import type { Metadata } from "next";
import ConfigurarPageClient from "./configurar-page-client";

export const metadata: Metadata = {
  title: "Generate Competitive Pokemon Teams",
  description:
    "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose formats, templates and strategies.",
  keywords: [
    "pokemon team generator",
    "pokemon showdown team builder",
    "gen 9 ou team generator",
    "vgc team generator",
    "competitive pokemon teams",
  ],
  alternates: {
    canonical: "/configurar",
  },
  openGraph: {
    title: "Generate Competitive Pokemon Teams",
    description:
      "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more.",
    url: "/configurar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generate Competitive Pokemon Teams",
    description:
      "Configure and generate optimized Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more.",
  },
};

export default function ConfigurarPage() {
  return <ConfigurarPageClient />;
}
