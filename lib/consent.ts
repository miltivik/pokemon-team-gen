const CONSENT_KEY = "ptb_cookie_consent";
const REGION_COOKIE = "ptb_region";

export type ConsentCategory = "analytics" | "advertising";

export type ConsentState = "granted" | "denied" | "pending";

export interface GranularConsent {
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

const DEFAULT_CONSENT: GranularConsent = {
  analytics: false,
  advertising: false,
  timestamp: 0,
};

function updateAnalyticsConsent(granted: boolean): void {
  const gtag = window.gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }
}

/**
 * Whether the visitor is in a region where cookie consent is legally
 * required (EEA, UK, Switzerland). Resolved from the geo cookie set by
 * middleware from Cloudflare/Vercel request headers. Unknown regions
 * default to consent-required (privacy-conservative).
 */
export function isConsentRequiredRegion(): boolean {
  if (typeof window === "undefined") return true;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${REGION_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) === "eu" : true;
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  if (!isConsentRequiredRegion()) return "granted";
  const consent = getGranularConsent();
  if (!consent.timestamp) return "pending";
  return consent.analytics || consent.advertising ? "granted" : "denied";
}

export function getGranularConsent(): GranularConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return DEFAULT_CONSENT;
  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null) {
      // GDPR migration: consent stored before the "advertising" category
      // existed was never informed about ad purposes, so it cannot cover
      // them. Treat it as absent — the banner will ask again.
      if (!("advertising" in parsed)) return DEFAULT_CONSENT;
      return {
        analytics: Boolean(parsed.analytics),
        advertising: Boolean(parsed.advertising),
        timestamp: Number(parsed.timestamp) || 0,
      };
    }
  } catch {
    // Invalid JSON, return default
  }
  if (stored === "granted") {
    // Legacy all-accepted string from before granular consent: same GDPR
    // reasoning, ask again for the new advertising purpose.
    return DEFAULT_CONSENT;
  }
  if (stored === "denied") {
    return { analytics: false, advertising: false, timestamp: Date.now() };
  }
  return DEFAULT_CONSENT;
}

export function hasConsent(category: ConsentCategory): boolean {
  // Outside consent-required regions (EEA/UK/CH) no opt-in is needed, so
  // ads and analytics serve without the banner.
  if (!isConsentRequiredRegion()) return true;
  const consent = getGranularConsent();
  return consent[category] === true;
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  if (state === "pending") {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event("consentChanged"));
    return;
  }
  const granted = state === "granted";
  setGranularConsent({
    analytics: granted,
    advertising: granted,
  });
}

export function setGranularConsent(consent: Omit<GranularConsent, "timestamp">): void {
  if (typeof window === "undefined") return;
  const storedConsent = { ...consent, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(storedConsent));
  updateAnalyticsConsent(storedConsent.analytics);
  window.dispatchEvent(new Event("consentChanged"));
}

export function getConsentCategories(): ConsentCategory[] {
  return ["analytics", "advertising"];
}

export const CONSENT_CATEGORY_INFO: Record<ConsentCategory, { name: string; description: string; cookies: string[] }> = {
  analytics: {
    name: "Analytics",
    description: "Help us understand how visitors interact with our website.",
    cookies: ["_ga", "_gid", "_gat", "_utma", "_utmb", "_utmc"],
  },
  advertising: {
    name: "Advertising",
    description:
      "Enables personalized ads through Google AdSense. Denying this keeps the site free of ad scripts and ad cookies.",
    cookies: ["__gads", "__gpi", "IDE", "test_cookie"],
  },
};
