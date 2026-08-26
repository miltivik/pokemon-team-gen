"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { analytics } from "@/lib/analytics";

export function SeoLandingAnalytics({ landingPath }: { landingPath: string }) {
  useEffect(() => {
    analytics.viewSeoLanding(landingPath);
  }, [landingPath]);

  return null;
}

export function TrackedSeoLink({
  href,
  landingPath,
  children,
  className,
}: {
  href: string;
  landingPath: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => analytics.clickSeoLanding(landingPath, href)}
    >
      {children}
    </Link>
  );
}
