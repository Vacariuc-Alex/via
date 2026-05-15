"use client";

import {Fragment} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useLocale} from "next-intl";
import {locales} from "@/features/translation/i18n";
import {getLocalizedPath, resolveAppLocale} from "@/features/translation/routing";

const LOCALE_LABELS: Record<string, string> = {
    en: "EN",
    ro: "RO",
};

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const currentLocale = resolveAppLocale(useLocale());

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            {locales.map((locale, index) => (
                <Fragment key={locale}>
                    {index > 0 && <span className="text-light-100/40">|</span>}
                    <button
                        type="button"
                        onClick={() => router.push(getLocalizedPath(pathname, locale))}
                        className={currentLocale === locale ? "text-cyan-300 font-semibold" : "text-light-100/75"}
                    >
                        {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
                    </button>
                </Fragment>
            ))}
        </div>
    );
}
