'use server'

import {fetchApi} from "@/lib/utils/api";
import {ISellerDocument} from "@/types/seller";
import {buildQueryString} from "@/lib/utils/helper";

export async function getSellerByUsername(username: string) {

    try {
        return await fetchApi<ISellerDocument>(`/sellers/username/${username}`, {
            method: "GET",
            cache: 'no-store',
        });
    } catch {
        return null;
    }
}

export async function getCurrentSeller() {


    return await fetchApi<ISellerDocument>(`/sellers/me`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getSellerById(id: string) {


    return await fetchApi<Required<ISellerDocument>>(`/sellers/${id}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getTopSellers(searchParams: Record<string, unknown>) {
    const query = buildQueryString(searchParams)
    return await fetchApi<Required<ISellerDocument>[]>(`/sellers/top?${query}`, {
        method: "GET",
        cache: 'no-store',
    });
}