import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ExportarPageClient } from "./exportar-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export const metadata: Metadata = {
  title: "Export to Pokemon Showdown",
  description:
    "Export your generated competitive Pokemon team directly to Pokemon Showdown format. Copy and paste ready teams.",
  keywords: [
    "pokemon showdown export",
    "export pokemon team",
    "showdown format",
    "competitive team export",
  ],
  alternates: {
    canonical: "/exportar",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Export to Pokemon Showdown",
    description:
      "Export your generated competitive Pokemon team directly to Pokemon Showdown format.",
    url: "/exportar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Export to Pokemon Showdown",
    description:
      "Export your generated competitive Pokemon team directly to Pokemon Showdown format.",
  },
};

export default async function ExportarPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <ExportarPageClient expectsTeam={expectsTeam} />;
}
