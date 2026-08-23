"use client";

import { useEffect } from "react";
import { hasConsent } from "@/lib/consent";

let trackingStarted = false;

function sendToAnalytics({
  name,
  value,
  rating,
  delta,
  id,
  navigationType,
}: {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType: string;
}) {
  if (!hasConsent("analytics")) return;

  const metricValue = Math.round(name === "CLS" ? value * 1000 : value);
  const metricDelta = Math.round(name === "CLS" ? delta * 1000 : delta);

  // Send to Google Analytics 4 if available
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag;
    if (gtag) {
      const eventParams: Record<string, string | number | boolean> = {
        event_category: "Web Vitals",
        value: metricDelta,
        metric_value: metricValue,
        metric_delta: metricDelta,
        event_label: rating,
        metric_id: id,
        navigation_type: navigationType,
        non_interaction: true,
      };
      gtag("event", name, eventParams);
    }
  }

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${name}:`, {
      value,
      rating,
      delta,
      id,
      navigationType,
    });
  }
}

export function WebVitalsTracker() {
  useEffect(() => {
    const startTracking = () => {
      if (trackingStarted || !hasConsent("analytics")) return;
      trackingStarted = true;

      void import("web-vitals")
        .then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
          onLCP(sendToAnalytics);
          onINP(sendToAnalytics);
          onCLS(sendToAnalytics);
          onTTFB(sendToAnalytics);
          onFCP(sendToAnalytics);
        })
        .catch(() => {
          trackingStarted = false;
        });
    };

    startTracking();
    window.addEventListener("consentChanged", startTracking);
    return () => window.removeEventListener("consentChanged", startTracking);
  }, []);

  return null;
}
