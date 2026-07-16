import { getTierOverview } from "@/lib/meta-analysis";
import Gen9OUGuideClient from "./gen9-ou-guide-client";

export const revalidate = 3600;

export default async function Gen9OUGuidePage() {
  const meta = await getTierOverview("gen9ou").catch(() => null);
  const initialData = meta ? { meta, combined: [] } : null;

  return <Gen9OUGuideClient initialData={initialData} />;
}
