import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";
import "../globals.css";

const SPANISH_DESCRIPTION =
  "Genera equipos Pokémon competitivos para Pokémon Showdown con datos del meta, sinergia de tipos, movimientos optimizados y exportación inmediata.";

export const metadata: Metadata = {
  metadataBase: new URL('https://poketeambuilder.com'),
  title: 'Generador de Equipos Pokémon Competitivos | PokeTeamBuilder',
  description: SPANISH_DESCRIPTION,
  keywords: [
    'generador de equipos pokemon',
    'configurar equipo pokemon',
    'equipos pokemon competitivos',
    'pokemon showdown en español',
    'crear equipo pokemon',
    'mejores equipos pokemon gen 9',
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
    locale: 'es_ES',
    alternateLocale: 'en_US',
    url: 'https://poketeambuilder.com/es',
    siteName: 'Pokemon Team Generator',
    title: 'Generador de Equipos Pokémon Competitivos | PokeTeamBuilder',
    description: SPANISH_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Generador de Equipos Pokémon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Equipos Pokémon Competitivos | PokeTeamBuilder',
    description: SPANISH_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@poketeamgen',
  },
  alternates: {
    canonical: 'https://poketeambuilder.com/es',
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

export default function SpanishSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Generador de Equipos Pokémon',
    description: SPANISH_DESCRIPTION,
    url: 'https://poketeambuilder.com/es',
    inLanguage: 'es',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Organization',
      name: 'Pokemon Team Generator',
    },
    features: [
      'Generador de equipos Pokémon competitivos',
      'Formatos Gen 9 OU, UU, RU, NU, VGC 2026 Reg I y VGC clásicos',
      'Exportación a Pokémon Showdown con un clic',
      'Guía estratégica de inicio, medio y final de partida',
      'Interfaz en español e inglés',
    ],
  };

  return (
    <SiteShell lang="es" jsonLd={jsonLd}>
      {children}
    </SiteShell>
  );
}
