import {IReviewDocument} from "@/types/review";
import {fetchApi} from "@/lib/utils/api";
import {buildQueryString} from "@/lib/utils/helper";

export async function addReview(body: any) {
    return fetchApi<IReviewDocument>(`/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
    });
}


export async function getReviews(searchParams: Record<string, any>) {
    const query = buildQueryString(searchParams);
    return fetchApi<IReviewDocument[]>(`/reviews?${query}`, {
        method: 'GET',
        credentials: 'include',
    });
}
