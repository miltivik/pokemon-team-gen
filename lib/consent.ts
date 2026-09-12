export const CONSENT_KEY = "ptb_cookie_consent";

export type ConsentCategory = "analytics" | "advertising";

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
  enableCategory: (name: string) => string;
}

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
  return consent.analytics || consent.advertising ? "granted" : "denied";
}

export function getGranularConsent(): GranularConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  if (sessionConsent) return sessionConsent;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return DEFAULT_CONSENT;
    if (stored === "denied") {
      return { analytics: false, advertising: false, timestamp: 1 };
    }
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null) {
      // GDPR migration: consent stored before the "advertising" category
      // existed was never informed about ad purposes, so it cannot cover
      // them. Treat it as absent — the banner will ask again.
      if (
        typeof parsed.analytics !== "boolean" ||
        typeof parsed.advertising !== "boolean" ||
        typeof parsed.timestamp !== "number" ||
        !Number.isFinite(parsed.timestamp) ||
        parsed.timestamp <= 0
      ) return DEFAULT_CONSENT;
      return {
        analytics: parsed.analytics,
        advertising: parsed.advertising,
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
  setGranularConsent({
    analytics: granted,
    advertising: granted,
  });
}

export function setGranularConsent(consent: Omit<GranularConsent, "timestamp">): void {
  if (typeof window === "undefined") return;
  const storedConsent = {
    analytics: consent.analytics === true,
    advertising: consent.advertising === true,
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
    (!consent.analytics && document.getElementById("ga4-script")) ||
    (!consent.advertising && document.getElementById("adsense"));
  window.dispatchEvent(new Event("consentChanged"));
  if (mustReload) window.location.reload();
}

export function syncConsentFromStorage(event: StorageEvent): void {
  if (event.key !== CONSENT_KEY && event.key !== null) return;
  sessionConsent = undefined;
  notifyConsentChange();
}

export function getConsentCategories(): ConsentCategory[] {
  return ["analytics", "advertising"];
}

export const CONSENT_CATEGORY_INFO: Record<ConsentCategory, { name: string; description: string; cookies: string[] }> = {
  analytics: {
    name: "Analytics",
    description: "Help us understand how visitors interact with our website.",
    cookies: ["_ga", "_ga_*"],
  },
  advertising: {
    name: "Advertising",
    description:
      "Allows Google AdSense to load. Rejecting stops future ad loading; withdrawing permission may reload the page. Google may require a separate certified consent message.",
    cookies: ["__gads", "__gpi", "IDE", "test_cookie"],
  },
};

export function getConsentCategoryCopy(
  category: ConsentCategory,
  lang: "en" | "es"
): ConsentCategoryCopy {
  if (lang === "es") {
    return category === "analytics"
      ? {
          name: "Analítica",
          description: "Ayúdanos a entender cómo interactúan los visitantes con el sitio web.",
        }
      : {
          name: "Publicidad",
          description:
            "Permite cargar Google AdSense. Rechazar impide nuevas cargas; retirar el permiso puede recargar la página. Google puede requerir un mensaje de consentimiento certificado adicional.",
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
        "Elige si permites analítica y publicidad. El almacenamiento del idioma y del tema es esencial y siempre está activo.",
      settingsDescription:
        "Administra tus preferencias de analítica y publicidad. El almacenamiento del idioma y del tema es esencial.",
      learnMore: "Más información en nuestra Política de privacidad",
      customize: "Personalizar ajustes",
      reject: "Rechazar opcionales",
      accept: "Aceptar opcionales",
      settings: "Configuración de cookies",
      back: "Volver",
      save: "Guardar preferencias",
      cookies: "Cookies",
      enableCategory: (name) => `Activar ${name}`,
    };
  }

  return {
    title: "We value your privacy",
    description:
      "Choose whether to allow analytics and advertising. Language and theme storage are essential and always on.",
    settingsDescription:
      "Manage your analytics and advertising consent. Language and theme storage are essential.",
    learnMore: "Learn more in our Privacy Policy",
    customize: "Customize Settings",
    reject: "Reject Optional",
    accept: "Accept Optional",
    settings: "Cookie Settings",
    back: "Back",
    save: "Save Choices",
    cookies: "Cookies",
    enableCategory: (name) => `Enable ${name}`,
  };
}
