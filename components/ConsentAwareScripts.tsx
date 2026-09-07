"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent, type ConsentCategory } from "@/lib/consent";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";

export function useCategoryConsent(category: ConsentCategory) {
  const [hasCatConsent, setHasCatConsent] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Consent is browser-only state read after hydration.
    setHasCatConsent(hasConsent(category));
    const handleConsentChange = () => setHasCatConsent(hasConsent(category));
    window.addEventListener("consentChanged", handleConsentChange);
    return () => window.removeEventListener("consentChanged", handleConsentChange);
  }, [category]);

  return hasCatConsent;
}

function AdSenseLoader() {
  const hasAdvertising = useCategoryConsent("advertising");

  if (!hasAdvertising) return null;

  return (
    <Script
      id="adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

export function GA4Loader() {
  const hasAnalytics = useCategoryConsent("analytics");
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!hasAnalytics || !gaId) return null;

  return (
    <>
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { page_path: window.location.pathname, send_page_view: false });
            window.dispatchEvent(new Event('gtagReady'));
          `,
        }}
      />
    </>
  );
}

export function ConsentAwareScripts() {
  return (
    <>
      <AdSenseLoader />
      <GA4Loader />
    </>
  );
}
