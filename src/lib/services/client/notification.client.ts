import {fetchApi} from "@/lib/utils/api";
import {INotificationDocument} from "@/types/notification";
import {buildQueryString} from "@/lib/utils/helper";

export async function getNotifications(
    {userId, page = 1, limit = 5}: { userId: string, page?: number, limit?: number }) {
    const queryString = buildQueryString({userId, page, limit});
    return fetchApi<INotificationDocument[]>(`/notifications?${queryString}`, {
        method: 'GET',
        credentials: 'include',
    });
}


export async function markNotificationAsRead(id: string) {
    return fetchApi<INotificationDocument>(`/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
    });
}
