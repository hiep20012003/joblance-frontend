// stores/useUserStore.ts
import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {IAuthDocument} from '@/types/auth';
import {IBuyerDocument} from '@/types/buyer';
import {ISellerDocument} from '@/types/seller';

interface UserState {
    user: IAuthDocument | null;
    setUser: (user: IAuthDocument | null) => void;

    buyer: IBuyerDocument | null;
    setBuyer: (buyer: IBuyerDocument | null) => void;

    seller: ISellerDocument | null;
    setSeller: (seller: ISellerDocument) => void;

    mode: 'buyer' | 'seller';
    setMode: (mode: 'buyer' | 'seller') => void;

    logout: () => void;
}

// Zustand store không persist
export const useUserStore = create<UserState>()(
    devtools((set) => ({
        user: null,
        buyer: null,
        seller: null,
        mode: 'buyer',

        setUser: (user) => set(() => ({user})),
        setBuyer: (buyer) => set(() => ({buyer})),
        setSeller: (seller) => set(() => ({seller})),
        setMode: (mode) => set(() => ({mode})),

        logout: () => {
            set(() => ({
                user: null,
                buyer: null,
                seller: null,
                mode: 'buyer',
            }));
        },
    }))
);

// Hook giữ nguyên API
export function useUserContext() {
    const {user, setUser, buyer, setBuyer, seller, setSeller, mode, setMode, logout} =
        useUserStore();
    return {user, setUser, buyer, setBuyer, seller, setSeller, mode, setMode, logout};
}
