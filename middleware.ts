import createMiddleware from "next-intl/middleware";
import {defaultLocale, locales} from "@/features/translation/i18n";

export default createMiddleware({
	locales,
	defaultLocale,
	localePrefix: "as-needed",
	localeDetection: false,
	localeCookie: false,
});

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
