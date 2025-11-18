'use client';

import Image from "next/image";
import Link from "next/link";
import HeaderSearchInput from "@/components/desktop/header/HeaderSearchInput";
import HeaderUserActions from "@/components/desktop/header/HeaderUserActions";
import HeaderSellerRoutesNavbar from "@/components/desktop/header/HeaderSellerRoutesNavbar";
import {usePathname} from "next/navigation";
import {isOrderPath, isSellerPath} from "@/lib/utils/helper";
import {useEffect, useState} from "react";
import HeaderCategoriesNavbar from "@/components/desktop/header/HeaderCategoriesNavbar";
import {useUserContext} from "@/context/UserContext";

export default function Header() {
    const [isHydrated, setIsHydrated] = useState(false);
    const {user, mode} = useUserContext();
    const pathname = usePathname();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const isSellerPage = isHydrated && isSellerPath(pathname);
    const isSellerMode = isHydrated && mode === 'seller';
    const isOrderPage = isHydrated && isOrderPath(pathname);
    const isInboxPage = isHydrated && pathname.includes('/inbox');

    // Determine which components to show based on hydrated state and conditions
    const showSearchInput = isHydrated && !(isSellerPage || (isOrderPage && isSellerMode));
    const showSellerNavbar = isHydrated && user && (isSellerPage || (isOrderPage && isSellerMode));
    const showNavigation = isHydrated && !isSellerPage && !isOrderPage && !isInboxPage;

    return (
        <header className="row-start-1 row-end-2 bg-background border-b border-gray-200">
            <div className="container flex flex-row justify-between items-center gap-10 h-20 mx-auto px-6">
                <Link
                    href={
                        isHydrated && isSellerMode && user?.username
                            ? `/users/${user.username}/seller_dashboard`
                            : "/"
                    }
                    className="logo mt-2 w-[100px] md:w-[120px] lg:w-[120px]"
                >
                    <Image
                        src="/images/logo-brand.webp"
                        alt="Logo"
                        width={150}
                        height={85}
                        priority
                        style={{height: "auto"}}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Conditional rendering for search input */}
                {showSearchInput && <HeaderSearchInput/>}

                {/* Conditional rendering for seller navbar */}
                {showSellerNavbar && <HeaderSellerRoutesNavbar/>}

                <HeaderUserActions/>
            </div>

            {/* Conditional rendering for categories navigation */}
            {showNavigation && <HeaderCategoriesNavbar/>}
        </header>
    );
}
