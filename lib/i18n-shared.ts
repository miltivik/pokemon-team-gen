export type Lang = "en" | "es";

export const DEFAULT_LANG: Lang = "en";
export const LANGUAGE_COOKIE_KEY = "ptg_lang";

export function isLang(value: string | null | undefined): value is Lang {
    return value === "en" || value === "es";
}

export function resolveLang(value: string | null | undefined): Lang {
    return isLang(value) ? value : DEFAULT_LANG;
}

const LOCALIZED_PATHS: Record<string, Record<Lang, string>> = {
    "/": { en: "/", es: "/es" },
    "/configurar": { en: "/configurar", es: "/es/configurar" },
    "/equipo": { en: "/equipo", es: "/es/equipo" },
};

export function getPathLanguage(pathname: string): Lang {
    return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

export function getLocalizedPath(pathname: string, lang: Lang): string | null {
    const pathEntry = Object.values(LOCALIZED_PATHS).find(
        (paths) => Object.values(paths).includes(pathname)
    );
    return pathEntry?.[lang] ?? null;
}

export function translateFromMap<Key extends string>(
    dictionary: Record<Lang, Record<Key, string>>,
    lang: Lang,
    key: Key,
    params?: Record<string, string>
) {
    let text = dictionary[lang][key] || dictionary[DEFAULT_LANG][key] || key;

    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(`{${paramKey}}`, paramValue);
        });
    }

    return text;
}

export function createLangCookie(lang: Lang) {
    return `${LANGUAGE_COOKIE_KEY}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
