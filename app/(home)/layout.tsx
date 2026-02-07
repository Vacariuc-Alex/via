import {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/features/service/auth";
import {redirect} from "next/navigation";

const HomeLayout = async ({children}: {children: ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();

    if(!isUserAuthenticated) {
        redirect('/sign-in');
    }

    return (
        <div className="home-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="logo" width={80} height={80} />
                    <h1 className="text-primary-100">Virtual Interview Assistant</h1>
                </Link>
            </nav>
            {children}
        </div>
    )
}

export default HomeLayout;
