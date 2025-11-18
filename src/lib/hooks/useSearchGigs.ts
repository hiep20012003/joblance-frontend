'use client';

import {useEffect, useState, useTransition, useMemo, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {ParsedFilters, parseSearchParams} from '@/lib/utils/search';
import {IGigDocument} from '@/types/gig';
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {searchGigs} from "@/lib/services/client/gig.client";

// Thêm import logger
import {logInfo, logWithTrace} from "@/lib/utils/devLogger";
import {useUserContext} from "@/context/UserContext";

interface UseSearchGigsProps {
    category?: string;
    subCategory?: string;
    initialData: {
        hits: Required<IGigDocument>[];
        total: number;
    };
}

export function useSearchGigs({initialData, category, subCategory}: UseSearchGigsProps) {
    // 1. Hook Initialization
    logInfo('SearchGigs', 'Initializing useSearchGigs', {
        category,
        subCategory,
        initialHitsCount: initialData.hits.length,
        initialTotal: initialData.total
    });

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {user} = useUserContext();
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

        // --- 🎯 Áp dụng Mặc định Sắp xếp: sort='best', order='desc' ---
        const defaultSortParams = {
            sort: currentParams.sort || 'best',
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
    logInfo('SearchGigs', 'Parsed search filters', {parsedFilters});

    // Mutation
    const {mutate, loading} = useFetchMutation(
        async (filters: ParsedFilters) => await searchGigs(filters),
        {
            disableToast: true,
            onSuccess: (data) => {
                // 4. Mutation Success
                logInfo('SearchGigs', 'Gigs search successful', {
                    hitsCount: data.hits.length,
                    total: data.total,
                    page: currentPage
                });

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

        // 5. URL Update
        logInfo('SearchGigs', 'Updating URL with new search parameters', {
            updates,
            newURL,
            resetPage: 'cat' in updates || 'sub' in updates || 'query' in updates || 'min' in updates || 'max' in updates || 'days' in updates
        });

        window.history.replaceState(null, '', newURL);
    };

    // Fetch lại khi params thay đổi
    useEffect(() => {
        // 6. useEffect Trigger
        logInfo('SearchGigs', 'Search triggered by URL parameter change', {
            searchParams: searchParams.toString(),
            currentPage,
            pageSize
        });

        // Skip fetching on the first render if initialData is provided
        if (isFirstRender.current) {
            isFirstRender.current = false;
            logInfo('SearchGigs', 'Skipping initial fetch on first render', {
                triggerSource: 'useEffect[parsedFilters]',
                reason: 'initialData already present'
            });
            return;
        }

        // 3. Mutation Execution
        logWithTrace('SearchGigs', 'Executing searchGigs mutation', {
            filters: parsedFilters,
            triggerSource: 'useEffect[parsedFilters]'
        });

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