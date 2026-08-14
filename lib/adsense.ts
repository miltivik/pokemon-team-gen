const DEFAULT_ADSENSE_PUBLISHER_ID = "ca-pub-7981415143867065";

export function normalizeAdsensePublisherId(value?: string | null): string {
  const publisherId = value?.trim() ?? "";

  if (/^ca-pub-\d+$/.test(publisherId)) {
    return publisherId;
  }

  if (/^pub-\d+$/.test(publisherId)) {
    return `ca-${publisherId}`;
  }

  return DEFAULT_ADSENSE_PUBLISHER_ID;
}

export function getAdsenseSlot(value?: string | null): string {
  return value?.trim() ?? "";
}

export const ADSENSE_PUBLISHER_ID = normalizeAdsensePublisherId(
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
);

export const ADSENSE_SLOTS = {
  banner: getAdsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER),
  display: getAdsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY),
};
