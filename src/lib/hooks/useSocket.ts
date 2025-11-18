// useSocket.ts (Sửa đổi)
"use client";

import {useEffect, useState} from "react"; // Thay đổi: dùng useState thay vì useRef
import {io, Socket} from "socket.io-client";
import {useUserContext} from "@/context/UserContext";

type SocketEntry = {
    socket: Socket;
    count: number;
    // Thêm callback/setter nếu cần thông báo cho các components khác
};

const socketRegistry: Record<string, SocketEntry> = {};

/**
 * Hook socket singleton — tự connect khi userId có, disconnect khi logout
 */
export function useSocket(namespace: string = "/"): Socket | null {
    const {user} = useUserContext();
    const userId = user?.id;

    // THAY ĐỔI: Sử dụng useState để giữ instance socket và kích hoạt re-render
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const entry = socketRegistry[namespace];

        if (!userId) {
            // Logic ngắt kết nối khi logout
            if (entry?.socket.connected) {
                entry.socket.disconnect();
                delete socketRegistry[namespace];
                setSocketInstance(null); // Đảm bảo state được clear
                console.log(`[Socket] Auto disconnected (logout): ${namespace}`);
            }
            // Đảm bảo instance là null nếu userId không tồn tại
            if (socketInstance !== null) {
                setSocketInstance(null);
            }
            return;
        }

        // --- Nếu có userId mà chưa có socket → khởi tạo
        if (!socketRegistry[namespace]) {
            const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`, {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
            });

            socket.on("connect", () => {
                console.log(`[Socket] Connected: ${namespace}`)
            });
            socket.on("disconnect", (reason) =>
                console.log(`[Socket] Disconnected (${namespace}):`, reason)
            );
            socket.on("reconnect_attempt", (attempt) =>
                console.log(`[Socket] Reconnecting (${namespace}) - Attempt ${attempt}`)
            );

            socketRegistry[namespace] = {socket, count: 0};
        }

        // Cập nhật count và CẬP NHẬT STATE
        socketRegistry[namespace].count++;
        // Kích hoạt re-render ở đây, đảm bảo useStatus nhận được socket non-null
        setSocketInstance(socketRegistry[namespace].socket);

        return () => {
            const entry = socketRegistry[namespace];
            if (!entry) return;
            entry.count--;

            if (entry.count <= 0) {
                entry.socket.disconnect();
                delete socketRegistry[namespace];
                // KHÔNG cần setSocketInstance(null) ở đây nếu component unmount,
                // vì component khác vẫn có thể dùng socketRegistry.
                console.log(`[Socket] Disconnected (unused): ${namespace}`);
            }
        };
    }, [userId, namespace]); // socketInstance đã bị loại bỏ khỏi dependencies

    return socketInstance; // Trả về giá trị state
}