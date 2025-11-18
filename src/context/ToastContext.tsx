import {create} from 'zustand'
import {devtools, subscribeWithSelector} from 'zustand/middleware'
import {ReactNode} from 'react'
import {isDebug, logWithTrace} from '@/lib/utils/devLogger'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'notification'

export interface Toast {
    id: string
    message: string | ReactNode
    type: ToastType
    createdAt: number
}

interface ToastStore {
    toasts: Toast[]
    addToastByType: (message: string | ReactNode, type: ToastType) => void
    addToastByStatus: (message: string | ReactNode, status: number) => void
    removeToast: (id: string) => void
}

function getToastTypeByStatus(status: number): ToastType {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 400 && status < 500) return 'warning'
    if (status >= 500 && status < 600) return 'error'
    return 'info'
}

function createToast(message: string | ReactNode, type: ToastType): Toast {
    return {id: Math.random().toString(36).substring(2, 9), message, type, createdAt: Date.now()}
}

export const useToastStore = create<ToastStore>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            toasts: [],

            addToastByType: (message, type) => {
                const now = Date.now()
                const toasts = get().toasts

                // Debounce: nếu cùng message trong 1s thì ignore
                const lastSame = toasts
                    .filter(t => t.message === message && t.type === type)
                    .sort((a, b) => b.createdAt - a.createdAt)[0]

                if (lastSame && now - lastSame.createdAt < 1000) return

                const toast = createToast(message, type)

                set((state) => {
                    const next = [...state.toasts, toast]
                    if (isDebug) logWithTrace('Zustand', 'addToastByType', {toast, next})
                    return {toasts: next}
                })

                setTimeout(() => get().removeToast(toast.id), 3000)
            },

            addToastByStatus: (message, status) => {
                const type = getToastTypeByStatus(status)
                get().addToastByType(message, type)
            },

            removeToast: (id) => {
                set((state) => {
                    const prev = state.toasts
                    const next = prev.filter(t => t.id !== id)
                    if (isDebug) logWithTrace('Zustand', 'removeToast', {id, prev, next})
                    return {toasts: next}
                })
            },
        }))
    )
)

export function useToast() {
    const {toasts, addToastByType, addToastByStatus, removeToast} = useToastStore()
    return {toasts, addToastByType, addToastByStatus, removeToast}
}
