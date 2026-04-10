import { cookies } from "next/headers";
import { ExportarPageClient } from "./exportar-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export default async function ExportarPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <ExportarPageClient expectsTeam={expectsTeam} />;
}
