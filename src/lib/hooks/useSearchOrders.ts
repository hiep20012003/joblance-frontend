// lib/hooks/useSearchOrders.ts
'use client';

import {useState, useTransition} from 'react';
import {useFetchMutation} from '@/lib/hooks/useFetchMutation';
import {getOrders} from '@/lib/services/client/order.client';
import {IOrderDocument} from '@/types/order';

// Thêm import logger
import {logInfo, logError, logWithTrace} from "@/lib/utils/devLogger";

export interface OrderFilters {
    status?: string;
    late?: boolean;
    page?: number;
    sellerId?: string;
    buyerId?: string;
    limit?: number;

    // Thêm bất kỳ field nào bạn muốn, hook không check
    [key: string]: any;
}

interface UseSearchOrdersProps {
    initialData?: {
        orders: IOrderDocument[];
        total: number;
    };
}

export function useSearchOrders({initialData}: UseSearchOrdersProps) {
    // 1. Hook Initialization
    logInfo('SearchOrders', 'Initializing useSearchOrders', {
        initialData: initialData ? {
            orderCount: initialData.orders.length,
            total: initialData.total
        } : null
    });

    const [isPending, startTransition] = useTransition();

    const [orders, setOrders] = useState<IOrderDocument[]>(initialData?.orders ?? []);
    const [total, setTotal] = useState(initialData?.total ?? 0);

    const {mutate, loading: mutationLoading} = useFetchMutation(
        getOrders,
        {
            disableToast: true,
            onSuccess: (data) => {
                // 3. Mutation Success
                logInfo('SearchOrders', 'Order search successful', {
                    orderCount: data.orders.length,
                    total: data.total
                });

                startTransition(() => {
                    setOrders(data.orders);
                    setTotal(data.total);
                });
            },
            onError: () => {
                // 4. Mutation Error
                logError('SearchOrders', 'Order search failed');

                startTransition(() => {
                    setOrders([]);
                    setTotal(0);
                });
            },
        }
    );

    // CHỈ FETCH – NHẬN FULL FILTERS TỪ NGOÀI, KHÔNG CHECK, KHÔNG THÊM GÌ
    const search = (filters: OrderFilters) => {
        // 2. Search Function Call
        logWithTrace('SearchOrders', 'Initiating order search', {filters});

        mutate(filters);
    };

    return {
        orders,
        total,
        loading: mutationLoading || isPending,
        search,
    };
}