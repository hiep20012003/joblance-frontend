'use server'

import {parse} from "cookie";
import {cookies} from "next/headers";

export const setCookies = async (authCookies: string[] | undefined) => {
    if (authCookies && authCookies.length > 0) {
        for (const cookie of authCookies) {
            const parsedCookie = parse(cookie)
            const [cookieName, cookieValue] = Object.entries(parsedCookie)[0]
            const cookieStore = await cookies()
            cookieStore.set({
                name: cookieName,
                value: cookieValue ?? '',
                httpOnly: true,
                maxAge: parseInt(parsedCookie["Max-Age"] ?? '') ? parseInt(parsedCookie["Max-Age"] ?? '') : undefined,
                path: parsedCookie.path,
                sameSite: 'none',
                expires: new Date(parsedCookie.expires ?? ''),
                secure: true,
            })
        }
    }
}


export const clearAuthCookies = async () => {
    const cookieStore = await cookies();

    const targetCookies = [
        "_next_hmr_refresh_hash__",
        "authjs.callback-url",
        "authjs.csrf-token",
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "__Secure-authjs.callback-url",
        "session",
        "session.sig",
    ];

    for (const name of targetCookies) {
        cookieStore.delete({
            name,
            path: "/",       // xoá toàn bộ scope
        });
    }
};


