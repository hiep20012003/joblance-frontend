// store/toastSlice.ts
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastState {
    toasts: Toast[];
}

const initialState: ToastState = {
    toasts: [],
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<{ message: string; type: ToastType }>) => {
            const id = Date.now();
            state.toasts.push({id, ...action.payload});
        },
        removeToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const {addToast, removeToast} = toastSlice.actions;
export default toastSlice.reducer;
