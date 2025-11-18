'use client';

import React, {useEffect, useMemo, memo, useState} from "react";
import {CornerDownLeft} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import {formatISOTime} from "@/lib/utils/time";
import clsx from "clsx";
import {IConversationSummary} from "@/types/chat";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useConversationContext} from "@/context/ChatContext";
import Spinner from "@/components/shared/Spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import {getFlattenedConversations} from "@/lib/services/server/chat.server";
import {useUserContext} from "@/context/UserContext";
import {useStatusContext} from "@/context/StatusContext";

// ---
// Memoized Conversation Item (Giữ nguyên logic tối ưu)
// ---
export const ConversationItem = memo(({
                                          conversation,
                                          isSelected,
                                          isOnline,
                                          onSelectConversation
                                      }: {
    conversation: IConversationSummary;
    isOnline: boolean;
    isSelected: boolean;
    onSelectConversation: (conversation: IConversationSummary) => void;
}) => {
    const unreadCount = Number(conversation.unreadCounts?.[conversation.currentUserId]) || 0;
    const isSenderYou = conversation.lastMessage?.senderId === conversation.currentUserId;

    const partnerId = conversation?.user?._id;
    let partnerUnreadCount = 0;

    if (partnerId) {
        partnerUnreadCount = Number(conversation.unreadCounts?.[partnerId]) || 0;
    }

    const lastMessageContent = conversation?.lastMessage?.content;
    const displayMessage = isSenderYou
        ? `You: ${lastMessageContent}`
        : lastMessageContent;

    const partnerUsername = conversation?.user?.username;

    return (
        <Link
            key={conversation.conversationId}
            prefetch={true}
            href={partnerUsername ? `/inbox/${partnerUsername}` : '#'}
            onClick={() => onSelectConversation(conversation)}
            className={clsx(
                'flex items-stretch gap-4 cursor-pointer p-4 rounded-lg transition-colors',
                isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
        >
            <Avatar
                src={conversation?.user?.profilePicture ?? ''}
                username={partnerUsername ?? ''}
                size={48}
                className={'border border-gray-200'}
                isOnline={Boolean(isOnline)}
            />
            <div className="flex-1 flex flex-col min-w-0 justify-between">
                <p className="text-sm font-semibold text-gray-800 truncate">
                    {partnerUsername}
                </p>
                <p className={clsx("text-gray-600 text-sm truncate",
                    unreadCount > 0 && 'text-gray-700 font-medium')}>
                    {displayMessage}
                </p>
            </div>
            <div className="ml-auto flex flex-col items-end justify-between min-w-[30px]">
                <p className={'text-xs text-gray-500 mb-1'}>
                    {conversation?.lastMessage?.timestamp &&
                        formatISOTime(conversation?.lastMessage?.timestamp, 'relative')}
                </p>
                {unreadCount > 0 && (
                    <div
                        className={'text-xs font-semibold bg-primary-500 rounded-full text-white w-5 h-5 flex items-center justify-center'}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
                {isSenderYou && partnerUnreadCount === 0 && (
                    <Avatar
                        username={conversation?.user?.username ?? ''}
                        src={conversation?.user?.profilePicture ?? ''}
                        size={16}
                        className="border-1 border-green-500"
                    />
                )}
            </div>
        </Link>
    );
});

ConversationItem.displayName = 'ConversationItem';

// ---
// Main Component
// ---

// Giới hạn cho mỗi lần tải (có thể là hằng số global)
const CONVERSATION_LIMIT = 10;

export default function MessageSidebar({
                                           classname,
                                           initConversations // Giờ đây chỉ là batch đầu tiên
                                       }: {
    classname?: string,
    initConversations: IConversationSummary[]
}) {
    const params = useParams();
    const username = Array.isArray(params.username) ? params.username[0] : params.username;
    const {user} = useUserContext();

    const {setConversations, conversations, selectedConversation, setSelectedConversation} = useConversationContext();
    const {online} = useStatusContext();

    // 💡 Logic Infinite Scroll State
    const [hasMoreConversations, setHasMoreConversations] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // 💡 Tối ưu hóa: Thay thế initConversations bằng dữ liệu ban đầu
    useEffect(() => {
        if (initConversations) {
            setConversations(initConversations);
            // Kiểm tra xem batch đầu tiên đã đầy đủ hay chưa
            if (initConversations.length < CONVERSATION_LIMIT) {
                setHasMoreConversations(false);
            }
        }

        return () => {
            setSelectedConversation(null);
        }
    }, []);

    // 💡 Logic tải thêm hội thoại (Mock function)
    const loadMoreConversations = async () => {
        if (isLoadingMore || !hasMoreConversations || !user?.id) return;

        setIsLoadingMore(true);

        // **Đây là nơi bạn gọi API để tải thêm hội thoại**
        // Lấy timestamp/ID của hội thoại cuối cùng để phân trang
        const lastConversationTimestamp = conversations[conversations.length - 1]?.lastMessage?.timestamp;

        console.log({
            limit: CONVERSATION_LIMIT,
            lastTimestamp: lastConversationTimestamp
        })
        // --- MOCK API CALL START ---
        // Thay thế bằng hàm service/API thực tế: getMoreConversations(lastTimestamp, CONVERSATION_LIMIT)
        const newConversation = await getFlattenedConversations(user?.id, {
            limit: CONVERSATION_LIMIT,
            lastTimestamp: lastConversationTimestamp
        });
        // --- MOCK API CALL END ---
        // setConversations(prev => [...prev, ...newConversation]);

        setIsLoadingMore(false);

        if (newConversation.length > 0) {
            setConversations([...conversations, ...newConversation]);
            // Nếu số lượng ít hơn giới hạn, đánh dấu là hết dữ liệu
            if (newConversation.length < CONVERSATION_LIMIT) {
                setHasMoreConversations(false);
            }
        } else {
            // Trường hợp không có dữ liệu trả về
            setHasMoreConversations(false);
        }
    };

    const targetConversation = useMemo(() => {
        return conversations?.find(conversation => conversation.user?.username === username);
    }, [conversations, username]);

    useEffect(() => {
        if (targetConversation && targetConversation !== selectedConversation) {
            setSelectedConversation(targetConversation);
        }
        // if (!username && conversations.length > 0) {
        //     setSelectedConversation(conversations[0]);
        // }
    }, [selectedConversation, setSelectedConversation, targetConversation]);


    const handleSelectConversation = (conversation: IConversationSummary) => {
        setSelectedConversation(conversation);
    }

    return (
        <div className={clsx("flex flex-col gap-4", classname)}>
            <div className="p-6 font-semibold text-lg flex justify-between items-center border-b border-gray-200">
                All messages <CornerDownLeft size={16} className='text-gray-500'/>
            </div>

            {/* Message List - Sử dụng InfiniteScroll */}
            <div
                id="sidebarScrollableDiv" // ID cho scrollableTarget
                className="flex flex-col gap-1 overflow-y-auto flex-1 scrollbar-beautiful"
                style={{height: 'calc(100vh - 120px)'}}
            >
                <InfiniteScroll
                    dataLength={conversations.length}
                    next={loadMoreConversations}
                    hasMore={hasMoreConversations}
                    loader={
                        <div className="flex justify-center py-2">
                            <Spinner size="sm"/>
                        </div>
                    }
                    endMessage={
                        <p className="text-center text-gray-400 text-sm py-2">
                            All conversations loaded.
                        </p>
                    }
                    // Trỏ đến phần tử DIV cha là scrollableTarget
                    scrollableTarget="sidebarScrollableDiv"
                    className="flex flex-col gap-1"
                >
                    {conversations.map((conversation) => {
                        const isSelected = selectedConversation?.conversationId === conversation.conversationId;

                        return (
                            <ConversationItem
                                isOnline={Boolean(online.get(conversation.user?._id ?? ''))}
                                key={conversation.conversationId}
                                conversation={conversation}
                                isSelected={isSelected}
                                onSelectConversation={handleSelectConversation}
                            />
                        );
                    })}
                </InfiniteScroll>

                {/* Xử lý trường hợp không có hội thoại nào */}
                {conversations.length === 0 && !isLoadingMore && (
                    <div className="p-4 text-center text-gray-500">
                        No conversations found.
                    </div>
                )}
            </div>
        </div>
    );
}