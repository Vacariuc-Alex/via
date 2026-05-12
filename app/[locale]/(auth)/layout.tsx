import {ReactNode} from 'react'
import {isAuthenticated} from "@/features/service/auth";
import {redirect} from "next/navigation";
import {getLocale} from "next-intl/server";
import LanguageSwitcher from "../../../components/LanguageSwitcher/LanguageSwitcher";
import {getLocalizedPath} from "@/features/translation/routing";

const AuthLayout = async ({children}: {children: ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    const locale = await getLocale();

    if(isUserAuthenticated) {
        redirect(getLocalizedPath("/", locale));
    }

    return (
        <div className="auth-layout">
            <div className="absolute right-6 top-6 z-20">
                <LanguageSwitcher />
            </div>
            {children}
        </div>
    )
}

export default AuthLayout;
