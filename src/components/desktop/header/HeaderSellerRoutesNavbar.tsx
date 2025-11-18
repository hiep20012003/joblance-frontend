'use client';

import Link from "next/link";
import {usePathname} from "next/navigation";
import clsx from "clsx";
import {useUserContext} from "@/context/UserContext";

export default function HeaderSellerRoutesNavbar() {
    const pathname = usePathname();
    const {user} = useUserContext();

    if (!user) return null;

    const links = [
        {label: "Dashboard", href: `/users/${user.username}/seller_dashboard`},
        {label: "My Gigs", href: `/users/${user.username}/manage_gigs`},
        {label: "My Orders", href: `/users/${user.username}/manage_orders`},
    ];

    return (
        <nav className="flex-1">
            <ul className="flex flex-wrap flex-row gap-4 md:gap-6 justify-center md:justify-start">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={clsx(
                                    "btn btn-text text-base font-medium transition-colors",
                                    isActive
                                        ? "text-primary-600"
                                        : "text-gray-500 hover:text-primary-500"
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
