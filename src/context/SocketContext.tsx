// useSocketStore.ts
import {create} from 'zustand';
import {io, Socket} from 'socket.io-client';
import {useEffect} from "react";
import {logError, logInfo} from "@/lib/utils/devLogger";
import {useUserContext} from "@/context/UserContext"; // Thêm useState để buộc re-render hook

// Loại bỏ socketRegistry, đưa quản lý vào state của Zustand
interface SocketState {
    activeSockets: Record<string, Socket>;
    isConnected: Record<string, boolean>;
    initializeSocket: (namespace: string, userId: string) => void;
    disconnectSocket: (namespace: string) => void;
    disconnectAllSockets: () => void;
    getSocket: (namespace: string) => Socket | undefined;
}

// Khai báo state ban đầu
const initialState = {
    activeSockets: {},
    isConnected: {},
};

export const useSocketStore = create<SocketState>((set, get) => ({
    ...initialState,

    // Hàm lấy socket theo namespace
    getSocket: (namespace) => get().activeSockets[namespace],

    // Hàm khởi tạo socket (Chuyển userId vào đây)
    initializeSocket: (namespace: string, userId: string) => {
        const state = get();

        // --- Logic Singleton: Kiểm tra trong activeSockets state ---
        if (state.activeSockets[namespace]) {
            logInfo('Socket', `[Zustand Socket] Already initialized: ${namespace}`);
            return;
        }

        // --- Khởi tạo Socket mới ---
        const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            // Thêm query để truyền userId cho server (Tùy chọn, tùy theo server setup)
            query: {userId: userId},
        });

        // Đăng ký listeners cơ bản
        newSocket.on("connect", () => {
            set(state => ({
                isConnected: {...state.isConnected, [namespace]: true}
            }));
            logInfo('Socket', `[Zustand Socket] Connected: ${namespace}`);
        });

        newSocket.on("disconnect", () => {
            set(state => ({
                isConnected: {...state.isConnected, [namespace]: false}
            }));
            logInfo('Socket', `[Zustand Socket] Disconnected: ${namespace}`);
        });

        // Lưu socket và trạng thái ban đầu vào state
        set(state => ({
            activeSockets: {...state.activeSockets, [namespace]: newSocket},
            isConnected: {...state.isConnected, [namespace]: newSocket.connected},
        }));
    },

    // Hàm ngắt kết nối socket hiện tại theo namespace
    disconnectSocket: (namespace: string) => {
        const state = get();
        const currentSocket = state.activeSockets[namespace];

        if (currentSocket) {
            currentSocket.disconnect();

            // Xóa socket và trạng thái ra khỏi state
            const newActiveSockets = {...state.activeSockets};
            delete newActiveSockets[namespace];
            const newIsConnected = {...state.isConnected};
            delete newIsConnected[namespace];

            set({
                activeSockets: newActiveSockets,
                isConnected: newIsConnected,
            });
            logInfo('Socket', `[Zustand Socket] Disconnected and removed: ${namespace}`);
        }
    },

    // Hàm ngắt kết nối tất cả socket
    disconnectAllSockets: () => {
        logInfo('Socket', `[Zustand Socket] Disconnecting ALL sockets...`);

        // Lặp qua tất cả socket trong activeSockets
        Object.values(get().activeSockets).forEach(socket => {
            if (socket.connected) {
                socket.disconnect();
            }
        });

        // Đặt lại state trong store
        set(initialState);
    }
}));

// useSocketManager: Phải sử dụng useState để trả về socket và isConnected của namespace CỤ THỂ
export const useSocketManager = (namespace: string) => {
    const {user} = useUserContext();
    const userId = user?.id;
    const {initializeSocket, getSocket} = useSocketStore();

    // Lắng nghe socket và isConnected cụ thể của namespace này
    const socket = useSocketStore(state => state.activeSockets[namespace]);
    const isConnected = useSocketStore(state => state.isConnected[namespace] || false);

    useEffect(() => {
        console.log("[Zustand Socket] Connected", namespace);
        if (userId) {
            // Truyền userId vào initializeSocket
            initializeSocket(namespace, userId);
        }
    }, [userId, namespace, initializeSocket]);

    // Trả về socket và isConnected của namespace cụ thể
    return {
        socket,
        isConnected,
        getSocket: useSocketStore.getState().getSocket,
        disconnectSocket: useSocketStore.getState().disconnectSocket,
        disconnectAllSockets: useSocketStore.getState().disconnectAllSockets,
    };
}