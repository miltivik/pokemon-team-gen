"use client";

import { useAnalytics } from "../lib/analytics";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
    const pathname = usePathname();

    // Use the analytics hook to track page views
    // This will automatically track page views on route changes
    useAnalytics();

    // Additional page view tracking on pathname change
    useEffect(() => {
        if (pathname) {
            console.log(`[Analytics] Page tracked: ${pathname}`);
        }
    }, [pathname]);

    // This component doesn't render anything
    return null;
}
