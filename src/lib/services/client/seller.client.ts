"use client"

import {SellerCreatePayload, SellerUpdatePayload} from "@/lib/schemas/seller.schema";
import {ISellerDocument} from "@/types/seller";
import {fetchApi} from "@/lib/utils/api";

export async function createSellerProfile(body: SellerCreatePayload) {
    return fetchApi<ISellerDocument>('/sellers', {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}

export async function updateSellerProfile(id: string, body: SellerUpdatePayload) {
    return fetchApi<ISellerDocument>(`/sellers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        credentials: 'include'
    });
}
