import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ro'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({requestLocale}) => {
    const requestedLocale = (await requestLocale) ?? defaultLocale;
    const normalizedLocale = locales.includes(requestedLocale as (typeof locales)[number])
        ? requestedLocale
        : defaultLocale;

    return {
        locale: normalizedLocale,
        messages: (await import(`./messages/${normalizedLocale}.json`)).default
    };
});
