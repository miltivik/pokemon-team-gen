import { cookies } from "next/headers";
import { AnalisisPageClient } from "./analisis-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export default async function AnalisisPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <AnalisisPageClient expectsTeam={expectsTeam} />;
}
