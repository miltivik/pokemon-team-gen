import { getMetaOverview } from "@/lib/meta-analysis";
import Gen9OUGuideClient from "./gen9-ou-guide-client";

export const revalidate = 3600;

export default async function Gen9OUGuidePage() {
  const initialData = await getMetaOverview("gen9ou", 6).catch(() => null);

  return <Gen9OUGuideClient initialData={initialData} />;
}
