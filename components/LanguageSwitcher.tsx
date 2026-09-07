"use client";

import { useTranslation } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/i18n-shared";
import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher() {
    const { lang } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const targetPath = getLocalizedPath(pathname, lang === "en" ? "es" : "en");

    if (!targetPath) return null;

    const navigateToLanguage = () => {
        const search = typeof window !== "undefined" ? window.location.search : "";
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        router.push(`${targetPath}${search}${hash}`);
    };

    return (
        <button
            onClick={navigateToLanguage}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={lang === "en" ? "Cambiar a Español" : "Switch to English"}
        >
            <span className="text-base" aria-hidden="true">{lang === "en" ? "🇺🇸" : "🇪🇸"}</span>
            <span className="uppercase text-xs tracking-wider">{lang}</span>
        </button>
    );
}
