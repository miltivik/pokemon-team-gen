import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./Providers";
import { ConsentAwareScripts } from "./ConsentAwareScripts";
import { CookieConsent } from "./CookieConsent";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { WebVitalsTracker } from "./WebVitalsTracker";
import { KoFiButton } from "./monetization/Ads";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

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
