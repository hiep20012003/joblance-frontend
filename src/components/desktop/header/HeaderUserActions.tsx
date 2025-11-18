"use client";

import Link from "next/link";
import {useUserContext} from "@/context/UserContext";
import {Bell, MessageSquare} from "lucide-react";
import MessageMenu from "@/components/desktop/header/MessageMenu";
import NotificationMenu from "@/components/desktop/header/NotificationMenu";
import Avatar from "@/components/shared/Avatar";
import SettingMenu from "@/components/desktop/header/SettingMenu";
import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {useNotification} from "@/lib/hooks/useNotification";
import {IConversationSummary} from "@/types/chat";
import {getFlattenedConversations} from "@/lib/services/server/chat.server";
import {parseFetchError} from "@/lib/utils/helper";
import {logout} from "@/lib/services/client/auth.client";
import {usePathname} from "next/navigation";
import {useConversationContext} from "@/context/ChatContext";

export default function HeaderUserActions() {
    const {user} = useUserContext();
    const pathname = usePathname();

    const {notifications, markAsRead} = useNotification(user?.id ?? "");

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const avatarBtnRef = useRef<HTMLButtonElement>(null);
    const msgBtnRef = useRef<HTMLButtonElement>(null);
    const notiBtnRef = useRef<HTMLButtonElement>(null);
    const orderBtnRef = useRef<HTMLButtonElement>(null);
    const [hydrated, setHydrated] = useState(false);
    const {conversations, setConversations} = useConversationContext();

    const unreadReducer = useCallback(
        (_: number, conversations: IConversationSummary[]) => {
            return conversations.reduce(
                (sum, c) => sum + (Number(c.unreadCounts?.[c.currentUserId]) || 0),
                0
            );
        },
        []
    );

    const [unreadCount, setUnreadCount] = useReducer(unreadReducer, 0);

    useEffect(() => {
        if (conversations.length) {
            setUnreadCount(conversations);
        }
    }, [conversations, pathname]);


    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        // if (openMenu === "messages") {
        if (user?.id) {

            // TODO: Implement actual fetching of flatConversations from an API endpoint
            const fetchFlatConversations = async () => {
                return await getFlattenedConversations(user?.id ?? '');
            };

            fetchFlatConversations().then(data => {
                setConversations(data);
                setUnreadCount(data);
            }).catch(async error => {
                const {status, data} = parseFetchError(error);
                if (status === 401) {
                    await logout({redirectUrl: `/logout?redirect=${pathname}`})
                }
            });
        }
        // }
    }, [user?.id]);

    if (!hydrated) return null;

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    if (!user) {
        return (
            <div className="flex flex-row items-center gap-6">
                <Link href="/register" className="text-lg font-bold text-gray-600 hover:text-primary-500">
                    Become a Seller
                </Link>
                <Link href="/login" className="text-lg font-bold text-gray-600 hover:text-primary-500">
                    Sign in
                </Link>
                <Link
                    href="/register"
                    className="btn btn-outlined text-lg font-bold text-foreground min-w-20 hover:bg-foreground hover:text-background"
                >
                    Join
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-center gap-3">
            {/* Messages */}
            <div className="relative">
                <button
                    ref={msgBtnRef}
                    onClick={() => toggleMenu("messages")}
                    className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
                    aria-label="Messages"
                >
                    <MessageSquare className="w-6 h-6 text-gray-600"/>
                    {unreadCount > 0 &&
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                <MessageMenu
                    isOpen={openMenu === "messages"}
                    onClose={() => setOpenMenu(null)}
                    anchorRef={msgBtnRef}
                    conversations={conversations}
                />
            </div>

            {/* Notifications */}
            <div className="relative">
                <button
                    ref={notiBtnRef}
                    onClick={() => toggleMenu("notifications")}
                    className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell className="w-6 h-6 text-gray-600"/>
                    {notifications?.some((n) => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}

                </button>
                <NotificationMenu
                    notifications={notifications}
                    onRead={markAsRead}
                    isOpen={openMenu === "notifications"}
                    onClose={() => setOpenMenu(null)}
                    anchorRef={notiBtnRef}
                />
            </div>

            {/*/!* Orders *!/*/}
            {/*<div className="relative">*/}
            {/*    <button*/}
            {/*        ref={orderBtnRef}*/}
            {/*        onClick={() => toggleMenu("orders")}*/}
            {/*        className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"*/}
            {/*        aria-label="Orders"*/}
            {/*    >*/}
            {/*        <ShoppingBag className="w-6 h-6 text-gray-600"/>*/}
            {/*    </button>*/}
            {/*    <OrderMenu*/}
            {/*        isOpen={openMenu === "orders"}*/}
            {/*        onClose={() => setOpenMenu(null)}*/}
            {/*        anchorRef={orderBtnRef}*/}
            {/*    />*/}
            {/*</div>*/}

            <div className="relative ml-2">
                <button
                    ref={avatarBtnRef}
                    onClick={() => setOpenMenu(openMenu ? null : "settings")}
                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                    <Avatar
                        className="border border-primary-500"
                        src={user?.profilePicture ?? ""}
                        username={user?.username ?? ""}
                    />
                </button>
                <SettingMenu
                    isOpen={openMenu === "settings"}
                    onClose={() => setOpenMenu(null)}
                    anchorRef={avatarBtnRef}
                />
            </div>
        </div>

    );
}
