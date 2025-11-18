import MenuDropdown from "@/components/shared/MenuDropdown";
import Link from "next/link";
import {IConversationSummary} from "@/types/chat";
import {ConversationItem} from "@/components/features/chat/MessageSidebar";
import React from "react";
import {useStatusContext} from "@/context/StatusContext";

export default function MessageMenu({
                                        isOpen,
                                        onClose,
                                        anchorRef,
                                        conversations,
                                    }: {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<Element | null>;
    conversations: IConversationSummary[];
}) {

    const {online} = useStatusContext();

    return (
        <MenuDropdown
            isOpen={isOpen}
            onClose={onClose}
            anchorRef={anchorRef}
            className="flex flex-col w-100 min-h-120"
        >
            <div className="p-4 border-b border-gray-200 bg-background z-10">
                <h3 className="text-lg font-bold text-gray-700">Messages</h3>
            </div>

            {conversations?.length > 0 ? (
                <>
                    <ul className="flex flex-col flex-1 overflow-y-auto divide-y divide-gray-100 scrollbar-beautiful">
                        {conversations?.slice(0, 5).map((conversation) => (
                            <ConversationItem
                                isOnline={Boolean(online.get(conversation?.user?._id ?? ''))}
                                key={conversation.conversationId}
                                conversation={conversation}
                                isSelected={false} // MessageMenu doesn't have a concept of selected conversation
                                onSelectConversation={onClose} // Close the menu when a conversation is clicked
                            />
                        ))}
                    </ul>

                    <Link
                        href="/inbox"
                        className="block p-2 text-center text-sm text-primary-600 hover:bg-gray-50 font-semibold border-t border-gray-200 bg-background"
                        onClick={onClose}
                    >
                        View All Messages
                    </Link>
                </>
            ) : (
                <div
                    className="flex flex-col items-center justify-center flex-1 p-6 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-8 h-8 mb-2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M2.25 12.76c0 1.61.18 3.21.52 4.76a2.25 2.25 0 0 0 2.14 1.95 48.06 48.06 0 0 0 15.36 0 2.25 2.25 0 0 0 2.14-1.95c.34-1.55.52-3.15.52-4.76v-4.38a2.25 2.25 0 0 0-2.14-1.95 48.06 48.06 0 0 0-15.36 0A2.25 2.25 0 0 0 2.25 8.38v4.38ZM16.5 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                    </svg>

                    <p className="text-sm">No messages</p>
                </div>
            )}
        </MenuDropdown>
    );
}
