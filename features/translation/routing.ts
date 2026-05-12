import {defaultLocale, locales} from "@/features/translation/i18n";

export type AppLocale = (typeof locales)[number];

function ensureLeadingSlash(pathname: string): string {
    if (!pathname) return "/";
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function resolveAppLocale(locale?: string): AppLocale {
    if (locales.includes(locale as AppLocale)) {
        return locale as AppLocale;
    }

    return defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
    const normalizedPath = ensureLeadingSlash(pathname);
    const segments = normalizedPath.split("/").filter(Boolean);

    if (segments.length > 0 && locales.includes(segments[0] as AppLocale)) {
        segments.shift();
    }

    return `/${segments.join("/")}`;
}

export function getLocalizedPath(pathname: string, locale?: string): string {
    const normalizedLocale = resolveAppLocale(locale);
    const basePath = stripLocalePrefix(pathname);

    if (normalizedLocale === defaultLocale) {
        return basePath === "/" ? "/" : basePath;
    }

    return basePath === "/" ? `/${normalizedLocale}` : `/${normalizedLocale}${basePath}`;
}

