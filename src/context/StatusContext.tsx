import {create} from 'zustand';
import {devtools, subscribeWithSelector} from 'zustand/middleware';
// ------------------------------------
// 1. Status store (online/offline)
// ------------------------------------
interface StatusStore {
    online: Map<string, boolean>; // userId → online?
    setOnline: (userId: string) => void;
    setOffline: (userId: string) => void;
    setBatchStatus: (updates: { userId: string, status: 'online' | 'offline' }[]) => void;
    clearAll: () => void;
}

export const useStatusStore = create<StatusStore>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            online: new Map(),

            setOnline: (userId) =>
                set((state) => {
                    const prev = state.online;
                    const next = new Map(prev);
                    next.set(userId, true);

                    return {online: next};
                }),

            setOffline: (userId) =>
                set((state) => {
                    const prev = state.online;
                    const next = new Map(prev);
                    next.set(userId, false);

                    return {online: next};
                }),

            clearAll: () =>
                set((state) => {
                    return {online: new Map()};
                }),

            setBatchStatus: (updates) =>
                set((state) => {
                    const prev = state.online;
                    const next = new Map(prev);

                    updates.forEach(update => {
                        const isOnline = update.status === 'online';
                        next.set(update.userId, isOnline);
                    });

                    return {online: next};
                }),
        })),
        {
            serialize: {
                options: true,
                replacer: (key: string, value: any) => (value instanceof Map ? Object.fromEntries(value) : value)
            }
        }
    )
);

// ------------------------------------
// 2. Last active store (timestamp)
// ------------------------------------
interface LastActiveStore {
    lastActive: Map<string, number>; // userId → last active timestamp
    setLastActive: (userId: string, timestamp: number) => void;
    setBatchLastActive: (updates: { userId: string, timestamp: number }[]) => void;
    clearAll: () => void;
}

export const useLastActiveStore = create<LastActiveStore>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            lastActive: new Map(),

            setLastActive: (userId, timestamp) =>
                set((state) => {
                    const prev = state.lastActive;
                    const next = new Map(prev);
                    next.set(userId, timestamp);

                    return {lastActive: next};
                }),

            setBatchLastActive: (updates) =>
                set((state) => {
                    const prev = state.lastActive;
                    const next = new Map(prev);

                    updates.forEach(update => {
                        next.set(update.userId, update.timestamp);
                    });

                    return {lastActive: next};
                }),

            clearAll: () =>
                set((state) => {
                    return {lastActive: new Map()};
                }),
        })),
        {
            serialize: {
                options: true,
                replacer: (key: string, value: any) => (value instanceof Map ? Object.fromEntries(value) : value)
            }
        }
    )
);


// ------------------------------------
// 3. Actions store (requestStatus Singleton)
// ------------------------------------
interface StatusActionsStore {
    // Hàm này sẽ được gán bởi hook useStatus (Singleton)
    requestStatus: (id?: string) => void;
    // Hàm để cập nhật requestStatus từ hook useStatus
    setRequestStatus: (func: (id?: string) => void) => void;
}

const defaultAction = (id?: string) => {
};

export const useStatusActionsStore = create<StatusActionsStore>()(
    devtools(
        (set) => ({
            requestStatus: defaultAction,

            setRequestStatus: (func) => set({requestStatus: func}),
        })
    )
);


// ------------------------------------
// 4. Hook tổng hợp (useStatusContext)
// ------------------------------------

/**
 * Hook tổng hợp để lấy state và actions từ tất cả các Zustand stores liên quan đến trạng thái.
 */
export function useStatusContext() {
    // State và Actions từ Status Store
    const {online, setOnline, setOffline, clearAll: clearAllStatus, setBatchStatus} = useStatusStore();

    // State và Actions từ Last Active Store
    const {lastActive, setLastActive, clearAll: clearAllLastActive, setBatchLastActive} = useLastActiveStore();

    // Actions từ Singleton Action Store
    const {requestStatus} = useStatusActionsStore();

    return {
        // State
        online,
        lastActive,

        // Status Actions
        setOnline,
        setOffline,
        setBatchStatus,
        clearAllStatus,

        // Last Active Actions
        setLastActive,
        setBatchLastActive,
        clearAllLastActive,

        // ⭐ Singleton Request Action
        requestStatus,
    };
}