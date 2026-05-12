import {ReactNode} from 'react'
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/features/translation/i18n';

export default async function LocaleLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
    const {locale} = await params;

    if (!hasLocale(locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
