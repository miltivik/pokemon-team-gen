"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getGranularConsent, hasConsent, type ConsentCategory } from "@/lib/consent";

function useConsent() {
  const [consent, setConsent] = useState({
    analytics: false,
    advertising: false,
    preferences: false,
    timestamp: 0,
  });

  useEffect(() => {
    const update = () => setConsent(getGranularConsent());
    update();
    window.addEventListener("consentChanged", update);
    return () => window.removeEventListener("consentChanged", update);
  }, []);

  return consent;
}

function useCategoryConsent(category: ConsentCategory) {
  const [hasCatConsent, setHasCatConsent] = useState(false);

  useEffect(() => {
    setHasCatConsent(hasConsent(category));
    const handleConsentChange = () => setHasCatConsent(hasConsent(category));
    window.addEventListener("consentChanged", handleConsentChange);
    return () => window.removeEventListener("consentChanged", handleConsentChange);
  }, [category]);

  return hasCatConsent;
}

function AdSenseLoader() {
  return (
    <Script
      id="adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7981415143867065"
      crossOrigin="anonymous"
      strategy="afterInteractive"
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
            gtag('config', '${gaId}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}

export function InfolinksLoader() {
  const hasAdvertising = useCategoryConsent("advertising");
  if (!hasAdvertising) return null;

  return (
    <>
      <Script
        id="infolinks-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            var infolinks_pid = 3445165;
            var infolinks_wsid = 0;
          `,
        }}
      />
      <Script
        id="infolinks-main"
        strategy="lazyOnload"
        src="https://resources.infolinks.com/js/infolinks_main.js"
      />
    </>
  );
}

export function EzoicLoader() {
  const hasAdvertising = useCategoryConsent("advertising");
  const ezoicId = process.env.NEXT_PUBLIC_EZOIC_ID;

  if (!hasAdvertising || !ezoicId) return null;

  return (
    <Script
      id="ezoic-init"
      strategy="lazyOnload"
      src={`https://www.googletagmanager.com/gtag/js?id=${ezoicId}`}
    />
  );
}

export function ConsentAwareScripts() {
  const consent = useConsent();
  const hasAnalytics = consent.analytics;
  const hasAdvertising = consent.advertising;

  return (
    <>
      {hasAdvertising && <AdSenseLoader />}
      {hasAnalytics && <GA4Loader />}
      {hasAdvertising && <InfolinksLoader />}
      {hasAdvertising && <EzoicLoader />}
    </>
  );
}
