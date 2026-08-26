import type { Metadata } from "next";
import { TeamBuilderLandingPage } from "@/components/seo/TeamBuilderLandingPage";
import { getTeamBuilderLanding, getTeamBuilderLandingMetadata } from "@/config/team-builder-landings";

const landing = getTeamBuilderLanding("/vgc-team-builder");

export const metadata: Metadata = getTeamBuilderLandingMetadata(landing);

export default function VGCTeamBuilderPage() {
  return <TeamBuilderLandingPage landing={landing} />;
}
