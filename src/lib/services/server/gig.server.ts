'use server'

import {fetchApi} from "@/lib/utils/api";
import {IGigDocument} from "@/types/gig";
import {ParsedFilters} from "@/lib/utils/search";
import {buildQueryString} from "@/lib/utils/helper";

export async function getGigById(id: string) {


    return await fetchApi<Required<IGigDocument>>(`/gigs/${id}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getGigsBySeller(username: string) {

    return await fetchApi<Required<IGigDocument>[]>(`/sellers/username/${username}/gigs`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getActiveGigsBySeller(username: string) {


    return await fetchApi<Required<IGigDocument>[]>(`/sellers/username/${username}/gigs/active`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getSimilarGigs(id: string) {
    return await fetchApi<Required<IGigDocument>[]>(`/gigs/${id}/similar`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function searchGigs(filters: ParsedFilters) {
    return await fetchApi<{
        hits: Required<IGigDocument>[];
        total: number;
    }>(`/gigs/search`, {
        method: "POST",
        cache: 'no-store',
        body: JSON.stringify(filters),
    });
}

export async function getTopGigs(searchParams: Record<string, unknown>) {
    const query = buildQueryString(searchParams)
    return await fetchApi<Required<IGigDocument>[]>(`/gigs/top?${query}`, {
        method: "GET",
        cache: 'no-store',
    });
}