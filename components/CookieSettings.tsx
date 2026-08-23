"use client";

import { useState, useEffect } from "react";
import {
  getConsentCategoryCopy,
  getConsentCategories,
  getConsentUiCopy,
  getGranularConsent,
  setGranularConsent,
  CONSENT_CATEGORY_INFO,
  type ConsentCategory,
} from "@/lib/consent";
import type { GranularConsent } from "@/lib/consent";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface CookieSettingsProps {
  onClose?: () => void;
}

export function CookieSettings({ onClose }: CookieSettingsProps) {
  const { lang } = useTranslation();
  const copy = getConsentUiCopy(lang);
  const [consent, setConsentState] = useState<GranularConsent>({
    analytics: false,
    advertising: false,
    timestamp: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Consent is browser-only state read after hydration.
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
      <DialogTitle className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {copy.settings}
      </DialogTitle>
      <DialogDescription className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        {copy.settingsDescription}
      </DialogDescription>

      <div className="mb-6 space-y-4">
        {getConsentCategories().map((category) => {
          const categoryCopy = getConsentCategoryCopy(category, lang);
          return (
            <div key={category} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {categoryCopy.name}
                </h3>
                <Switch
                  checked={consent[category]}
                  onCheckedChange={() => handleToggle(category)}
                  aria-label={copy.enableCategory(categoryCopy.name)}
                  className="!h-6 !w-11"
                />
              </div>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                {categoryCopy.description}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {copy.cookies}: {CONSENT_CATEGORY_INFO[category].cookies.join(", ")}
              </p>
            </div>
          );
        })}
      </div>

      {saved && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400">
          {lang === "es" ? "Preferencias de cookies guardadas correctamente." : "Cookie choices saved successfully!"}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            onClick={onClose}
            className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {copy.back}
          </button>
        )}
        <button
          onClick={handleSave}
          className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {copy.save}
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        role="dialog"
        aria-modal="true"
        className="mx-4 w-[calc(100%-2rem)] max-w-lg border-0 bg-transparent p-0 shadow-none"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const content = event.currentTarget as HTMLElement;
          content.querySelector<HTMLElement>(
            'button:not([disabled]), [role="switch"]'
          )?.focus();
        }}
        onCloseAutoFocus={() => undefined}
      >
        <CookieSettings onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
