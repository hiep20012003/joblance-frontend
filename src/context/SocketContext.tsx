// useSocketStore.ts
import {create} from 'zustand';
import {io, Socket} from 'socket.io-client';
import {useEffect} from "react";
import {useUserContext} from "@/context/UserContext";
import {appConfig} from '@/lib/hooks/useConfig'

// Loại bỏ socketRegistry, đưa quản lý vào state của Zustand
interface SocketState {
    activeSockets: Record<string, Socket>;
    isConnected: Record<string, boolean>;
    initializeSocket: (socketUri: string, namespace: string, userId: string) => void;
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
    initializeSocket: (socketUri : string,namespace: string, userId: string) => {
        const state = get();

        // --- Logic Singleton: Kiểm tra trong activeSockets state ---
        if (state.activeSockets[namespace]) {
            return;
        }

        // --- Khởi tạo Socket mới ---
        const newSocket = io(`${socketUri}${namespace}`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            query: {userId: userId},
        });

        // Đăng ký listeners cơ bản
        newSocket.on("connect", () => {
            set(state => ({
                isConnected: {...state.isConnected, [namespace]: true}
            }));
        });

        newSocket.on("disconnect", () => {
            set(state => ({
                isConnected: {...state.isConnected, [namespace]: false}
            }));
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
        }
    },

    // Hàm ngắt kết nối tất cả socket
    disconnectAllSockets: () => {

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
        if (userId && appConfig.SOCKET_URL) {
            initializeSocket(appConfig.SOCKET_URL ,namespace, userId);
        }
    }, [userId, namespace, initializeSocket, appConfig.SOCKET_URL]);

    // Trả về socket và isConnected của namespace cụ thể
    return {
        socket,
        isConnected,
        getSocket: useSocketStore.getState().getSocket,
        disconnectSocket: useSocketStore.getState().disconnectSocket,
        disconnectAllSockets: useSocketStore.getState().disconnectAllSockets,
    };
}