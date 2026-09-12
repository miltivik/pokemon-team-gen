export const CONSENT_KEY = "ptb_cookie_consent";

export type ConsentCategory = "analytics";

export interface ConsentCategoryCopy {
  name: string;
  description: string;
}

export interface ConsentUiCopy {
  title: string;
  description: string;
  settingsDescription: string;
  learnMore: string;
  customize: string;
  reject: string;
  accept: string;
  settings: string;
  back: string;
  save: string;
  cookies: string;
  advertisingManagedByGoogle: string;
  manageGoogleAdvertising: string;
  enableCategory: (name: string) => string;
}

export type ConsentState = "granted" | "denied" | "pending";

export interface GranularConsent {
  analytics: boolean;
  timestamp: number;
}

const DEFAULT_CONSENT: GranularConsent = {
  analytics: false,
  timestamp: 0,
};

let sessionConsent: GranularConsent | undefined;

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
  const consent = getGranularConsent();
  if (!consent.timestamp) return "pending";
  return consent.analytics ? "granted" : "denied";
}

export function getGranularConsent(): GranularConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  if (sessionConsent) return sessionConsent;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return DEFAULT_CONSENT;
    if (stored === "denied") return { analytics: false, timestamp: 1 };
    if (stored === "granted") return DEFAULT_CONSENT;
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null) {
      if (
        typeof parsed.analytics !== "boolean" ||
        typeof parsed.timestamp !== "number" ||
        !Number.isFinite(parsed.timestamp) ||
        parsed.timestamp <= 0
      ) return DEFAULT_CONSENT;
      return {
        analytics: parsed.analytics,
        timestamp: parsed.timestamp,
      };
    }
  } catch {
    // Malformed or inaccessible storage must never grant consent.
  }
  return DEFAULT_CONSENT;
}

export function hasConsent(category: ConsentCategory): boolean {
  const consent = getGranularConsent();
  return consent[category] === true;
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  if (state === "pending") {
    sessionConsent = DEFAULT_CONSENT;
    try {
      localStorage.removeItem(CONSENT_KEY);
      sessionConsent = undefined;
    } catch {
      // Keep the pending choice in memory when browser storage is blocked.
    }
    notifyConsentChange();
    return;
  }
  const granted = state === "granted";
  setGranularConsent({ analytics: granted });
}

export function setGranularConsent(consent: Omit<GranularConsent, "timestamp">): void {
  if (typeof window === "undefined") return;
  const storedConsent = {
    analytics: consent.analytics === true,
    timestamp: Date.now(),
  };
  sessionConsent = storedConsent;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(storedConsent));
    sessionConsent = undefined;
  } catch {
    // A quota failure must not leave an older grant to be read after reload.
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // Storage may be completely unavailable; use the in-memory choice.
    }
  }
  notifyConsentChange();
}

function notifyConsentChange(): void {
  const consent = getGranularConsent();
  updateAnalyticsConsent(consent.analytics);
  // Unmounting next/script does not stop an already executed third-party script.
  const mustReload =
    !consent.analytics && document.getElementById("ga4-script");
  window.dispatchEvent(new Event("consentChanged"));
  if (mustReload) window.location.reload();
}

export function syncConsentFromStorage(event: StorageEvent): void {
  if (event.key !== CONSENT_KEY && event.key !== null) return;
  sessionConsent = undefined;
  notifyConsentChange();
}

export function openGoogleAdvertisingSettings(): boolean {
  if (typeof window === "undefined") return false;

  const googlefc = (
    window as Window & {
      googlefc?: { showRevocationMessage?: () => void };
    }
  ).googlefc;

  if (typeof googlefc?.showRevocationMessage === "function") {
    googlefc.showRevocationMessage();
    return true;
  }

  return false;
}

export function getConsentCategories(): ConsentCategory[] {
  return ["analytics"];
}

export const CONSENT_CATEGORY_INFO: Record<ConsentCategory, { name: string; description: string; cookies: string[] }> = {
  analytics: {
    name: "Analytics",
    description: "Help us understand how visitors interact with our website.",
    cookies: ["_ga", "_ga_*"],
  },
};

export function getConsentCategoryCopy(
  category: ConsentCategory,
  lang: "en" | "es"
): ConsentCategoryCopy {
  if (lang === "es") {
    return {
      name: "Analítica",
      description: "Ayúdanos a entender cómo interactúan los visitantes con el sitio web.",
    };
  }

  return {
    name: CONSENT_CATEGORY_INFO[category].name,
    description: CONSENT_CATEGORY_INFO[category].description,
  };
}

export function getConsentUiCopy(lang: "en" | "es"): ConsentUiCopy {
  if (lang === "es") {
    return {
      title: "Valoramos tu privacidad",
      description:
        "Elige si permites analítica. Google gestiona las preferencias de publicidad mediante su propio mensaje de privacidad. El almacenamiento del idioma y del tema es esencial y siempre está activo.",
      settingsDescription:
        "Administra tu consentimiento de analítica. Google gestiona las preferencias de publicidad mediante su propio mensaje de privacidad.",
      learnMore: "Más información en nuestra Política de privacidad",
      customize: "Personalizar ajustes",
      reject: "Rechazar analítica",
      accept: "Aceptar analítica",
      settings: "Configuración de cookies",
      back: "Volver",
      save: "Guardar preferencias",
      cookies: "Cookies",
      advertisingManagedByGoogle:
        "Las preferencias de publicidad de Google AdSense se gestionan mediante el mensaje de privacidad de Google.",
      manageGoogleAdvertising: "Gestionar preferencias de publicidad de Google",
      enableCategory: (name) => `Activar ${name}`,
    };
  }

  return {
    title: "We value your privacy",
    description:
      "Choose whether to allow analytics. Google manages advertising choices through its own privacy message. Language and theme storage are essential and always on.",
    settingsDescription:
      "Manage your analytics consent. Google manages advertising choices through its own privacy message.",
    learnMore: "Learn more in our Privacy Policy",
    customize: "Customize Settings",
    reject: "Reject Analytics",
    accept: "Accept Analytics",
    settings: "Cookie Settings",
    back: "Back",
    save: "Save Choices",
    cookies: "Cookies",
    advertisingManagedByGoogle:
      "Google AdSense advertising choices are managed through Google's Privacy & Messaging message.",
    manageGoogleAdvertising: "Manage Google advertising choices",
    enableCategory: (name) => `Enable ${name}`,
  };
}
