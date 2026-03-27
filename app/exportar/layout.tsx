import type { ReactNode } from "react";
import { TeamProvider } from "@/lib/team-context";

export default function ExportarLayout({ children }: { children: ReactNode }) {
    return <TeamProvider>{children}</TeamProvider>;
}
