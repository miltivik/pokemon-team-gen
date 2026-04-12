export type Lang = "en" | "es";

export const DEFAULT_LANG: Lang = "en";
export const LANGUAGE_COOKIE_KEY = "ptg_lang";

export function isLang(value: string | null | undefined): value is Lang {
    return value === "en" || value === "es";
}

export function resolveLang(value: string | null | undefined): Lang {
    return isLang(value) ? value : DEFAULT_LANG;
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
