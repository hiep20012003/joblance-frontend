'use server'

import {unstable_update} from "@/auth";
import {Session} from "next-auth";


export async function refreshTokenFromServer() {
    const {cookies} = await import("next/headers");
    const isServer = typeof window === "undefined";

    const cookieHeader = isServer
        ? (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join("; ")
        : undefined;

    const headers: HeadersInit = cookieHeader
        ? {Cookie: decodeURIComponent(cookieHeader)}
        : {};

    return await fetch(`${process.env.BASE_URL}/api/auth/refresh`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers,
    });
}


export const updateSession = async ({session, needsRefresh}: {
    session?: Session;
    needsRefresh?: boolean
}) => {
    await unstable_update({
        ...session,
        needsRefresh
    });
};