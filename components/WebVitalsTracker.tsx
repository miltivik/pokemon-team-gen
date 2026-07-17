"use client";

import { useEffect } from "react";
import { onLCP, onINP, onCLS, onTTFB, onFCP } from "web-vitals";
import { hasConsent } from "@/lib/consent";

let trackingStarted = false;

function sendToAnalytics({ name, value, rating }: { name: string; value: number; rating: string }) {
  if (!hasConsent("analytics")) return;

  // Send to Google Analytics 4 if available
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag("event", name, {
        event_category: "Web Vitals",
        value: Math.round(name === "CLS" ? value * 1000 : value),
        event_label: rating,
        non_interaction: true,
      });
    }
  }

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${name}:`, { value, rating });
  }
}

export function WebVitalsTracker() {
  useEffect(() => {
    const startTracking = () => {
      if (trackingStarted || !hasConsent("analytics")) return;
      trackingStarted = true;

      onLCP(sendToAnalytics);
      onINP(sendToAnalytics);
      onCLS(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onFCP(sendToAnalytics);
    };

    startTracking();
    window.addEventListener("consentChanged", startTracking);
    return () => window.removeEventListener("consentChanged", startTracking);
  }, []);

  return null;
}
