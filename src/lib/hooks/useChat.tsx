// useChat.ts
'use client';

import {useCallback, useEffect, useState, useRef} from "react";
// SỬA ĐỔI: Thay thế useSocket bằng useSocketManager từ Zustand hook
import {useToast} from "@/context/ToastContext";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {createMessage, getMessages, readConversation} from "@/lib/services/client/chat.client";
import {IConversationDocument, IConversationSummary, IMessageDocument} from "@/types/chat";
import {MessageType} from "@/lib/constants/constant";
import {v4 as uuidv4} from "uuid";
import {useConversationContext} from "@/context/ChatContext";
import {useUserContext} from "@/context/UserContext";
import {logWithTrace, logInfo, logError} from "@/lib/utils/devLogger";
import {useSocketManager} from "@/context/SocketContext";

export const MESSAGES_LIMIT = 30;

interface MessageQueueItem {
    tempId: string;
    formData: FormData;
}

export function useChat(conversationId?: string) {
    logInfo("useChat", "Hook initialized", {conversationId});

    // SỬA ĐỔI: Sử dụng useSocketManager
    const {socket, isConnected} = useSocketManager("/chats");

    const {addToastByType} = useToast();
    const {user} = useUserContext();

    // State
    const [messages, setMessages] = useState<IMessageDocument[]>([]);
    const [lastTimestamp, setLastTimestamp] = useState<string>();
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [messageQueue, setMessageQueue] = useState<MessageQueueItem[]>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [loadOlderMessagesLoading, setLoadOlderMessagesLoading] = useState(false);

    const {setConversations, conversations} = useConversationContext();

    const conversationIdRef = useRef(conversationId);
    const userIdRef = useRef(user?.id);
    const needRead = useRef(true);

    // Update refs
    useEffect(() => {
        conversationIdRef.current = conversationId;
        userIdRef.current = user?.id;
    }, [conversationId, user?.id]);

    // Get messages mutation (Không thay đổi)
    const {mutate: getMessageMutate} = useFetchMutation(getMessages, {
        disableToast: true,
        onSuccess: async (data: IMessageDocument[]) => {
            logWithTrace("useChat", "Messages fetched successfully", {count: data?.length, conversationId});
            if (data?.length > 0) {
                setMessages(prev => lastTimestamp ? [...prev, ...data] : data);
                setLastTimestamp(data[data.length - 1].timestamp as string);
                setHasMoreMessages(data.length >= MESSAGES_LIMIT);
            } else {
                setHasMoreMessages(false);
            }
        },
        onError: (err) => {
            logError("useChat", "Failed to load messages", err);
            addToastByType("Failed to load messages. Try again!", "error");
        },
    });

    // Create message mutation (Không thay đổi)
    const {mutate: createNewMessage} = useFetchMutation(
        (formData: FormData) => createMessage(conversationId ?? '', formData),
        {
            disableToast: true,
            onSuccess: (data: any) => {
                const message = data.message as IMessageDocument;
                logWithTrace("useChat", "Message created successfully", {
                    messageId: message._id,
                    tempId: messageQueue[0]?.tempId
                });

                const conData = data.conversation as IConversationDocument;
                setConversations(prev => {
                    const exist = prev.find(c => c.conversationId === message.conversationId);
                    if (!exist) return prev;

                    const updated = {
                        ...exist,
                        lastMessage: {
                            _id: message._id,
                            content: message.type === MessageType.MEDIA ? 'Attachment' : message.content,
                            senderId: message.senderId,
                            timestamp: message.timestamp,
                        },
                        unreadCounts: conData.unreadCounts,
                    } as IConversationSummary;

                    return [updated, ...prev.filter(c => c.conversationId !== message.conversationId)];
                });
            },
            onError: (err) => {
                const tempId = messageQueue[0]?.tempId;
                logError("useChat", "Message failed to send", {tempId, error: err});
                if (tempId) {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg._id === tempId ? {...msg, isSending: false, isError: true} : msg
                        )
                    );
                }
                addToastByType("Message failed to send. Please try again.", "error");
            },
        }
    );

    // Read conversation mutation (Không thay đổi)
    const {mutate: readConversationMutate, loading: isReading} = useFetchMutation(
        readConversation,
        {
            disableToast: true,
            onSuccess: (data: {
                conversation: IConversationDocument;
                readByUserId: string;
            }) => {
                logInfo("useChat", "Conversation marked as read", {
                    conversationId: data.conversation._id,
                    readByUserId: data.readByUserId
                });
                setConversations(prev => prev.map(con =>
                        con.conversationId === data.conversation._id
                            ? {...con, unreadCounts: data.conversation.unreadCounts}
                            : con
                    )
                );
                needRead.current = false;
            },
            onError: (err) => {
                logError("useChat", "Failed to mark conversation as read", err);
            },
        }
    );

    // =======================================================
    // 2. HANDLERS ĐƯỢC ĐẨY RA NGOÀI VÀ BỌC USECALLBACK
    // =======================================================

    // Read messages function
    const readMessages = useCallback(async () => {
        if (!conversationIdRef.current || isReading) {
            return;
        }

        // Không cần kiểm tra currentConversation vì đã loại bỏ conversations khỏi dependency
        if (!needRead.current) {
            return;
        }

        logInfo("useChat", "Calling readConversationMutate", {conversationId: conversationIdRef.current});
        // Dùng conversationIdRef.current thay vì conversationId (vì nó không phải dependency)
        await readConversationMutate(conversationIdRef.current);
    }, [isReading, readConversationMutate]);

    // Load older messages
    const loadOlderMessages = useCallback(async () => {
        if (!conversationId || !lastTimestamp || !hasMoreMessages || loadOlderMessagesLoading) {
            return false;
        }

        logInfo("useChat", "Loading older messages", {lastTimestamp, conversationId});
        setLoadOlderMessagesLoading(true);
        try {
            await getMessageMutate({conversationId, lastTimestamp, limit: MESSAGES_LIMIT});
            return true;
        } finally {
            setLoadOlderMessagesLoading(false);
        }
    }, [conversationId, lastTimestamp, hasMoreMessages, loadOlderMessagesLoading, getMessageMutate]);

    // Send message (Không thay đổi)
    const sendMessages = useCallback(async (formData: FormData) => {
        if (!conversationId) return false;

        const tempId = uuidv4();
        formData.append("_id", tempId);
        const type = formData.get("type") as MessageType;
        const file = formData.get("attachment") as File;

        let attachment: { fileName: string; fileType: string; fileSize: number } | undefined;
        if (file) {
            attachment = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            };
        }

        const optimisticMessage: IMessageDocument = {
            _id: tempId,
            conversationId,
            senderId: formData.get("senderId") as string,
            content: formData.get("content") as string,
            type,
            metadata: null,
            read: false,
            readAt: null,
            attachments: attachment ? [attachment] : [],
            isDeleted: false,
            timestamp: new Date().toISOString(),
            isSending: true,
        } as IMessageDocument;

        logWithTrace("useChat", "Optimistic message added & queued", {
            tempId,
            content: optimisticMessage.content,
            type
        });
        setMessages(prev => [optimisticMessage, ...prev]);
        setMessageQueue(prev => [...prev, {tempId, formData}]);

        return true;
    }, [conversationId]);

    // Logic tham gia phòng
    const joinRoom = useCallback(() => {
        if (socket && conversationId && userIdRef.current) {
            socket.emit('chat:authenticate', userIdRef.current);
            socket.emit("chat:join", conversationId);
            logInfo("Socket", "Joined chat room", {conversationId});
        }
    }, [socket, conversationId]);

    // Handler: Nhận tin nhắn mới
    const handleNewMessage = useCallback(async (data: any) => {
        const message = data.message as IMessageDocument;
        logWithTrace("Socket", "Received new message", {
            messageId: message._id,
            senderId: message.senderId,
            content: message.content
        });

        setMessages(prev => {
            const exists = prev.some(msg => msg._id === message._id);
            if (exists) {
                // Tin nhắn đã tồn tại (có thể là tin nhắn lạc hậu hoặc tin nhắn optimistic đã được xác nhận)
                return prev.map(msg =>
                    msg._id === message._id ? {...msg, ...message, isSending: false} : msg
                );
            }
            return [message, ...prev]; // Thêm tin nhắn mới
        });

        // Đánh dấu cần đọc lại nếu tin nhắn không phải của mình
        if (message.senderId !== userIdRef.current) {
            logInfo("Socket", "Message from other user → will mark as read", {messageId: message._id});
            needRead.current = true;
        }
    }, [setMessages]); // Dùng setter để tránh dependency phức tạp

    // Handler: Nhận xác nhận đã đọc
    const handleReadMessage = useCallback((data: {
        conversation: IConversationDocument;
        readByUserId: string;
        readUpToMessageId: string;
        readAt: string;
    }) => {
        logInfo("Socket", "Received read receipt", {
            readByUserId: data.readByUserId,
            upToMessageId: data.readUpToMessageId
        });

        setMessages(prev =>
            prev.map(msg =>
                // Chỉ cập nhật tin nhắn của chính mình
                msg._id === data.readUpToMessageId && msg.senderId === userIdRef.current
                    ? {...msg, read: true, readAt: data.readAt}
                    : msg
            )
        );

        // Cập nhật conversation list
        setConversations(prev =>
            prev.map(c =>
                c.conversationId === data.conversation._id
                    ? {
                        ...c,
                        unreadCounts: data.conversation.unreadCounts,
                        lastMessage: data.conversation.lastMessage
                    } as IConversationSummary
                    : c
            )
        );
    }, [setMessages, setConversations]);

    // =======================================================
    // 3. EFFECT LIFECYCLE
    // =======================================================

    // Process message queue (Không thay đổi)
    useEffect(() => {
        if (messageQueue.length === 0 || isProcessingQueue) return;

        const processQueue = async () => {
            setIsProcessingQueue(true);
            const {tempId, formData} = messageQueue[0];
            logInfo("useChat", "Processing message queue", {queueLength: messageQueue.length, currentTempId: tempId});

            try {
                await createNewMessage(formData);
                logInfo("useChat", "Message sent from queue successfully", {tempId});
            } catch (error) {
                logError("useChat", "Error processing queue item", {tempId, error});
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === tempId ? {...msg, isSending: false, isError: true} : msg
                    )
                );
            } finally {
                setMessageQueue(prev => prev.slice(1));
                setIsProcessingQueue(false);
            }
        };

        processQueue();
    }, [messageQueue, isProcessingQueue, createNewMessage]);

    // Initialize messages on conversation change (Không thay đổi)
    useEffect(() => {
        if (!conversationId) {
            logInfo("useChat", "Conversation cleared (no conversationId)");
            setMessages([]);
            setLastTimestamp(undefined);
            setHasMoreMessages(true);
            return;
        }

        logWithTrace("useChat", "Conversation changed → fetching initial messages", {conversationId});
        setMessages([]);
        setLastTimestamp(undefined);
        setHasMoreMessages(true);
        setInitLoading(true);

        getMessageMutate({conversationId, limit: MESSAGES_LIMIT}).finally(() => {
            setInitLoading(false);
        });
    }, [conversationId]);

    // Auto read messages when dependencies change
    useEffect(() => {
        if (needRead.current) {
            readMessages();
        }
    }, [readMessages]);

    // Socket event handlers
    useEffect(() => {
        // Chỉ chạy khi có socket VÀ conversationId
        if (!socket || !conversationId) return;

        // --- ĐĂNG KÝ LISTENERS ---
        socket.on("message:send", handleNewMessage);
        socket.on("message:read", handleReadMessage);

        // --- LOGIC KẾT NỐI VÀ RECONNECT ---
        // SỬA ĐỔI: Dùng isConnected để chạy joinRoom khi kết nối đã thiết lập
        if (isConnected) {
            joinRoom();
        }

        return () => {
            logInfo("Socket", "Leaving chat room", {conversationId});
            socket.off("message:send", handleNewMessage);
            socket.off("message:read", handleReadMessage);

            // Emit leave room khi component unmount hoặc conversationId thay đổi
            socket.emit("chat:leave", conversationId);
        };
        // Dependencies: socket, conversationId, isConnected và các handlers đã bọc useCallback
    }, [
        socket,
        conversationId,
        isConnected,
        joinRoom,
        handleNewMessage,
        handleReadMessage
    ]);

    return {
        messages,
        sendMessages,
        loadOlderMessages,
        initLoading,
        loadOlderMessagesLoading,
        hasMoreMessages,
    };
}