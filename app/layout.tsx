import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { MonetizationScripts } from "../components/monetization/Ads";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { KoFiButton } from "../components/monetization/Ads";
import { Navbar } from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pokemon-team-generator.vercel.app'),
  title: {
    default: 'Pokemon Team Generator - Crea Equipos Competitivos',
    template: '%s | Pokemon Team Generator',
  },
  description: 'Genera equipos Pokemon competitivos para Pokemon Showdown. Soporta Gen 9 OU, VGC, UU, RU, NU y más. Crea tu equipo con movesets óptimos y estrategias de juego.',
  keywords: [
    'pokemon team generator',
    'crear equipo pokemon',
    'pokemon competitivo',
    'pokemon showdown team builder',
    'gen 9 ou team generator',
    'equipos pokemon smogon',
    'pokemon team maker',
    'generador equipos pokemon',
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
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_US',
    url: 'https://pokemon-team-generator.vercel.app',
    siteName: 'Pokemon Team Generator',
    title: 'Pokemon Team Generator - Crea Equipos Competitivos',
    description: 'Genera equipos Pokemon competitivos para Pokemon Showdown. Soporta Gen 9 OU, VGC, UU, RU, NU y más.',
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
    title: 'Pokemon Team Generator - Crea Equipos Competitivos',
    description: 'Genera equipos Pokemon competitivos para Pokemon Showdown. Soporta Gen 9 OU, VGC, UU, RU, NU y más.',
    images: ['/og-image.png'],
    creator: '@poketeamgen',
  },
  alternates: {
    canonical: 'https://pokemon-team-generator.vercel.app',
    languages: {
      'es': 'https://pokemon-team-generator.vercel.app',
      'en': 'https://pokemon-team-generator.vercel.app/en',
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
    description: 'Genera equipos Pokemon competitivos para Pokemon Showdown. Soporta Gen 9 OU, VGC, UU, RU, NU y más.',
    url: 'https://pokemon-team-generator.vercel.app',
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
      'Generador de equipos Pokemon competitivos',
      'Soporte para Gen 9 OU, VGC, UU, RU, NU',
      'Exportar a Pokemon Showdown',
      'Estrategias de juego (early, mid, late game)',
      'Interfaz en español e inglés',
    ],
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black`}
      >
        <MonetizationScripts />
        <AnalyticsTracker />
        <KoFiButton />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
