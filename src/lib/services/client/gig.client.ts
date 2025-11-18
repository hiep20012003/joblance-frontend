import {fetchApi} from "@/lib/utils/api";
import {IGigDocument} from "@/types/gig";
import {ParsedFilters} from "@/lib/utils/search";

export async function createGig(formData: FormData) {
    return fetchApi<IGigDocument>('/gigs', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
}

export async function updateGig(id: string, formData: FormData) {
    return fetchApi<IGigDocument>(`/gigs/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
    });
}

export async function deleteGig(id: string) {
    return fetchApi(`/gigs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
}

export async function activeGig(id: string) {
    return fetchApi<IGigDocument>(`/gigs/${id}/active`, {
        method: 'PATCH',
        credentials: 'include',
    });
}

export async function inactiveGig(id: string) {
    return fetchApi<IGigDocument>(`/gigs/${id}/inactive`, {
        method: 'PATCH',
        credentials: 'include',
    });
}


export async function searchGigs(filters: ParsedFilters) {
    return await fetchApi<{
        hits: Required<IGigDocument>[];
        total: number;
    }>(`/gigs/search`, {
        method: "POST",
        body: JSON.stringify(filters),
        credentials: 'include',
    });
}


