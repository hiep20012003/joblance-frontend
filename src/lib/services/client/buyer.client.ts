"use client"

import {fetchApi} from "@/lib/utils/api";
import {IBuyerDocument} from "@/types/buyer";

export async function updateProfile({id, formData}: { id: string, formData: FormData }) {
    return fetchApi<IBuyerDocument>(`/buyers/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
    });
}
