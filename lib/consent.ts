const CONSENT_KEY = "ptb_cookie_consent";

export type ConsentCategory = "analytics";

export type ConsentState = "granted" | "denied" | "pending";

export interface GranularConsent {
  analytics: boolean;
  timestamp: number;
}

const DEFAULT_CONSENT: GranularConsent = {
  analytics: false,
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

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") return stored;
  const consent = getGranularConsent();
  if (!consent.timestamp) return "pending";
  return consent.analytics ? "granted" : "denied";
}

export function getGranularConsent(): GranularConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return DEFAULT_CONSENT;
  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        analytics: Boolean(parsed.analytics),
        timestamp: Number(parsed.timestamp) || 0,
      };
    }
  } catch {
    // Invalid JSON, return default
  }
  if (stored === "granted") {
    return { analytics: true, timestamp: Date.now() };
  }
  if (stored === "denied") {
    return { analytics: false, timestamp: Date.now() };
  }
  return DEFAULT_CONSENT;
}

export function hasConsent(category: ConsentCategory): boolean {
  const consent = getGranularConsent();
  return consent[category] === true;
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const analytics = state === "granted";
  if (state === "pending") {
    localStorage.removeItem(CONSENT_KEY);
  } else {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, timestamp: Date.now() }));
  }
  updateAnalyticsConsent(analytics);
  window.dispatchEvent(new Event("consentChanged"));
}

export function setGranularConsent(consent: GranularConsent): void {
  if (typeof window === "undefined") return;
  const storedConsent = { ...consent, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(storedConsent));
  updateAnalyticsConsent(storedConsent.analytics);
  window.dispatchEvent(new Event("consentChanged"));
}

export function getConsentCategories(): ConsentCategory[] {
  return ["analytics"];
}

export const CONSENT_CATEGORY_INFO: Record<ConsentCategory, { name: string; description: string; cookies: string[] }> = {
  analytics: {
    name: "Analytics",
    description: "Help us understand how visitors interact with our website.",
    cookies: ["_ga", "_gid", "_gat", "_utma", "_utmb", "_utmc"],
  },
};
