import {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/features/service/auth";
import {redirect} from "next/navigation";
import {getLocale, getTranslations} from 'next-intl/server';
import LanguageSwitcher from "../../../components/LanguageSwitcher/LanguageSwitcher";
import {getLocalizedPath} from "@/features/translation/routing";

const HomeLayout = async ({children}: {children: ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    const locale = await getLocale();
    const t = await getTranslations('common');

    if(!isUserAuthenticated) {
        redirect(getLocalizedPath("/sign-in", locale));
    }

    return (
        <div className="home-layout">
            <nav>
                <div className="flex items-center justify-between gap-4">
                    <Link href={getLocalizedPath("/", locale)} className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="logo" width={80} height={80} />
                        <h1 className="text-primary-100">{t('appTitle')}</h1>
                    </Link>
                    <LanguageSwitcher />
                </div>
            </nav>
            {children}
        </div>
    )
}

export default HomeLayout;
