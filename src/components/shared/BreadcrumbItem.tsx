import {ReactNode} from "react";
import Link from "next/link";

export default function BreadcrumbItem({children, href}: { children: ReactNode; href?: string }) {
    if (href) {
        return (
            <Link href={href} className="hover:text-primary-500 transition-colors hover:underline">
                {children}
            </Link>
        );
    }
    return <span>{children}</span>;
}