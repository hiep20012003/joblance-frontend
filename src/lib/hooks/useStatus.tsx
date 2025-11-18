// useStatus.ts
'use client'

// SỬA ĐỔI: Thay thế import useSocket bằng useSocketManager từ Zustand hook
import {useCallback, useEffect} from "react";
import {getListFollowedUserIds} from "@/lib/services/server/chat.server";
import {useStatusActionsStore, useStatusContext} from "@/context/StatusContext";

// Thêm import logger
import {logInfo, logError, logWithTrace} from "@/lib/utils/devLogger";
import {useUserContext} from "@/context/UserContext";
import {useSocketManager} from "@/context/SocketContext";

const HEARTBEAT_INTERVAL = 30000; // 30000 ms = 30 giây

export function useStatus() {
    const {user} = useUserContext();
    const userId = user?.id as string;

    logInfo('Presence', 'Initializing useStatus hook', {userId});

    // SỬA ĐỔI: Sử dụng useSocketManager để quản lý kết nối và lấy trạng thái
    const {socket, isConnected} = useSocketManager("/presence");

    const {setOnline, setOffline, setBatchStatus, setLastActive, setBatchLastActive, online} = useStatusContext();
    const {setRequestStatus} = useStatusActionsStore();

    // -----------------------------------------------------
    // 1. requestStatus (Không thay đổi, dùng socket mới)
    // -----------------------------------------------------
    const requestStatus = useCallback((id?: string) => {
        if (!id || !socket || !isConnected || online.has(id)) return;

        logWithTrace('Presence', 'Request New Status', {id, valid: online.has(id)});

        socket.emit("presence:subscribe", [id]);
        socket.emit("presence:get_status", [id]);
    }, [online, socket, isConnected]);


    useEffect(() => {
        setRequestStatus(requestStatus);
    }, []);

    // -----------------------------------------------------
    // 2. Handlers (Giữ nguyên)
    // -----------------------------------------------------

    const handleBroadcastChancel = useCallback((data: { userId: string, status: string, timestamp: number }) => {
        logInfo('Presence', 'Received presence status change broadcast', {data});

        if (data.status === 'online') {
            setOnline(data.userId);
            setLastActive(data.userId, data.timestamp);
        } else if (data.status === 'offline') {
            setOffline(data.userId);
            setLastActive(data.userId, data.timestamp);
        }
    }, [setLastActive, setOffline, setOnline]);

    const handleInitialStatus = useCallback((data: {
        userId: string,
        status: 'online' | 'offline',
        lastActive?: number
    }[]) => {
        logInfo('Presence', 'Received initial status batch', {count: data.length});

        const statusUpdates = data.map(userStatus => ({
            userId: userStatus.userId,
            status: userStatus.status
        }));

        const lastActiveUpdates = data
            .filter(userStatus => userStatus.lastActive !== undefined)
            .map(userStatus => ({
                userId: userStatus.userId,
                timestamp: userStatus.lastActive!
            }));

        if (statusUpdates.length > 0) {
            setBatchStatus(statusUpdates);
        }

        if (lastActiveUpdates.length > 0) {
            setBatchLastActive(lastActiveUpdates);
        }
    }, [setBatchLastActive, setBatchStatus]);

    // -----------------------------------------------------
    // 3. Logic Nghiệp vụ (Dựa trên isConnected)
    // -----------------------------------------------------

    const setupPresence = useCallback(async () => {
        console.log('Presence', socket);
        if (!socket || !userId) return;

        logInfo('Presence', `Executing setup for user: ${userId}`);
        socket.emit("presence:join", userId);

        try {
            const ids = await getListFollowedUserIds();
            if (ids?.length > 0) {
                socket.emit("presence:subscribe", ids);
                socket.emit("presence:get_status", ids);

                logInfo('Presence', 'Watching followed users for presence updates', {userIds: ids});
            }
        } catch (err) {
            logError('Presence', 'Failed to get list of followed user IDs', {error: err});
        }
    }, [socket, userId]);


    useEffect(() => {
        logInfo('Presence', 'useEffect in useStatus', {socket, userId: userId});
        if (!socket) return;

        const handleStatus = handleInitialStatus;
        const handleChange = handleBroadcastChancel;

        // Gắn listener chỉ khi chưa gắn
        if (!(socket as any)._statusListenersAdded) {
            socket.on("presence:status", handleStatus);
            socket.on("presence:status:change", handleChange);
            (socket as any)._statusListenersAdded = true; // đánh dấu đã add
            logInfo('Presence', 'Listeners added for the first time');
        }

        if (isConnected) {
            setupPresence();
        }

        // BỔ SUNG: Thiết lập Heartbeat/Keep-Alive
        let intervalId: NodeJS.Timeout | null = null;
        if (isConnected && userId) {
            intervalId = setInterval(() => {
                logInfo('Presence', 'Sending heartbeat to keep presence alive', {userId});
                // Gửi event lên server để cập nhật trạng thái online và lastActive
                socket.emit("presence:heartbeat", userId);
            }, HEARTBEAT_INTERVAL);
        }

        // Cleanup: Xóa interval khi component unmount hoặc isConnected thay đổi
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                logInfo('Presence', 'Heartbeat interval cleared.');
            }
            // Cleanup logic khác nếu cần, nhưng listener vẫn giữ
            logInfo('Presence', 'useStatus cleanup ran, but listeners kept.');
        };
    }, [socket, isConnected, setupPresence, userId, handleInitialStatus, handleBroadcastChancel]);


    return {requestStatus}
}