'use client';

import {IOrderDocument} from '@/types/order';
import {fetchApi} from "@/lib/utils/api";
import {buildQueryString} from "@/lib/utils/helper";

interface GetOrdersClientParams {
    buyerId?: string;
    sellerId?: string;
    status?: string;
    late?: boolean;
    page?: number;
    limit?: number;
    // Add other filter parameters if needed
}

interface GetOrdersClientResponse {
    orders: Required<IOrderDocument>[];
    total: number;
}

export async function getOrders(params: GetOrdersClientParams): Promise<GetOrdersClientResponse> {
    const query = buildQueryString(params)

    return await fetchApi(`/orders?${query}`, {
        method: 'GET',
        credentials: 'include',
    });
}

export async function createOrder(body: any) {
    return fetchApi<{ order: IOrderDocument, clientSecret: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}

export async function submitRequirements(orderId: string, formData: any) {
    return fetchApi<IOrderDocument>(`/orders/${orderId}/requirements`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
}

export async function deliverOrder(orderId: string, formData: any) {
    return fetchApi<IOrderDocument>(`/orders/${orderId}/deliveries`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
}

export async function approveOrderDelivery(orderId: string) {
    return fetchApi<IOrderDocument>(`/orders/${orderId}/deliveries/approve`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function reviseOrderDelivery(orderId: string) {
    return fetchApi<IOrderDocument>(`/orders/${orderId}/deliveries/revise`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function cancelOrderDirect(orderId: string) {
    return fetchApi<IOrderDocument>(`/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function createNegotiation(body: any) {
    return fetchApi<IOrderDocument>(`/negotiations`, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}

export async function rejectNegotiation(id: string, body: any) {
    return fetchApi<IOrderDocument>(`/negotiations/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}

export async function approveNegotiation(id: string, body: any) {
    return fetchApi<IOrderDocument>(`/negotiations/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}
