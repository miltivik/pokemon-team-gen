import type { Metadata } from "next";
import { TeamBuilderLandingPage } from "@/components/seo/TeamBuilderLandingPage";
import { getTeamBuilderLanding, getTeamBuilderLandingMetadata } from "@/config/team-builder-landings";

const landing = getTeamBuilderLanding("/hyper-offense-team-builder");

export const metadata: Metadata = getTeamBuilderLandingMetadata(landing);

export default function HyperOffenseTeamBuilderPage() {
  return <TeamBuilderLandingPage landing={landing} />;
}
