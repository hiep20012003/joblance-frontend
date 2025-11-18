'use client'

import {ReactNode} from "react";
import Header from "@/components/desktop/header/Header";
import Footer from "@/components/desktop/footer/Footer";
import {usePathname} from "next/navigation";
import clsx from "clsx";

export default function RootLayout({children}: { children: ReactNode }) {

    const pathname = usePathname();
    const isInboxPage = pathname.startsWith("/inbox");

    return (
        <><Header/>
            <main
                className={clsx("flex flex-col flex-1 bg-background", isInboxPage && 'overflow-hidden')}>
                {children}
            </main>
            {
                !isInboxPage && (
                    <Footer/>
                )
            }
        </>
    );
}
