'use client'

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";

export default function RefreshAccessToken() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        router.replace(currentUrl);
    }, [router, pathname, searchParams]);

    return null;
}
