/* eslint-disable @next/next/no-head-element -- AdSense requires its tag in the document head. */

import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./Providers";
import { ConsentAwareScripts } from "./ConsentAwareScripts";
import { CookieConsent } from "./CookieConsent";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { WebVitalsTracker } from "./WebVitalsTracker";
import { KoFiButton } from "./monetization/Ads";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface SiteShellProps {
  lang: "en" | "es";
  jsonLd: Record<string, unknown>;
  children: React.ReactNode;
}

export function SiteShell({ lang, jsonLd, children }: SiteShellProps) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          id="adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ConsentAwareScripts />
        <AnalyticsTracker />
        <WebVitalsTracker />
        <KoFiButton />
        <Providers initialLang={lang}>
          <Navbar />
          <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
            <Footer />
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
