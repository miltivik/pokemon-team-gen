import type { Metadata } from "next";
import { TeamBuilderLandingPage } from "@/components/seo/TeamBuilderLandingPage";
import { getTeamBuilderLanding, getTeamBuilderLandingMetadata } from "@/config/team-builder-landings";

const landing = getTeamBuilderLanding("/gen-9-ou-team-builder");

export const metadata: Metadata = getTeamBuilderLandingMetadata(landing);

export default function Gen9OUTeamBuilderPage() {
  return <TeamBuilderLandingPage landing={landing} />;
}
