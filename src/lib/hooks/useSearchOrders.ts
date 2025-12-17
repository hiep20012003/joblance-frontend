// lib/hooks/useSearchOrders.ts
'use client';

import {useState, useTransition} from 'react';
import {useFetchMutation} from '@/lib/hooks/useFetchMutation';
import {getOrders} from '@/lib/services/client/order.client';
import {IOrderDocument} from '@/types/order';

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

    const [isPending, startTransition] = useTransition();

    const [orders, setOrders] = useState<IOrderDocument[]>(initialData?.orders ?? []);
    const [total, setTotal] = useState(initialData?.total ?? 0);

    const {mutate, loading: mutationLoading} = useFetchMutation(
        getOrders,
        {
            disableToast: true,
            onSuccess: (data) => {
                startTransition(() => {
                    setOrders(data.orders);
                    setTotal(data.total);
                });
            },
            onError: () => {
                startTransition(() => {
                    setOrders([]);
                    setTotal(0);
                });
            },
        }
    );

    // CHỈ FETCH – NHẬN FULL FILTERS TỪ NGOÀI, KHÔNG CHECK, KHÔNG THÊM GÌ
    const search = (filters: OrderFilters) => {

        mutate(filters);
    };

    return {
        orders,
        total,
        loading: mutationLoading || isPending,
        search,
    };
}