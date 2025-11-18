import {fetchApi} from "@/lib/utils/api";
import {IConversationDocument, IConversationSummary} from '@/types/chat';
import {getBuyers} from "@/lib/services/server/buyer.server";
import {buildQueryString} from "@/lib/utils/helper";

export async function getCurrentConversations(searchParams: Record<string, any>) {
    const query = buildQueryString(searchParams)

    return await fetchApi<Required<IConversationDocument[]>>(`/conversations?${query}`, {
        method: "GET",
        cache: 'no-store',
    });
}

export async function getListFollowedUserIds() {
    const conversations = await getCurrentConversations({limit: 0});

    if (!conversations?.length) {
        return [];
    }

    return Array.from(new Set(conversations.flatMap(c => c.participants)));
}

export async function getFlattenedConversations(currentUserId: string, query?: Record<string, any>): Promise<IConversationSummary[]> {
    const conversations = await getCurrentConversations(query ?? {limit: 10});

    if (!conversations?.length) {
        return [];
    }

    const ids = Array.from(new Set(conversations.flatMap(c => c.participants)));
    const users = ids.length > 0 ? await getBuyers({ids: JSON.stringify(ids.filter(id => id !== currentUserId))}) : [];

    const userMap = new Map(users?.map(user => [user._id, user]));
    return conversations.map(conv => {
        const otherUserId = conv.participants.find(id => id !== currentUserId);
        const otherUser = otherUserId ? userMap.get(otherUserId) : null;

        return {
            currentUserId: currentUserId,
            conversationId: conv._id,
            lastMessage: conv.lastMessage
                ? {
                    _id: conv.lastMessage._id,
                    content: conv.lastMessage.content,
                    senderId: conv.lastMessage.senderId,
                    timestamp: conv.lastMessage.timestamp,
                }
                : null,
            unreadCounts: conv.unreadCounts,
            user: otherUser
                ? {
                    _id: otherUser._id,
                    username: otherUser.username,
                    profilePicture: otherUser.profilePicture,
                    email: otherUser.email,
                    isSeller: otherUser.isSeller,
                }
                : null,
            isArchived: conv.isArchived?.[currentUserId] || false,
        };
    }) as IConversationSummary[];
}
