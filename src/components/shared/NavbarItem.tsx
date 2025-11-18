import Link from "next/link";
import {LiHTMLAttributes} from "react";
import clsx from "clsx";

interface NavbarItemProps extends LiHTMLAttributes<HTMLLIElement> {
    href?: string;
    disabled?: boolean;
}

export default function NavbarItem({
                                       href,
                                       children,
                                       disabled,
                                       onClick
                                   }: NavbarItemProps) {
    return (
        <li
            onClick={onClick}
            className={clsx(
                "nav-item inline-block border-0 bg-transparent text-md text-gray-600 hover:text-gray-500 cursor-pointer group",
                disabled && "pointer-events-none opacity-50 cursor-default"
            )}
        >
            {href ? (
                <Link
                    href={href}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    className="relative text-nowrap flex-nowrap inline-block nav-link py-2
            after:content-[''] after:absolute after:bottom-0 after:left-0
            after:w-full after:h-0.75 after:rounded-md after:bg-primary-500
            after:transition-transform after:duration-200 after:opacity-0
            after:scale-x-0 group-hover:after:opacity-100 group-hover:after:scale-x-100"
                >
                    {children}
                </Link>
            ) : (
                <div
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    className="relative text-nowrap flex-nowrap inline-block nav-link py-2
            after:content-[''] after:absolute after:bottom-0 after:left-0
            after:w-full after:h-0.75 after:rounded-md after:bg-primary-500
            after:transition-transform after:duration-200 after:opacity-0
            after:scale-x-0 group-hover:after:opacity-100 group-hover:after:scale-x-100"
                >
                    {children}
                </div>
            )}
        </li>
    );
}
