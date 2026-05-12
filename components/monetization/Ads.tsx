"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

/**
 * Configuración de monetización
 */
const CONFIG = {
  adsense: {
    publisherId: "ca-pub-7981415143867065",
  },
  ezoic: {
    ezoicId: process.env.NEXT_PUBLIC_EZOIC_ID || "",
  },
  kofi: {
    kofiId: process.env.NEXT_PUBLIC_KOFI_ID || "",
  },
  infolinks: {
    pid: "3445165",
    wsid: "0",
  },
};

/**
 * Componente para cargar scripts de monetización.
 * @deprecated La carga de scripts de terceros ahora se maneja mediante
 * {@link ConsentAwareScripts} en app/layout.tsx, que respeta el consentimiento de cookies.
 */
export function MonetizationScripts() {
  return null;
}

// Extender el tipo Window para adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

function useDeferredAdMount(delayMs: number = 1200) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    let idleId: number | undefined;
    let cancelled = false;

    const activate = () => {
      if (!cancelled) {
        setMounted(true);
      }
    };

    if (window.requestIdleCallback) {
      idleId = window.requestIdleCallback(activate, { timeout: delayMs });
    } else {
      timeoutId = globalThis.setTimeout(activate, delayMs);
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }
      if (idleId && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [delayMs]);

  return mounted;
}

interface AdSlotProps {
  placement: string;
  slot: string;
  fallbackLabel: string;
  outerClassName?: string;
  shellClassName: string;
  slotClassName: string;
  slotStyle?: CSSProperties;
  format?: string;
  fullWidthResponsive?: boolean;
}

function AdSlot({
  placement,
  slot,
  fallbackLabel,
  outerClassName,
  shellClassName,
  slotClassName,
  slotStyle,
  format,
  fullWidthResponsive,
}: AdSlotProps) {
  const mounted = useDeferredAdMount();
  const pushedRef = useRef(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    if (!mounted || pushedRef.current || !CONFIG.adsense.publisherId || !adRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [mounted]);

  useEffect(() => {
    const adElement = adRef.current;
    if (!mounted || !adElement || !CONFIG.adsense.publisherId) {
      return;
    }

    const syncAdStatus = () => {
      const adStatus = adElement.getAttribute("data-ad-status");
      setIsUnfilled(adStatus === "unfilled");
    };

    syncAdStatus();

    const observer = new MutationObserver(syncAdStatus);
    observer.observe(adElement, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    return () => {
      observer.disconnect();
    };
  }, [mounted, placement, slot]);

  return (
    <div
      className={`ad-slot-wrapper ${outerClassName ?? ""}`}
      data-ad-wrapper
      data-ad-placement={placement}
      data-ad-unfilled={isUnfilled ? "true" : undefined}
    >
      <div
        className={`ad-slot relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900/60 ${shellClassName}`}
        data-ad-shell
        data-ad-placement={placement}
      >
        {!CONFIG.adsense.publisherId && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-center text-sm text-zinc-400">{fallbackLabel}</span>
          </div>
        )}

        {!mounted && CONFIG.adsense.publisherId && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 animate-pulse bg-zinc-200 dark:bg-zinc-800/60"
          />
        )}

        <ins
          ref={adRef}
          className={`adsbygoogle ${slotClassName}`}
          style={{ display: "block", background: "transparent", ...slotStyle }}
          data-ad-client={CONFIG.adsense.publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={fullWidthResponsive ? "true" : undefined}
          data-ad-placement={placement}
        />
      </div>
    </div>
  );
}

/**
 * Banner horizontal (728x90) - Header/Footer
 */
export function AdBanner() {
  return (
    <AdSlot
      placement="banner"
      slot="1234567890"
      fallbackLabel="Espacio publicitario"
      outerClassName="w-full"
      shellClassName="w-full max-w-[728px] h-[90px]"
      slotClassName="h-full w-full"
      format="horizontal"
      fullWidthResponsive
    />
  );
}

/**
 * Rectángulo (300x250) - Sidebar
 */
export function AdRectangle() {
  return (
    <AdSlot
      placement="sidebar-rectangle"
      slot="1234567891"
      fallbackLabel="Espacio publicitario"
      outerClassName="w-[300px]"
      shellClassName="h-[250px] w-[300px]"
      slotClassName="h-full w-full"
    />
  );
}

/**
 * Placement superior estable para zonas above-the-fold
 */
export function AdHero() {
  return (
    <AdSlot
      placement="hero"
      slot="1234567893"
      fallbackLabel="Espacio publicitario destacado"
      outerClassName="w-full"
      shellClassName="w-full max-w-[970px] h-[250px] lg:h-[280px]"
      slotClassName="h-full w-full"
    />
  );
}

/**
 * Placement inline estable para contenido
 */
export function AdInlineDisplay() {
  return (
    <AdSlot
      placement="inline-content"
      slot="1234567893"
      fallbackLabel="Espacio publicitario en contenido"
      outerClassName="w-full my-8 flex justify-center"
      shellClassName="w-full max-w-[970px] h-[250px] md:h-[280px]"
      slotClassName="h-full w-full"
    />
  );
}

/**
 * Compatibilidad con usos existentes del top placement.
 */
export function AdResponsive() {
  return <AdHero />;
}

/**
 * Banner inline entre contenido
 */
export function AdInline() {
  return <AdInlineDisplay />;
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
      className="fixed bottom-6 left-4 z-50 transition-transform hover:scale-105 group"
      title="Apóyanos en Ko-Fi"
    >
      {/* Botón completo para Desktop */}
      <Image
        src="/icons/support_me_on_kofi_dark.png"
        alt="Support me on Ko-Fi"
        width={980}
        height={198}
        sizes="(min-width: 768px) 178px, 0px"
        className="hidden h-9 w-auto drop-shadow-lg md:block"
      />

      {/* Ícono circular para Móvil (SVG) */}
      <div className="md:hidden flex items-center justify-center w-10 h-10 bg-[#13C3FF] text-white rounded-full shadow-lg border border-black/10 dark:border-white/10 group-hover:bg-[#00b0ec] transition-colors">
        <Image
          src="/icons/kofi_logo.svg"
          alt="Ko-fi"
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
      </div>
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
        <Image
          src="/icons/support_me_on_kofi_dark.png"
          alt="Support me on Ko-Fi"
          width={980}
          height={198}
          sizes="178px"
          className="h-9 w-auto"
        />
      </a>
    </div>
  );
}
