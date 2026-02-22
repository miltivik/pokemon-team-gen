"use client";

import { useEffect, useState } from "react";

/**
 * Configuración de monetización
 */
const CONFIG = {
  adsense: {
    // Tu ID de publisher - asegurar que tenga el prefijo correcto
    publisherId: (() => {
      const id = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
      if (!id) return "";
      // Si ya tiene pub- o ca-pub-, usarlo como está
      // Si no tiene prefijo, agregar ca-pub-
      if (id.startsWith("pub-") || id.startsWith("ca-pub-")) {
        return id;
      }
      return `ca-pub-${id}`;
    })(),
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
  useEffect(() => {
    // Cargar Google AdSense
    if (CONFIG.adsense.publisherId && !window.adsbygoogle) {
      const adsenseScript = document.createElement("script");
      adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.adsense.publisherId}`;
      adsenseScript.crossOrigin = "anonymous";
      adsenseScript.async = true;
      adsenseScript.onload = () => {
        // Inicializar anuncios después de cargar el script
        if (window.adsbygoogle) {
          try {
            (window.adsbygoogle as any).push({});
          } catch (e) {
            console.log("AdSense init error:", e);
          }
        }
      };
      document.head.appendChild(adsenseScript);
    }

    // Cargar Ezoic (si está configurado)
    // Ezoic utiliza un script diferente - necesitas obtener el script correcto de tu dashboard
    if (CONFIG.ezoic.ezoicId) {
      // Este es un script genérico - en realidad Ezoic te da un script específico
      // cuando configuras tu sitio en su dashboard
      const ezoicScript = document.createElement("script");
      ezoicScript.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ezoic.ezoicId}`;
      ezoicScript.async = true;
      document.head.appendChild(ezoicScript);
    }
  }, []);

  return null;
}

// Extender el tipo Window para adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Banner horizontal (728x90) - Header/Footer
 */
export function AdBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-full h-[90px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario</span>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="w-full h-[90px]" />
    );
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-[300px] h-[250px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario</span>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="w-[300px] h-[250px]" />
    );
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!CONFIG.adsense.publisherId) {
    return (
      <div className="w-full min-h-[250px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
        <span className="text-zinc-400 text-sm">Espacio publicitario responsivo</span>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="w-full min-h-[250px]" />
    );
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
