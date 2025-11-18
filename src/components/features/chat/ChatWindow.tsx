'use client';

import {MoreVertical, MoveDown, Search, Star} from "lucide-react";
import React, {useCallback, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {useParams} from "next/navigation";
import {useConversationContext} from "@/context/ChatContext";
import Avatar from "@/components/shared/Avatar";
import {MESSAGES_LIMIT, useChat} from "@/lib/hooks/useChat";
import {useUserContext} from "@/context/UserContext";
import AttachmentViewer from "@/components/shared/AttachmentViewer";
import {formatISOTime} from "@/lib/utils/time";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "@/components/shared/Spinner";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {ChatInput, SendMessagePayload} from "@/components/features/chat/ChatInput";
import {useDirectValidation} from "@/lib/hooks/useValidation";
import {createMessageSchema} from "@/lib/schemas/chat.schema";
import {MessageType} from "@/lib/constants/constant";
import {IMessageDocument} from "@/types/chat";
import {useStatusContext} from "@/context/StatusContext";
import MenuDropdown from "@/components/shared/MenuDropdown";
import Link from "next/link"; // Import Type

// 💡 Tối ưu hóa 1: Tách Message Item ra thành component memoized
const MemoizedMessageItem = React.memo(({
                                            msg,
                                            isMyMessage,
                                            isLastestMessage,
                                            isLastReadMessage,
                                            lastestMessageRef,
                                            conversationUser,
                                            currentUserId,
                                        }: {
    msg: IMessageDocument;
    isMyMessage: boolean;
    isLastestMessage: boolean;
    isLastReadMessage: boolean;
    lastestMessageRef: React.RefObject<HTMLDivElement | null>;
    conversationUser: { username: string; profilePicture: string } | undefined;
    currentUserId: string | undefined;
}) => {
    return (
        <div
            ref={isLastestMessage ? lastestMessageRef : null}
            key={msg._id}
            className={clsx("flex gap-3 mb-4", isMyMessage ? "justify-end" : "justify-start")}
        >
            {!isMyMessage && (
                <Avatar
                    username={conversationUser?.username ?? ''}
                    src={conversationUser?.profilePicture ?? ''}
                    size={32}
                    className="border border-gray-200 flex-shrink-0"
                />
            )}

            <div
                className={clsx(
                    "flex flex-col max-w-[70%]",
                    isMyMessage ? "items-end" : "items-start"
                )}
            >
                <div
                    className={clsx(
                        "flex items-center justify-center gap-2 mb-1",
                        isMyMessage ? "flex-row-reverse" : "flex-row"
                    )}
                >
                    <p className="font-medium text-sm text-gray-800">
                        {isMyMessage ? "Me" : conversationUser?.username ?? ""}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatISOTime(msg.timestamp, 'month_day_time_ampm')}
                    </p>
                    {isLastReadMessage && !isLastestMessage && (
                        <p className="text-xs text-gray-500">
                            Read •
                        </p>
                    )}
                </div>

                <div
                    className={clsx(
                        "rounded-xl text-gray-900 break-words max-w-120",
                        msg.type === MessageType.TEXT ? (isMyMessage
                            ? "bg-primary-500 text-white px-4 py-2 "
                            : "bg-gray-100 px-4 py-2 break-words max-w-120") : 'py-2',
                        msg.isSending ? 'opacity-70' : ''
                    )}
                >
                    {msg.type === MessageType.TEXT ? (
                        <p className="text-base">{msg.content}</p>
                    ) : (
                        <AttachmentViewer attachment={msg?.attachments?.[0]}/>
                    )}
                </div>

                <div className="w-full mt-2 mr-2 flex justify-end items-center gap-1">
                    {isLastReadMessage && (
                        <Avatar
                            username={conversationUser?.username ?? ''}
                            src={conversationUser?.profilePicture ?? ''}
                            size={16}
                            className="border-1 border-green-500"
                        />
                    )}
                    {msg.isSending && (
                        <span className={'text-gray-500 text-xs'}>Sending...</span>
                    )}
                    {msg.isError && ( // Giả sử có cờ isError từ useChat
                        <span className={'text-red-500 text-xs'}>Failed</span>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: chỉ re-render khi các props này thay đổi
    return (
        prevProps.msg._id === nextProps.msg._id &&
        prevProps.msg.isSending === nextProps.msg.isSending &&
        prevProps.msg.isError === nextProps.msg.isError &&
        prevProps.isLastReadMessage === nextProps.isLastReadMessage &&
        prevProps.isLastestMessage === nextProps.isLastestMessage &&
        prevProps.conversationUser?.profilePicture === nextProps.conversationUser?.profilePicture
    );
});

MemoizedMessageItem.displayName = "MemoizedMessageItem";


export default function ChatWindow({className}: { className?: string }) {
    // 💡 Tạm thời dùng useParams, cần chuyển sang nhận prop conversationId như đã thảo luận
    const {username} = useParams();
    const {user} = useUserContext();
    const userId = user?.id;
    const {conversations} = useConversationContext();
    const {online, lastActive} = useStatusContext();
    const conversation = conversations.find(c => c.user?.username === username);

    const [lastReadMessageId, setLastReadMessageId] = useState<string | undefined>(undefined);
    const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
    const [countNewMessage, setCountNewMessage] = useState(0);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    // 💡 Ref lưu trữ ID của tin nhắn mới nhất đã được xử lý để tránh đếm tin cũ
    const lastProcessedMessageId = useRef<string | undefined>(undefined);

    const lastestMessageRef = useRef<HTMLDivElement>(null);
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    const moreBtnRef = useRef<HTMLButtonElement>(null);

    const {
        messages,
        initLoading,
        hasMoreMessages,
        loadOlderMessages,
        sendMessages,
    } = useChat(conversation?.conversationId);

    // 💡 Tối ưu hóa 5: scrollToBottom
    const scrollToBottom = useCallback(() => {
        const scrollDiv = scrollableDivRef.current;
        if (scrollDiv) {
            scrollDiv.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        setIsScrollButtonVisible(false);
        setCountNewMessage(0);
    }, []);

    // 💡 Auto scroll to bottom on initial load
    // useEffect(() => {
    //     if (!initLoading && messages.length > 0) {
    //         scrollToBottom();
    //     }
    // }, [initLoading, messages.length, scrollToBottom]);


    // 💡 Tối ưu hóa 6: Cập nhật lastReadMessageId VÀ LOGIC ĐẾM TIN NHẮN CHỈ KHI CÓ TIN MỚI
    useEffect(() => {
        const lastReadMessage = [...messages]
            .find(message => message.readAt && message.senderId === userId);

        setLastReadMessageId(lastReadMessage?._id ?? undefined);

        if (messages.length === 0) return;

        const latestMessage = messages[0];
        const isLatestMessageFromOther = latestMessage.senderId !== userId;

        // 1. Kiểm tra nếu tin nhắn mới nhất đã được xử lý (tránh đếm tin cũ/tải lại)
        if (latestMessage._id === lastProcessedMessageId.current) {
            return;
        }

        // 2. Cập nhật ID tin nhắn mới nhất đã được xử lý
        lastProcessedMessageId.current = latestMessage._id;

        if (isLatestMessageFromOther) {
            // Đây là tin nhắn mới TỪ NGƯỜI KHÁC

            if (isScrollButtonVisible) {
                // Tăng count nếu người dùng đang cuộn lên
                setCountNewMessage(prev => prev + 1);
            } else {
                // Nếu người dùng đang ở cuối trang, tự động cuộn xuống
                scrollToBottom();
            }
        } else {
            // Đây là tin nhắn mới TỪ CHÍNH MÌNH GỬI
            // Luôn đảm bảo cuộn xuống cuối
            scrollToBottom();
        }

    }, [messages, userId, isScrollButtonVisible, scrollToBottom]);

    // 💡 Tối ưu hóa 7: Intersection Observer (Theo dõi tin nhắn cuối cùng & Reset Count)
    useEffect(() => {
        const lastMessageContainer = lastestMessageRef.current;
        const scrollDiv = scrollableDivRef.current;

        if (!lastMessageContainer || !scrollDiv) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Nếu tin nhắn MỚI NHẤT KHÔNG nằm trong viewport (cuộn lên trên)
                if (!entry.isIntersecting) {
                    setIsScrollButtonVisible(true);
                } else {
                    // Nếu tin nhắn MỚI NHẤT nằm trong viewport (cuộn xuống cuối)
                    setIsScrollButtonVisible(false);
                    // RESET COUNT khi tin nhắn cuối cùng đi vào viewport (khắc phục lỗi cuộn nhanh)
                    setCountNewMessage(0);
                }
            })
        }, {
            root: scrollDiv,
            // Sử dụng rootMargin để kiểm soát khoảng cách mà nút cuộn sẽ xuất hiện
            rootMargin: "0px 0px 300px 0px",
            threshold: 0,
        });

        observer.observe(lastMessageContainer);

        return () => {
            observer.unobserve(lastMessageContainer);
        }
    }, [messages, userId]);


    // 💡 Tối ưu hóa 8 & 9: Logic xử lý Form và Gửi tin nhắn
    const {parse} = useDirectValidation(createMessageSchema);

    const getFormData = useCallback((payload: SendMessagePayload) => {
        const data = new FormData();
        data.append("senderId", userId as string);
        if (payload.type === MessageType.TEXT) {
            data.append("type", MessageType.TEXT);
            data.append("content", payload.content);
        } else if (payload.type === "file" && payload.file) {
            data.append("type", MessageType.MEDIA);
            data.append("attachment", payload.file);
        }
        return data;
    }, [userId]);

    const validateForm = useCallback((payload: SendMessagePayload) => {
        const formData = getFormData(payload);
        const senderId = formData.get("senderId") as string;
        const type = formData.get("type") as MessageType;
        let content;
        let attachment;

        if (payload.type === "file") {
            attachment = formData.get("attachment") as File
        } else if (payload.type === "text") {
            content = formData.get("content") as string;
        }

        const data = {senderId, content, attachment, type};
        const {valid} = parse(data);
        return valid;
    }, [getFormData, parse]);

    const handleSendMessage = useCallback(async (payload: SendMessagePayload) => {
        if (!validateForm(payload)) {
            return;
        }

        const formData = getFormData(payload)
        await sendMessages(formData);

    }, [validateForm, getFormData, sendMessages]);

    const isOnline = Boolean(online.get(conversation?.user?._id ?? ''));
    const lastActiveRaw = lastActive.get(conversation?.user?._id ?? '');
    const lastActiveTimestamp =
        typeof lastActiveRaw === 'number' && !Number.isNaN(lastActiveRaw)
            ? lastActiveRaw * 1000
            : null;

    return (
        <>
            <div className={clsx("flex flex-col h-full", className)}>
                {/* Header */}
                <div
                    className="p-4 shadow-[0_2px_8px_0px_rgba(0,0,0,0.06)] flex items-center justify-between relative z-10 bg-white">
                    <div className="flex items-center gap-4">
                        <Avatar
                            username={conversation?.user?.username ?? ''}
                            src={conversation?.user?.profilePicture ?? ''}
                            size={46}
                            isOnline={isOnline}
                            className="border border-gray-200"
                        />
                        <div>
                            <p className="font-semibold text-lg">{conversation?.user?.username}</p>

                            {isOnline ? (
                                <p className="text-sm text-gray-500">Online</p>
                            ) : lastActiveTimestamp ? (
                                <p className="text-sm text-gray-500">
                                    {formatISOTime(new Date(lastActiveTimestamp), 'relative')}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">Offline</p>
                            )}
                        </div>

                    </div>
                    {conversation?.user?.isSeller && (
                        <div className="flex items-center space-x-4">
                            {/*<Search size={20} className="text-gray-500 cursor-pointer"/>*/}
                            {/*<Star size={20} className="text-gray-500 cursor-pointer"/>*/}
                            <button className={'btn btn-plain px-1.5 text-gray-500'} ref={moreBtnRef}
                                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}>
                                <MoreVertical size={20}/>
                            </button>
                        </div>
                    )}
                </div>

                {/*Messages*/}
                <LoadingWrapper
                    isLoading={initLoading}
                    backgroundTransparent={true}
                    id="scrollableDiv"
                    ref={scrollableDivRef}
                    className="overflow-y-auto flex-1 flex flex-col-reverse bg-white p-4 scrollbar-beautiful h-full"
                >
                    <InfiniteScroll
                        className={'gap-2'}
                        dataLength={messages.length}
                        next={loadOlderMessages}
                        hasMore={hasMoreMessages}
                        inverse={true}
                        scrollableTarget="scrollableDiv"
                        loader={
                            <div className="flex justify-center py-4">
                                <Spinner size="sm"/>
                            </div>
                        }
                        endMessage={
                            messages.length > MESSAGES_LIMIT && (
                                <p className="text-center text-gray-400 text-sm py-2">
                                    No more messages
                                </p>
                            )
                        }
                        style={{display: 'flex', flexDirection: 'column-reverse'}}
                    >
                        {messages.map((msg, index) => {
                            const isMyMessage = msg.senderId === userId;
                            const isLastestMessage = index === 0;
                            const isLastReadMessage = msg._id === lastReadMessageId;

                            return (
                                <MemoizedMessageItem
                                    key={msg._id}
                                    msg={msg}
                                    isMyMessage={isMyMessage}
                                    isLastestMessage={isLastestMessage}
                                    isLastReadMessage={isLastReadMessage}
                                    lastestMessageRef={lastestMessageRef}
                                    conversationUser={conversation?.user as any}
                                    currentUserId={userId}
                                />
                            );
                        })}
                    </InfiniteScroll>
                </LoadingWrapper>

                {/* Input */}
                <div className=" bg-white relative z-10 border-t border-gray-200">
                    <button
                        onClick={scrollToBottom}
                        className={clsx(
                            'absolute -top-16 right-1/2 translate-x-1/2 btn p-2.5 rounded-full bg-white justify-center items-center w-fit h-fit shadow-xl border border-gray-200 transition-all duration-300 ease-in-out',
                            isScrollButtonVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4 pointer-events-none'
                        )}
                    >
                        {countNewMessage > 0 ? (
                            <div
                                className={'h-5 w-5 flex justify-center items-center text-sm font-semibold text-primary-500'}>
                                +{countNewMessage}
                            </div>
                        ) : (
                            <MoveDown size={16} className="text-primary-600" strokeWidth={3}/>)}
                    </button>
                    <ChatInput onSend={handleSendMessage}/>
                </div>
            </div>

            <MenuDropdown
                anchorRef={moreBtnRef}
                isOpen={moreMenuOpen}
                onClose={() => setMoreMenuOpen(false)}
                className="flex flex-col w-40"
            >
                <Link href={`/${conversation?.user?.username ?? ''}`}
                      className={clsx('btn btn-plain font-normal justify-start')}>
                    View Seller Profile
                </Link>
            </MenuDropdown>
        </>

    );
}