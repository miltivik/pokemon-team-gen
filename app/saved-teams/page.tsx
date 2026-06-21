import type { Metadata } from "next";
import SavedTeamsPageClient from "./saved-teams-page-client";

export const metadata: Metadata = {
  title: "Saved Teams",
  description:
    "Manage your saved competitive Pokemon teams. Load, edit and organize teams for different formats.",
  keywords: [
    "saved pokemon teams",
    "pokemon team storage",
    "manage teams",
    "competitive teams",
  ],
  alternates: {
    canonical: "/saved-teams",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Saved Teams",
    description:
      "Manage your saved competitive Pokemon teams. Load, edit and organize teams for different formats.",
    url: "/saved-teams",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Teams",
    description:
      "Manage your saved competitive Pokemon teams. Load, edit and organize teams for different formats.",
  },
};

export default function SavedTeamsPage() {
  return <SavedTeamsPageClient />;
}
