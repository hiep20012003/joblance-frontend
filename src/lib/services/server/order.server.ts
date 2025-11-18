"use server"

import {fetchApi} from "@/lib/utils/api";
import {INegotiationDocument, IOrderDocument} from "@/types/order";
import {buildQueryString} from "@/lib/utils/helper";

export async function validatePayment(orderId: string, buyerId: string, gigId: string) {


    return await fetchApi<Required<{
        valid: boolean;
        status: string;
        data: { order: Required<IOrderDocument> | null, clientSecret: string }
    }>>(`/payments/validate`, {
        method: "POST",
        cache: 'no-store',
        body: JSON.stringify({orderId, buyerId, gigId}),
    });
}

export async function getOrderById(orderId: string) {
    return await fetchApi<Required<IOrderDocument>>(`/orders/${orderId}`, {
        method: "GET",
        cache: 'no-store',
    });
}


export async function getOrders(searchParams: Record<string, any>) {
    const query = buildQueryString(searchParams)

    return await fetchApi<Required<IOrderDocument>[]>(`/orders?${query}}`, {
        method: "GET",
        cache: 'no-store',
    });
}


export async function getNegotiationById(negotiationId: string) {
    return await fetchApi<Required<INegotiationDocument>>(`/negotiations/${negotiationId}`, {
        method: "GET",
        cache: 'no-store',
    });
}
