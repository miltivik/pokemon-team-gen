"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "../lib/analytics";
import { hasConsent } from "@/lib/consent";

export function AnalyticsTracker() {
    const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

    useEffect(() => {
        const check = () => setAnalyticsAllowed(hasConsent("analytics"));
        check();
        window.addEventListener("consentChanged", check);
        return () => window.removeEventListener("consentChanged", check);
    }, []);

    if (!analyticsAllowed) return null;

    return <AnalyticsTrackerInner />;
}

function AnalyticsTrackerInner() {
    useAnalytics();
    return null;
}
