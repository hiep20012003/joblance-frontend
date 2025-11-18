export interface INotificationDocument {
    _id?: string | ObjectId
    messageId?: string;
    actor: {
        id: string;
        role: string;
        username: string;
        avatar: string;
    };

    payload: {
        message: string;
        extra?: Record<string, any>
    };
    type?: NotificationType;
    recipient: {
        id: string;
        role: string;
        username: string;
        avatar: string;
    };
    channel?: NotificationChannel;
    read?: boolean;
    delivered?: boolean;
    timestamp?: string;
}