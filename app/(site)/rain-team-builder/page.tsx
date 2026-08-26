import type { Metadata } from "next";
import { TeamBuilderLandingPage } from "@/components/seo/TeamBuilderLandingPage";
import { getTeamBuilderLanding, getTeamBuilderLandingMetadata } from "@/config/team-builder-landings";

const landing = getTeamBuilderLanding("/rain-team-builder");

export const metadata: Metadata = getTeamBuilderLandingMetadata(landing);

export default function RainTeamBuilderPage() {
  return <TeamBuilderLandingPage landing={landing} />;
}
