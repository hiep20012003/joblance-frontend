'use client';

import Image from "next/image";
import React from "react";

export default function InboxPage() {
    return (
        <div className="h-full flex flex-col flex-1 items-center justify-center max-h-screen bg-white gap-2">
            <div className="relative h-[180px] w-full flex justify-center">
                <Image
                    src="/images/manage-chats_7wl6.svg"
                    alt="manage chats"
                    fill
                    className="object-contain w-auto h-full"
                />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-4">Pick up where you left off</h2>
            <p className="text-gray-500">Select a conversation and chat away.</p>
        </div>
    );
}
