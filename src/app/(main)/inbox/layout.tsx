// app/inbox/layout.tsx
import MessageSidebar from "@/components/features/chat/MessageSidebar";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {getFlattenedConversations} from "@/lib/services/server/chat.server";
import {headers} from "next/headers";
import React, {ReactNode} from "react";
import Image from "next/image";
import type {Metadata} from 'next';
import {isRedirectError} from "next/dist/client/components/redirect-error";

/**
 * 🚀 Essential Metadata for the Inbox Page
 */
export const metadata: Metadata = {
    title: 'Inbox',
    description: 'Manage your messages and conversations with recruiters and candidates on JobLance.',
};

export default async function InboxLayout({children}: { children: ReactNode }) {
    try {
        const currentUserId = (await headers()).get("x-user-id") ?? "";
        const flatConversations = await getFlattenedConversations(currentUserId);

        // --- No Conversations UI (Simplified) ---
        if (!flatConversations?.length) {
            return (
                <div className="flex flex-col flex-1 max-h-screen items-center justify-center bg-white gap-2">
                    <div className="relative h-[160px] w-full flex justify-center">
                        <Image
                            src="/images/no-data_ig65.svg"
                            alt="No conversations"
                            fill
                            className="object-contain w-auto h-full"
                        />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mt-4">No conversations yet</h2>
                    <p className="text-gray-500 text-center">Start a new chat.</p>
                </div>
            );
        }

        // --- Main Layout ---
        return (
            <div
                className="flex-1 h-full flex px-12 py-6 rounded-lg overflow-hidden">
                <MessageSidebar classname="pr-8 flex-1/3 max-w-[400px]" initConversations={flatConversations}/>
                <div className="flex-1 h-full rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    {children}
                </div>
            </div>
        );
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return <ServerComponentError error={error}/>;
    }
}