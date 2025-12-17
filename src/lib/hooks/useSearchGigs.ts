'use client';

import {useEffect, useState, useTransition, useMemo, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {ParsedFilters, parseSearchParams} from '@/lib/utils/search';
import {IGigDocument} from '@/types/gig';
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {searchGigs} from "@/lib/services/server/gig.server";

// Thêm import logger

interface UseSearchGigsProps {
    category?: string;
    subCategory?: string;
    initialData: {
        hits: Required<IGigDocument>[];
        total: number;
    };
}

export function useSearchGigs({initialData, category, subCategory}: UseSearchGigsProps) {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    // Pagination state
    const pageSize = Number(searchParams.get('limit')) || 24;

    // Data state
    const [gigs, setGigs] = useState(initialData.hits);
    const [total, setTotal] = useState(initialData.total);
    const currentPage = Number(searchParams.get('page')) || 1;
    const isFirstRender = useRef(true);

    // Parse filters từ URL
    const parsedFilters: ParsedFilters = useMemo(() => {
        const currentParams = Object.fromEntries(searchParams.entries());

        const defaultSortParams = {
            sort: currentParams.sort || "_score",
            order: currentParams.order || 'desc',
        };
        // -------------------------------------------------------------

        return parseSearchParams({
            cat: category,
            sub: subCategory,
            limit: pageSize.toString(),

            ...currentParams,
            ...defaultSortParams, // Áp dụng mặc định vào tham số
        });
    }, [searchParams.toString(), category, subCategory, pageSize]);

    // 2. Search Parameters Parsing

    // Mutation
    const {mutate, loading} = useFetchMutation(
        async (filters: ParsedFilters) => await searchGigs(filters),
        {
            disableToast: true,
            onSuccess: (data) => {
                startTransition(() => {
                    setGigs(data.hits);
                    setTotal(data.total);
                });
            },
        }
    );

    // Update URL khi thay đổi filter hoặc page
    const updateURL = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === '0') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset page về 1 nếu thay đổi filter chính
        if ('cat' in updates || 'sub' in updates || 'query' in updates || 'min' in updates || 'max' in updates || 'days' in updates) {
            params.set('page', '1');
        }

        // Đảm bảo các giá trị sort/order mặc định được giữ lại trên URL nếu chúng không bị cập nhật
        if (!('sort' in updates)) params.set('sort', parsedFilters.sort.by === 'bestSelling' ? 'best' : parsedFilters.sort.by);
        if (!('order' in updates)) params.set('order', parsedFilters.sort.order);


        const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        window.history.replaceState(null, '', newURL);
    };

    // Fetch lại khi params thay đổi
    useEffect(() => {

        // Skip fetching on the first render if initialData is provided
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        mutate(parsedFilters);
    }, [parsedFilters]);

    return {
        gigs,
        total,
        loading: loading || isPending,
        parsedFilters,
        updateURL,
        currentPage,
        pageSize,
    };
}