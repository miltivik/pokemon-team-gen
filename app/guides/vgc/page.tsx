import { CURRENT_VGC_FORMAT } from "@/config/formats";
import { getMetaOverview } from "@/lib/meta-analysis";
import VGCGuideClient from "./vgc-guide-client";

export const revalidate = 3600;

export default async function VGCGuidePage() {
  const initialData = await getMetaOverview(CURRENT_VGC_FORMAT, 6).catch(() => null);

  return <VGCGuideClient initialData={initialData} />;
}
