'use server'

import {fetchApi} from "@/lib/utils/api";
import {buildQueryString} from "@/lib/utils/helper";
import {IBuyerDocument} from "@/types/buyer";

export async function getBuyerByUsername(username: string) {

    return await fetchApi(`/buyers/username/${username}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getBuyerById(id: string) {

    return await fetchApi<Required<IBuyerDocument>>(`/buyers/${id}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getBuyers(queryParams: Record<string, string>) {
    const query = buildQueryString(queryParams)
    return await fetchApi<Required<IBuyerDocument>[]>(`/buyers?${query}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getCurrentBuyer() {

    return await fetchApi(`/buyers/me`, {
        method: "GET",
        cache: 'no-store',
    });
}