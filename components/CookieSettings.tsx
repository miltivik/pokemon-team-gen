"use client";

import { useState, useEffect } from "react";
import { getGranularConsent, setGranularConsent, CONSENT_CATEGORY_INFO, type ConsentCategory } from "@/lib/consent";
import type { GranularConsent } from "@/lib/consent";
import { Switch } from "@/components/ui/switch";

interface CookieSettingsProps {
  onClose?: () => void;
}

export function CookieSettings({ onClose }: CookieSettingsProps) {
  const [consent, setConsentState] = useState<GranularConsent>({
    analytics: false,
    advertising: false,
    preferences: false,
    timestamp: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConsentState(getGranularConsent());
  }, []);

  const handleToggle = (category: ConsentCategory) => {
    setConsentState((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setGranularConsent(consent);
    setSaved(true);
    if (onClose) onClose();
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Cookie Preferences
      </h2>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Manage your cookie preferences. You can change these settings at any time.
      </p>

      <div className="mb-6 space-y-4">
        {(["analytics", "advertising", "preferences"] as ConsentCategory[]).map((category) => (
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

      {saved && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400">
          Preferences saved successfully!
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="mx-4 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CookieSettings onClose={onClose} />
      </div>
    </div>
  );
}