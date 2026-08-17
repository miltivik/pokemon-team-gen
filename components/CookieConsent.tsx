"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGranularConsent, getConsentCategories, setConsent, setGranularConsent, CONSENT_CATEGORY_INFO, type ConsentCategory } from "@/lib/consent";
import type { GranularConsent } from "@/lib/consent";
import { Switch } from "@/components/ui/switch";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsentState] = useState<GranularConsent>({
    analytics: false,
    advertising: false,
    timestamp: 0,
  });

  useEffect(() => {
    const stored = getGranularConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Consent is browser-only state read after hydration.
    setConsentState(stored);
    const isPending = stored.timestamp === 0;
    setVisible(isPending);
  }, []);

  useEffect(() => {
    const handleConsentChange = () => {
      setConsentState(getGranularConsent());
    };
    window.addEventListener("consentChanged", handleConsentChange);
    return () => window.removeEventListener("consentChanged", handleConsentChange);
  }, []);

  const handleAcceptAll = () => {
    setConsent("granted");
    setVisible(false);
  };

  const handleRejectAll = () => {
    setConsent("denied");
    setVisible(false);
  };

  const handleSaveSettings = (newConsent: GranularConsent) => {
    setGranularConsent(newConsent);
    setVisible(false);
  };

  const handleToggle = (category: ConsentCategory) => {
    setConsentState((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        {!showSettings ? (
          <>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              We value your privacy
            </h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Choose whether to allow analytics and personalized ads. Language and theme storage are essential and always on.{" "}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Learn more in our Privacy Policy
              </Link>
              .
            </p>

            <div className="mb-6 space-y-3">
              {getConsentCategories().map((category) => (
                <div key={category} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {CONSENT_CATEGORY_INFO[category].name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {CONSENT_CATEGORY_INFO[category].description}
                    </p>
                  </div>
                  <Switch
                    checked={consent[category]}
                    onCheckedChange={() => handleToggle(category)}
                    aria-label={`Enable ${CONSENT_CATEGORY_INFO[category].name}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Customize Settings
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Reject Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Accept Optional
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Cookie Settings
            </h2>
            <div className="mb-6 space-y-4">
              {getConsentCategories().map((category) => (
                <div key={category} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {CONSENT_CATEGORY_INFO[category].name}
                    </h3>
                    <Switch
                      checked={consent[category]}
                      onCheckedChange={() => handleToggle(category)}
                      aria-label={`Enable ${CONSENT_CATEGORY_INFO[category].name}`}
                    />
                  </div>
                  <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {CONSENT_CATEGORY_INFO[category].description}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Cookies: {CONSENT_CATEGORY_INFO[category].cookies.join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back
              </button>
                  <button
                    onClick={() => handleSaveSettings(consent)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Save Choices
                  </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
