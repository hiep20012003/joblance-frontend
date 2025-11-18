export interface IConversationDocument {
    _id: string,
    participants: string[];
    lastMessage?: {
        _id: string;
        content: string;
        senderId: string;
        timestamp: string;
    };
    unreadCounts: Record<string, number>;
    isArchived: Record<string, boolean>;
    createdAt: Date | string;
    updatedAt: Date | string;
}


export interface IMessageDocument {
    _id: string,
    conversationId: string;
    senderId: string;
    content: string;
    type: MessageType;
    metadata: any;
    read: boolean;
    readAt: string | null;
    attachments: IFile[];
    isDeleted: boolean; // Xóa mềm
    timestamp: Date | string;
    isSending?: boolean;
    isError?: boolean;
}

export interface IConversationSummary {
    currentUserId: string;
    conversationId: string;
    lastMessage: {
        _id: string;
        content: string;
        senderId: string;
        timestamp: string;
    } | null;
    unreadCounts: {
        [key: string]: number | null;
    };
    user: {
        _id: string;
        username: string;
        profilePicture?: string;
        email: string;
        isSeller: boolean;
    } | null;
    isArchived: boolean;
}
