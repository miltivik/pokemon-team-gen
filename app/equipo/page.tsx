import type { Metadata } from "next";
import { cookies } from "next/headers";
import { EquipoPageClient } from "./equipo-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export const metadata: Metadata = {
  title: "Your Generated Pokemon Team",
  description:
    "View your generated competitive Pokemon team with movesets, EVs, items and strategy guide. Export to Pokemon Showdown.",
  keywords: [
    "pokemon team",
    "generated team",
    "pokemon showdown export",
    "competitive team analysis",
  ],
  alternates: {
    canonical: "/equipo",
  },
  openGraph: {
    title: "Your Generated Pokemon Team",
    description:
      "View your generated competitive Pokemon team with movesets, EVs, items and strategy guide.",
    url: "/equipo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Generated Pokemon Team",
    description:
      "View your generated competitive Pokemon team with movesets, EVs, items and strategy guide.",
  },
};

export default async function EquipoPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <EquipoPageClient expectsTeam={expectsTeam} />;
}
