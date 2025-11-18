import {buildQueryString} from "@/lib/utils/helper";
import {fetchApi} from "@/lib/utils/api";
import {IMessageDocument} from "@/types/chat";

export async function getMessages(
    {conversationId, lastTimestamp, limit = 10}: { conversationId: string, lastTimestamp?: string, limit?: number }) {
    const queryString = buildQueryString({conversationId, lastTimestamp, limit});
    return fetchApi<IMessageDocument[]>(`/conversations/${conversationId}/messages?${queryString}`, {
        method: 'GET',
        credentials: 'include',
    });
}

export async function createMessage(conversationId: string, formData: FormData) {
    return fetchApi<any>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
}

export async function createConversation(formData: FormData) {
    return fetchApi<any>(`/conversations`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
}

export async function readConversation(conversationId: string) {
    return fetchApi<any>(`/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
    });
}