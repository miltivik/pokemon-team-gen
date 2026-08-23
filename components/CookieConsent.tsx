"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_CATEGORY_INFO,
  getConsentCategoryCopy,
  getConsentCategories,
  getConsentUiCopy,
  getGranularConsent,
  isConsentRequiredRegion,
  setConsent,
  setGranularConsent,
  type ConsentCategory,
} from "@/lib/consent";
import type { GranularConsent } from "@/lib/consent";
import { useTranslation } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="switch"]';

export function CookieConsent() {
  const { lang } = useTranslation();
  const copy = getConsentUiCopy(lang);
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
    setVisible(isPending && isConsentRequiredRegion());
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

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) handleRejectAll();
      }}
    >
      {visible && (
        <DialogContent
          showCloseButton={false}
          role="dialog"
          aria-modal="true"
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const content = event.currentTarget as HTMLElement;
            content.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
          }}
          onCloseAutoFocus={() => undefined}
          className="mx-4 w-[calc(100%-2rem)] max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
        >
          <DialogTitle className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {showSettings ? copy.settings : copy.title}
          </DialogTitle>
          <DialogDescription className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            {showSettings ? (
              copy.settingsDescription
            ) : (
              <>
                {copy.description}{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
                  {copy.learnMore}
                </Link>
                .
              </>
            )}
          </DialogDescription>

          {!showSettings ? (
            <>
              <div className="mb-6 space-y-3">
                {getConsentCategories().map((category) => {
                  const categoryCopy = getConsentCategoryCopy(category, lang);
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {categoryCopy.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {categoryCopy.description}
                        </p>
                      </div>
                      <Switch
                        checked={consent[category]}
                        onCheckedChange={() => handleToggle(category)}
                        aria-label={copy.enableCategory(categoryCopy.name)}
                        className="!h-6 !w-11"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowSettings(true)}
                  className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {copy.customize}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {copy.reject}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {copy.accept}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                {getConsentCategories().map((category) => {
                  const categoryCopy = getConsentCategoryCopy(category, lang);
                  return (
                    <div
                      key={category}
                      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                    >
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
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {copy.back}
                </button>
                <button
                  onClick={() => handleSaveSettings(consent)}
                  className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {copy.save}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
