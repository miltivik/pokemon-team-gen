import { notFound } from "next/navigation";
import { FORMATS, type FormatId } from "@/config/formats";
import DynamicGuidePageClient from "./guide-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(FORMATS).map((format) => ({ format }));
}

export default async function DynamicGuidePage({
  params,
}: {
  params: Promise<{ format: string }>;
}) {
  const { format } = await params;
  if (!FORMATS[format as FormatId]) {
    notFound();
  }

  return <DynamicGuidePageClient format={format as FormatId} />;
}
