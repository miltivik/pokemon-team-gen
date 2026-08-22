import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";
import "../globals.css";

const ENGLISH_DESCRIPTION =
  "Generate competitive Pokemon teams for Pokemon Showdown across Gen 9 OU, UU, RU, NU, VGC 2026 Reg I and legacy formats, with optimized movesets and strategy.";
const ENGLISH_TITLE = "Pokemon Team Generator for Showdown | Gen 9 OU & VGC";

export const metadata: Metadata = {
  metadataBase: new URL('https://poketeambuilder.com'),
  title: ENGLISH_TITLE,
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
    'google-adsense-account': ADSENSE_PUBLISHER_ID,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_ES',
    url: 'https://poketeambuilder.com',
    siteName: 'Pokemon Team Generator',
    title: ENGLISH_TITLE,
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
    title: ENGLISH_TITLE,
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

export default function SiteLayout({
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
    inLanguage: 'en',
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
      'Support for Gen 9 OU, UU, RU, NU, VGC 2026 Reg I and legacy VGC formats',
      'One-click Pokemon Showdown export',
      'Early, mid and late-game strategy guidance',
      'English and Spanish interface',
    ],
  };

  return (
    <SiteShell lang="en" jsonLd={jsonLd}>
      {children}
    </SiteShell>
  );
}
