'use client'

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSocketStore } from "@/context/SocketContext";
import Spinner from "@/components/shared/Spinner";
import {useUserStore} from "@/context/UserContext";

export default function LogoutPage() {
    const searchParams = useSearchParams();
    const logoutExecuted = useRef(false);

    // Lấy hàm logout từ store
    const resetState = useUserStore((state) => state.logout);
    const disconnectAllSockets = useSocketStore((state) => state.disconnectAllSockets);

    useEffect(() => {
        if (logoutExecuted.current) return;
        logoutExecuted.current = true;

        const performLogout = async () => {
            try {
                await disconnectAllSockets();

                await resetState();

                await signOut({ redirect: false });

                const source = searchParams.get('source');
                const redirectUrl = source ? `/login?redirect=${encodeURIComponent(source)}` : "/login";

                window.location.href = redirectUrl;
            } catch (error) {
                console.error("Logout error:", error);
                window.location.href = "/login";
            }
        };

        performLogout();
    }, [resetState, disconnectAllSockets, searchParams]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Spinner />
                <span className="text-gray-500">logout...</span>
            </div>
        </div>
    );
}