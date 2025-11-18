import ChatWindow from "@/components/features/chat/ChatWindow";
import ServerComponentError from "@/components/shared/ServerComponentError";
import React from "react";
import {isRedirectError} from "next/dist/client/components/redirect-error";

export default function ChatWindowPage() {
    try {
        return (
            <ChatWindow/>
        );
    } catch (error) {
        if (isRedirectError(error)) throw error;
        <ServerComponentError error={error}/>
    }
}