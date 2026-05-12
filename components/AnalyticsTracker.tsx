"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "../lib/analytics";
import { getConsent } from "@/lib/consent";

export function AnalyticsTracker() {
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        const check = () => setHasConsent(getConsent() === "granted");
        check();
        window.addEventListener("consentChanged", check);
        return () => window.removeEventListener("consentChanged", check);
    }, []);

    if (!hasConsent) return null;

    return <AnalyticsTrackerInner />;
}

function AnalyticsTrackerInner() {
    useAnalytics();
    return null;
}
