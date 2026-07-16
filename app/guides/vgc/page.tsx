import { CURRENT_VGC_FORMAT } from "@/config/formats";
import { getTierOverview } from "@/lib/meta-analysis";
import VGCGuideClient from "./vgc-guide-client";

export const revalidate = 3600;

export default async function VGCGuidePage() {
  const meta = await getTierOverview(CURRENT_VGC_FORMAT).catch(() => null);
  const initialData = meta ? { meta, combined: [] } : null;

  return <VGCGuideClient initialData={initialData} />;
}
