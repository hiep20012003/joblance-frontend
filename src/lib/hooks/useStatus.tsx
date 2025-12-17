'use client'

// SỬA ĐỔI: Thay thế import useSocket bằng useSocketManager từ Zustand hook
import {useCallback, useEffect} from "react";
import {getListFollowedUserIds} from "@/lib/services/server/chat.server";
import {useStatusActionsStore, useStatusContext} from "@/context/StatusContext";

// Thêm import logger
import {useUserContext} from "@/context/UserContext";
import {useSocketManager} from "@/context/SocketContext";

const HEARTBEAT_INTERVAL = 30000; // 30000 ms = 30 giây

export function useStatus() {
    const {user} = useUserContext();
    const userId = user?.id as string;


    // SỬA ĐỔI: Sử dụng useSocketManager để quản lý kết nối và lấy trạng thái
    const {socket, isConnected} = useSocketManager("/presence");

    const {setOnline, setOffline, setBatchStatus, setLastActive, setBatchLastActive, online} = useStatusContext();
    const {setRequestStatus} = useStatusActionsStore();

    // -----------------------------------------------------
    // 1. requestStatus (Không thay đổi, dùng socket mới)
    // -----------------------------------------------------
    const requestStatus = useCallback((id?: string) => {
        if (!id || !socket || !isConnected || online.has(id)) return;

        socket.emit("presence:subscribe", [id]);
        socket.emit("presence:get_status", [id]);
    }, [online, socket, isConnected]);


    useEffect(() => {
        setRequestStatus(requestStatus);
    }, [requestStatus, setRequestStatus]);

    // -----------------------------------------------------
    // 2. Handlers (Giữ nguyên)
    // -----------------------------------------------------

    const handleBroadcastChancel = useCallback((data: { userId: string, status: string, timestamp: number }) => {

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
        if (!socket || !userId) return;

        socket.emit("presence:join", userId);

        try {
            const ids = await getListFollowedUserIds();
            if (ids?.length > 0) {
                socket.emit("presence:subscribe", ids);
                socket.emit("presence:get_status", ids);

            }
        } catch (err) {
        }
    }, [socket, userId]);


    useEffect(() => {
        if (!socket) return;

        const handleStatus = handleInitialStatus;
        const handleChange = handleBroadcastChancel;

        // Gắn listener chỉ khi chưa gắn
        if (!(socket as any)._statusListenersAdded) {
            socket.on("presence:status", handleStatus);
            socket.on("presence:status:change", handleChange);
            (socket as any)._statusListenersAdded = true; // đánh dấu đã add
        }

        if (isConnected) {
            setupPresence();
        }

        // BỔ SUNG: Thiết lập Heartbeat/Keep-Alive
        let intervalId: NodeJS.Timeout | null = null;
        if (isConnected && userId) {
            intervalId = setInterval(() => {
                // Gửi event lên server để cập nhật trạng thái online và lastActive
                socket.emit("presence:heartbeat", userId);
            }, HEARTBEAT_INTERVAL);
        }

        // Cleanup: Xóa interval khi component unmount hoặc isConnected thay đổi
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            // Cleanup logic khác nếu cần, nhưng listener vẫn giữ
        };
    }, [socket, isConnected, setupPresence, userId, handleInitialStatus, handleBroadcastChancel]);


    return {requestStatus}
}