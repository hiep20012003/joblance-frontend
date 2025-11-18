// useNotification.ts
'use client';

import {useCallback, useEffect, useState, useRef} from "react";
import {useToast} from "@/context/ToastContext";
import {INotificationDocument} from "@/types/notification";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {getNotifications, markNotificationAsRead} from "@/lib/services/client/notification.client";
import {useConversationContext} from "@/context/ChatContext";
import {IConversationDocument, IConversationSummary, IMessageDocument} from "@/types/chat";
import {usePathname} from "next/navigation";
import {getFlattenedConversations} from "@/lib/services/server/chat.server";

// Thêm import logger
import {logInfo, logError, logWithTrace} from "@/lib/utils/devLogger";
import {useSocketManager} from "@/context/SocketContext";
import {useStatusContext} from "@/context/StatusContext";

export function useNotification(userId: string) {
    // 1. Hook Initialization
    logInfo('Notification', 'Initializing useNotification', {userId});

    // Sử dụng useSocketManager
    const {socket, isConnected} = useSocketManager("/notifications");

    const {addToastByType} = useToast();
    const pathname = usePathname();
    const {setConversations, conversations} = useConversationContext();
    const {requestStatus} = useStatusContext();

    const [notifications, setNotifications] = useState<INotificationDocument[]>([]);

    // Refs để tránh stale closure
    const userIdRef = useRef(userId);
    const pathnameRef = useRef(pathname);

    // Update refs
    useEffect(() => {
        userIdRef.current = userId;
        pathnameRef.current = pathname;
    }, [userId, pathname]);

    // Fetch notifications mutation (Không thay đổi)
    const {mutate: getNotificationsMutate, loading} = useFetchMutation(
        getNotifications,
        {
            disableToast: true,
            onSuccess: (data: INotificationDocument[]) => {
                logInfo('Notification', 'Notifications fetched successfully', {count: data.length});
                setNotifications(data);
            },
            onError: () => {
                logError('Notification', 'Failed to fetch notifications');
            },
        }
    );

    // Mark as read mutation (Không thay đổi)
    const {mutate: markAsReadMutate} = useFetchMutation(
        markNotificationAsRead,
        {
            disableToast: true,
            onSuccess: (data: INotificationDocument) => {
                logInfo('Notification', 'Notification marked as read', {notificationId: data._id});
                setNotifications(prev =>
                    prev.map(n => n._id === data._id ? data : n)
                );
            },
            onError: () => {
                logError('Notification', 'Failed to mark notification as read');
            },
        }
    );

    // Memoized mark as read function (Không thay đổi)
    const markAsRead = useCallback(
        (notificationId: string) => {
            logWithTrace('Notification', 'Marking notification as read', {notificationId});
            markAsReadMutate(notificationId);
        },
        [markAsReadMutate]
    );

    // Fetch initial notifications (Không thay đổi)
    useEffect(() => {
        if (!userId) return;

        logWithTrace('Notification', 'Fetching notifications', {userId});
        getNotificationsMutate({userId});
    }, [userId]);

    // =======================================================
    // 2. HANDLERS ĐƯỢC ĐẨY RA NGOÀI VÀ BỌC USECALLBACK
    // =======================================================

    // Handler: Logic tham gia phòng
    const joinRoom = useCallback(() => {
        if (socket && userId) {
            socket.emit("notifications:join", userId);
            logInfo('Notification', `Joined notifications room for user ${userId}`);
        }
    }, [socket, userId]);


    // Handler: Common notification
    const handleCommonNotification = useCallback((n: INotificationDocument) => {
        logInfo('Notification', 'New common notification received', {notificationId: n._id, type: n.type});

        setNotifications(prev => [n, ...prev]);

        const message = (
            <span className="flex-1 text-sm font-medium">
                <strong>{n.actor.username}</strong> {n.payload.message}
            </span>
        );
        addToastByType(message, 'notification');
    }, [addToastByType]);


    // Handler: Chat alert notification
    const handleAlertChatNotification = useCallback((data: {
        message: IMessageDocument;
        conversation: IConversationDocument;
        isNewConversation?: boolean;
        type: string;
    }) => {
        logInfo('Notification', 'Chat alert notification received', {
            message: data.message.content,
            conversationId: data.conversation._id,
            type: data.type,
            pathname: pathnameRef.current // Dùng Ref
        });

        // Only show toast if not on /inbox page
        if (data.type === 'alert' && !pathnameRef.current.includes('/inbox')) {
            const notification = (
                <span className="flex-1 text-sm font-medium">Bạn có tin nhắn mới</span>
            );
            addToastByType(notification, 'notification');
        }
    }, [addToastByType]);


    // Handler: Update conversation list
    const handleUpdateListChatNotification = useCallback(async (data: {
        message: IMessageDocument;
        conversation: IConversationDocument;
        isNewConversation?: boolean;
        type: string;
    }) => {
        const {message, isNewConversation, conversation} = data;
        console.log('test', data)

        logInfo('Notification', 'Updating conversation list from chat notification', {
            messageId: message._id,
            isNewConversation,
            conversationId: conversation._id
        });

        if (isNewConversation) {
            // Fetch entire conversation list for new conversations
            try {
                // Dùng Ref cho userId
                requestStatus(message.senderId)
                const newConversations = await getFlattenedConversations(userIdRef.current);
                setConversations(newConversations);
            } catch (error) {
                logError('Notification', 'Failed to fetch conversations for new chat notification', {error});
            }
        } else {
            // SỬA DỤNG HÀM SETTER FORM CỦA setConversations
            setConversations(prev => {
                const existingConversation = prev.find(
                    con => con.conversationId === message.conversationId
                );

                if (!existingConversation) return prev;

                const updatedConversation: IConversationSummary = {
                    ...existingConversation,
                    lastMessage: message as any,
                    unreadCounts: conversation.unreadCounts,
                };

                const filtered = prev.filter(
                    con => con.conversationId !== message.conversationId
                );

                return [updatedConversation, ...filtered];
            });
        }
    }, [setConversations]); // Loại bỏ conversations khỏi dependencies


    // Handler: Read conversation
    const handleReadConversationNotification = useCallback((data: {
        conversation: IConversationDocument;
        readByUserId: string;
    }) => {
        logInfo('Notification', 'Conversation read event received', {
            conversationId: data.conversation._id,
            readByUserId: data.readByUserId
        });

        const {conversation, readByUserId} = data;

        // SỬA DỤNG HÀM SETTER FORM CỦA setConversations
        setConversations(prev =>
            prev.map(con => {
                if (con.conversationId !== conversation._id) return con;

                const currentUnreadCount = conversation.unreadCounts;

                return {
                    ...con,
                    unreadCounts: currentUnreadCount,
                };
            })
        );
    }, [setConversations]); // Loại bỏ conversations khỏi dependencies

    // =======================================================
    // 3. SOCKET LISTENERS SETUP
    // =======================================================

    useEffect(() => {
        logInfo('Notification', `Socket Status check (Zustand): socket=${!!socket}, userId=${!!userId}, isConnected=${isConnected}`);

        // Điều kiện chạy logic nghiệp vụ: Phải có socket, userId
        if (!socket || !userId) return;

        // --- ĐĂNG KÝ LISTENER DỮ LIỆU ---
        socket.on("notification:new", handleCommonNotification);
        socket.on("chat:alert", handleAlertChatNotification);
        socket.on("chat:list_update", handleUpdateListChatNotification);
        socket.on("conversation:read", handleReadConversationNotification);

        // --- CHẠY LOGIC KẾT NỐI KHI CÓ TRẠNG THÁI ---
        if (isConnected) {
            // Chạy logic tham gia phòng khi isConnected là true
            joinRoom();
            logInfo('Notification', 'Socket is connected, joining room directly.');
        } else {
            logInfo('Notification', 'Socket not connected yet, listeners registered, waiting for connection.');
        }

        // Cleanup: Xóa tất cả listeners khi component unmount hoặc dependencies thay đổi
        return () => {
            socket.off("notification:new", handleCommonNotification);
            socket.off("chat:alert", handleAlertChatNotification);
            socket.off("chat:list_update", handleUpdateListChatNotification);
            socket.off("conversation:read", handleReadConversationNotification);
            socket.emit("notifications:leave", userId);
            logInfo('Notification', 'Cleanup complete, left room.');
        };

        // Dependencies: Tất cả các hàm handler (đã bọc useCallback) và socket/state
    }, [
        socket,
        userId,
        isConnected,
        joinRoom,
        handleCommonNotification,
        handleAlertChatNotification,
        handleUpdateListChatNotification,
        handleReadConversationNotification
    ]);

    return {
        notifications,
        markAsRead,
        loading,
    };
}