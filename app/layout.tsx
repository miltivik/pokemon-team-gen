import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { ConsentAwareScripts } from "../components/ConsentAwareScripts";
import { CookieConsent } from "../components/CookieConsent";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { WebVitalsTracker } from "../components/WebVitalsTracker";
import { KoFiButton } from "../components/monetization/Ads";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const ENGLISH_DESCRIPTION =
  "Generate competitive Pokemon teams for Pokemon Showdown across Gen 9 OU, UU, RU, NU and legacy VGC formats, with optimized movesets and strategy.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://poketeambuilder.com'),
  title: 'Competitive Pokemon Team Generator',
  description: ENGLISH_DESCRIPTION,
  keywords: [
    'pokemon team generator',
    'pokemon showdown team builder',
    'gen 9 ou team generator',
    'competitive pokemon teams',
    'smogon team generator',
    'pokemon team maker',
    'vgc team generator',
  ],
  authors: [{ name: 'Pokemon Team Generator' }],
  creator: 'Pokemon Team Generator',
  publisher: 'Pokemon Team Generator',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-7981415143867065',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_ES',
    url: 'https://poketeambuilder.com',
    siteName: 'Pokemon Team Generator',
    title: 'Competitive Pokemon Team Generator',
    description: ENGLISH_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pokemon Team Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Competitive Pokemon Team Generator',
    description: ENGLISH_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@poketeamgen',
  },
  alternates: {
    canonical: 'https://poketeambuilder.com',
    languages: {
      en: 'https://poketeambuilder.com',
      es: 'https://poketeambuilder.com/es',
      'x-default': 'https://poketeambuilder.com',
    },
  },
  category: 'gaming',
  classification: 'Gaming Tools',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pokemon Team Generator',
    description: ENGLISH_DESCRIPTION,
    url: 'https://poketeambuilder.com',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Pokemon Team Generator',
    },
    features: [
      'Competitive Pokemon team generator',
      'Support for Gen 9 OU, UU, RU, NU and legacy VGC formats',
      'One-click Pokemon Showdown export',
      'Early, mid and late-game strategy guidance',
      'English and Spanish interface',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black`}
      >
        <ConsentAwareScripts />
        <AnalyticsTracker />
        <WebVitalsTracker />
        <KoFiButton />
        <Providers>
           <Navbar />
           {children}
           <Footer />
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
