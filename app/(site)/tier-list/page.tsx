import { getTierOverview } from "@/lib/meta-analysis";
import TierListPageClient from "./tier-list-page-client";

export const revalidate = 3600;

export default async function TierListPage() {
  const overview = await getTierOverview("gen9ou").catch(() => null);
  const initialTierData = Object.fromEntries(
    Object.entries(overview?.tierGroups ?? {}).map(([tier, entries]) => [
      tier,
      entries.map(({ name, usage }) => ({ name, usage })),
    ])
  );

  return <TierListPageClient initialTierData={initialTierData} />;
}
