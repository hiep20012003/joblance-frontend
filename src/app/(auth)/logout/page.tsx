'use client'

import {useEffect} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useUserContext} from "@/context/UserContext";
import Spinner from "@/components/shared/Spinner";
import {logout} from "@/lib/services/client/auth.client";
import {getSession, signOut} from "next-auth/react";
import {useSocketStore} from "@/context/SocketContext";

export default function LogoutPage() {
    const {logout: resetState} = useUserContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {disconnectAllSockets} = useSocketStore();
    const redirectUrl = searchParams.get('source') ? `/login?redirect=${searchParams.get('source')}` : "/login";

    useEffect(() => {
        const handleLogout = async () => {
            resetState();
            const session = await getSession();
            if (session && session?.user) {
                await signOut({redirect: false})
                await logout({redirectUrl: redirectUrl});
            }
            disconnectAllSockets();
            router.replace(redirectUrl);
        };
        handleLogout().then();
    }, []);

    console.log('logout');

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex items-center gap-3 text-gray-600 text-lg">
                <Spinner/>
                <span>Logging out...</span>
            </div>
        </div>
    );
}
