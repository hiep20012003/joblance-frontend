import {fetchApi} from "@/lib/utils/api";
import {IReviewDocument} from "@/types/review";
import {buildQueryString} from "@/lib/utils/helper";

export async function getReviews(searchParams: Record<string, any>) {
    const query = buildQueryString(searchParams)

    return await fetchApi<Required<IReviewDocument>[]>(`/reviews?${query}`, {
        method: "GET",
        cache: 'no-store',
    });
}
