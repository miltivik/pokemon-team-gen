import { cookies } from "next/headers";
import { EquipoPageClient } from "./equipo-page-client";
import { TEAM_PRESENCE_COOKIE_KEY } from "@/lib/team-storage";

export default async function EquipoPage() {
    const cookieStore = await cookies();
    const expectsTeam = cookieStore.get(TEAM_PRESENCE_COOKIE_KEY)?.value === "1";

    return <EquipoPageClient expectsTeam={expectsTeam} />;
}
