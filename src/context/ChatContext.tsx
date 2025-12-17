import {create} from 'zustand'
import {devtools, subscribeWithSelector} from 'zustand/middleware'
import {IConversationSummary} from '@/types/chat'

interface ChatStore {
    conversations: IConversationSummary[]
    setConversations: (
        updater:
            | IConversationSummary[]
            | ((prev: IConversationSummary[]) => IConversationSummary[])
    ) => void

    selectedConversation?: IConversationSummary | null
    setSelectedConversation: (
        updater?:
            | IConversationSummary
            | null
            | ((prev?: IConversationSummary | null) => IConversationSummary | null)
    ) => void
}

export const useChatStore = create<ChatStore>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            conversations: [],

            setConversations: (updater) =>
                set((state) => {
                    const prev = state.conversations
                    const next =
                        typeof updater === 'function' ? updater(prev) : updater

                    return {conversations: next}
                }),

            selectedConversation: undefined,

            setSelectedConversation: (updater) =>
                set((state) => {
                    const prev = state.selectedConversation
                    const next =
                        typeof updater === 'function' ? updater(prev) : updater

                    return {selectedConversation: next}
                }),
        })),
        {trace: true}
    )
)

export function useConversationContext() {
    const {
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation,
    } = useChatStore()

    return {
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation,
    }
}
