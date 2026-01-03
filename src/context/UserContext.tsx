// stores/useUserStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { IAuthDocument } from '@/types/auth';
import { IBuyerDocument } from '@/types/buyer';
import { ISellerDocument } from '@/types/seller';

interface UserState {
    user: IAuthDocument | null;
    setUser: (user: IAuthDocument | null) => void;

    buyer: IBuyerDocument | null;
    setBuyer: (buyer: IBuyerDocument | null) => void;

    seller: ISellerDocument | null;
    setSeller: (seller: ISellerDocument | null) => void;

    mode: 'buyer' | 'seller';
    setMode: (mode: 'buyer' | 'seller') => void;

    logout: () => void;
}

export const useUserStore = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                buyer: null,
                seller: null,
                mode: 'buyer',

                setUser: (user) => set({ user }),
                setBuyer: (buyer) => set({ buyer }),
                setSeller: (seller) => set({ seller }),
                setMode: (mode) => set({ mode }),

                logout: () => {
                    set({
                        user: null,
                        buyer: null,
                        seller: null,
                        mode: 'buyer'
                    });

                    useUserStore.persist.clearStorage();
                },
            }),
            {
                name: 'user-store',
                // partialize: (state) => ({
                //     user: state.user,
                //     buyer: state.buyer,
                //     seller: state.seller,
                //     mode: state.mode,
                // }),
            }
        )
    )
);

export function useUserContext() {
    const { user, setUser, buyer, setBuyer, seller, setSeller, mode, setMode, logout } =
        useUserStore();
    return { user, setUser, buyer, setBuyer, seller, setSeller, mode, setMode, logout };
}
