"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";

/**
 * Configuración de monetización
 */
const CONFIG = {
  adsense: {
    // ID de publisher fijo según lo proporcionado
    publisherId: "ca-pub-7981415143867065",
  },
  ezoic: {
    ezoicId: process.env.NEXT_PUBLIC_EZOIC_ID || "",
  },
  kofi: {
    kofiId: process.env.NEXT_PUBLIC_KOFI_ID || "",
  },
};

/**
 * Componente para cargar scripts de monetización
 * Soporta Google AdSense y Ezoic
 */
export function MonetizationScripts() {
  return (
    <>
      {/*
        Nota: El script de Google AdSense ahora está directamente en el <head> de app/layout.tsx
        para facilitar y garantizar la verificación por parte del bot de AdSense.
      */}

      {/* Cargar Ezoic (si está configurado) */}
      {CONFIG.ezoic.ezoicId && (
        <Script
          id="ezoic-init"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG.ezoic.ezoicId}`}
        />
      )}
    </>
  );
}

// Extender el tipo Window para adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

/**
 * Banner horizontal (728x90) - Header/Footer
 */
export function AdBanner() {
  const [mounted, setMounted] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Evitar warning de eslint con un setTimeout o ignorando
    // pero la forma correcta es un simple efecto
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !pushedRef.current && CONFIG.adsense.publisherId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [mounted]);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-full h-[90px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario</span>
      </div>
    );
  }

  if (!mounted) {
    return <div className="w-full h-[90px]" />;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "728px", height: "90px", background: "transparent" }}
      data-ad-client={CONFIG.adsense.publisherId}
      data-ad-slot="1234567890"
      data-ad-format="horizontal"
      data-full-width-responsive="true"
    />
  );
}

/**
 * Rectángulo (300x250) - Sidebar
 */
export function AdRectangle() {
  const [mounted, setMounted] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !pushedRef.current && CONFIG.adsense.publisherId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [mounted]);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-[300px] h-[250px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario</span>
      </div>
    );
  }

  if (!mounted) {
    return <div className="w-[300px] h-[250px]" />;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "inline-block", width: "300px", height: "250px", background: "transparent" }}
      data-ad-client={CONFIG.adsense.publisherId}
      data-ad-slot="1234567891"
    />
  );
}

/**
 * Banner responsive - Se adapta al contenedor
 */
export function AdResponsive() {
  const [mounted, setMounted] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !pushedRef.current && CONFIG.adsense.publisherId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [mounted]);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-full min-h-[250px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario responsivo</span>
      </div>
    );
  }

  if (!mounted) {
    return <div className="w-full min-h-[250px]" />;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight: "250px", background: "transparent" }}
      data-ad-client={CONFIG.adsense.publisherId}
      data-ad-slot="1234567893"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

/**
 * Banner inline entre contenido
 */
export function AdInline() {
  return (
    <div className="w-full my-8 flex justify-center">
      <AdResponsive />
    </div>
  );
}

/**
 * Componente de donations Ko-Fi - Botón flotante
 */
export function KoFiButton() {
  if (!CONFIG.kofi.kofiId) {
    return null;
  }

  return (
    <a
      href={`https://ko-fi.com/${CONFIG.kofi.kofiId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 transition-transform hover:scale-105"
      title="Apóyanos en Ko-Fi"
    >
      <img
        src="/icons/support_me_on_kofi_dark.png"
        alt="Support me on Ko-Fi"
        style={{ height: '36px', width: 'auto' }}
      />
    </a>
  );
}

/**
 * Widget inline de Ko-Fi
 */
export function KoFiWidget() {
  if (!CONFIG.kofi.kofiId) {
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <a
        href={`https://ko-fi.com/${CONFIG.kofi.kofiId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
        title="Apóyanos en Ko-Fi"
      >
        <img
          src="/icons/support_me_on_kofi_dark.png"
          alt="Support me on Ko-Fi"
          style={{ height: '36px', width: 'auto' }}
        />
      </a>
    </div>
  );
}
