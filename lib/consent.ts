const CONSENT_KEY = "ptb_cookie_consent";

export type ConsentCategory = "analytics" | "preferences";

export type ConsentState = "granted" | "denied" | "pending";

export interface GranularConsent {
  analytics: boolean;
  preferences: boolean;
  timestamp: number;
}

const DEFAULT_CONSENT: GranularConsent = {
  analytics: false,
  preferences: false,
  timestamp: 0,
};

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") return stored;
  const consent = getGranularConsent();
  if (!consent.timestamp) return "pending";
  return consent.analytics || consent.preferences ? "granted" : "denied";
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
        preferences: Boolean(parsed.preferences),
        timestamp: Number(parsed.timestamp) || 0,
      };
    }
  } catch {
    // Invalid JSON, return default
  }
  if (stored === "granted") {
    return { analytics: true, preferences: true, timestamp: Date.now() };
  }
  if (stored === "denied") {
    return { analytics: false, preferences: false, timestamp: Date.now() };
  }
  return DEFAULT_CONSENT;
}

export function hasConsent(category: ConsentCategory): boolean {
  const consent = getGranularConsent();
  return consent[category] === true;
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  if (state === "granted") {
    const consent: GranularConsent = {
      analytics: true,
      preferences: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } else if (state === "denied") {
    const consent: GranularConsent = {
      analytics: false,
      preferences: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } else {
    localStorage.removeItem(CONSENT_KEY);
  }
  window.dispatchEvent(new Event("consentChanged"));
}

export function setGranularConsent(consent: GranularConsent): void {
  if (typeof window === "undefined") return;
  consent.timestamp = Date.now();
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event("consentChanged"));
}

export function getConsentCategories(): ConsentCategory[] {
  return ["analytics", "preferences"];
}

export const CONSENT_CATEGORY_INFO: Record<ConsentCategory, { name: string; description: string; cookies: string[] }> = {
  analytics: {
    name: "Analytics",
    description: "Help us understand how visitors interact with our website.",
    cookies: ["_ga", "_gid", "_gat", "_utma", "_utmb", "_utmc"],
  },
  preferences: {
    name: "Preferences",
    description: "Remember your settings and preferences for future visits.",
    cookies: ["language", "theme", "timezone"],
  },
};
