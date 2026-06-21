import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AnalisisPageClient } from "./analisis-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export const metadata: Metadata = {
  title: "Team Analysis and Strategy",
  description:
    "Analyze your competitive Pokemon team coverage, weaknesses, and strategy. Get insights for early, mid and late game.",
  keywords: [
    "pokemon team analysis",
    "team weakness checker",
    "competitive strategy",
    "pokemon coverage",
  ],
  alternates: {
    canonical: "/analisis",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Team Analysis and Strategy",
    description:
      "Analyze your competitive Pokemon team coverage, weaknesses, and strategy.",
    url: "/analisis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Analysis and Strategy",
    description:
      "Analyze your competitive Pokemon team coverage, weaknesses, and strategy.",
  },
};

export default async function AnalisisPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <AnalisisPageClient expectsTeam={expectsTeam} />;
}
