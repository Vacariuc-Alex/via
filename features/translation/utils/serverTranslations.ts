import {defaultLocale, locales} from "../i18n";

type Locale = (typeof locales)[number];

// Cache for imported translations
const translationCache: Record<string, Record<string, any>> = {};

/**
 * Get a specific translation value from the messages
 * @param locale - The locale/language code
 * @param key - The dot-notation path to the translation key (e.g., "interview.workflow.generateGreeting")
 * @param params - Optional parameters for string interpolation (e.g., {username: "John"})
 * @returns The translated string
 */
export async function getTranslation(locale?: string, key?: string, params?: Record<string, string | number>): Promise<string> {
    if (!key) return "";

    const normalizedLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;

    // Load translations if not cached
    if (!translationCache[normalizedLocale]) {
        const messages = (await import(`../messages/${normalizedLocale}.json`)).default;
        translationCache[normalizedLocale] = messages;
    }

    const messages = translationCache[normalizedLocale];
    const value = getNestedValue(messages, key);

    if (typeof value === "string" && params) {
        return interpolateParams(value, params);
    }

    return typeof value === "string" ? value : "";
}

/**
 * Get a translations object (array or object)
 * @param locale - The locale/language code
 * @param key - The dot-notation path to the translation key
 * @returns The translation value (could be array, object, or string)
 */
export async function getTranslationValue(locale?: string, key?: string): Promise<any> {
    if (!key) return null;

    const normalizedLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;

    // Load translations if not cached
    if (!translationCache[normalizedLocale]) {
        const messages = (await import(`../messages/${normalizedLocale}.json`)).default;
        translationCache[normalizedLocale] = messages;
    }

    const messages = translationCache[normalizedLocale];
    return getNestedValue(messages, key);
}

/**
 * Helper function to get nested values using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
}

/**
 * Helper function to interpolate parameters into translated strings
 */
function interpolateParams(text: string, params: Record<string, string | number>): string {
    let result = text;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return result;
}

/**
 * Export locales for use in backend
 */
export {locales, defaultLocale};
export type {Locale};
