'use client';

import {usePathname, useRouter} from "next/navigation";
import React, {useMemo, useState, useCallback} from "react";
import MenuDropdown from "@/components/shared/MenuDropdown";
import MenuItem from "@/components/shared/MenuItem";
import {LogOut, Mail, Package, Settings, User, ShoppingBag, Store} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useUserContext} from "@/context/UserContext";
import {logout} from "@/lib/services/client/auth.client";
import {isOrderPath, isSellerPath} from "@/lib/utils/helper";

interface SettingMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<Element | null>;
}

interface MenuItemType {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    href?: string;
    className?: string;
}

export default function SettingMenu({isOpen, onClose, anchorRef}: SettingMenuProps) {
    const router = useRouter();
    const {user, mode, setMode} = useUserContext();
    const pathname = usePathname();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isSellerPage = isSellerPath(pathname);
    const isSellerMode = mode === 'seller';
    const isOrderPage = isOrderPath(pathname);

    const isSwitchSellerMode = isSellerPage && !isOrderPage ? true : isOrderPage && isSellerMode;
    const isSeller = user?.roles?.includes('seller');

    // Nút switch dựa vào pathname
    const switchModeLabel = isSwitchSellerMode ? "Switch to Buying" : isSeller ? "Switch to Selling" : "Become a Seller";
    const switchModeIcon = isSwitchSellerMode ? ShoppingBag : Store;

    const handleSwitchMode = useCallback(async () => {
        onClose();
        if (isSwitchSellerMode) {
            router.push('/');
        } else {
            if (isSeller)
                router.push(`/users/${user?.username}/seller_dashboard`);
            else router.push(`/become-seller`);
        }
        setMode(isSwitchSellerMode ? 'buyer' : 'seller');
    }, [onClose, isSwitchSellerMode, setMode, router, isSeller, user?.username]);

    const handleLogout = useCallback(async () => {
        try {
            setIsLoggingOut(true);
            await logout({redirectUrl: `/logout?source=${pathname}`});
            onClose();
        } finally {
            setIsLoggingOut(false);
        }
    }, [onClose, pathname]);

    const menuItems: MenuItemType[] = useMemo(() => {
        const commonItems = [
            {
                label: "Profile",
                icon: User,
                href: isSwitchSellerMode ? `/sellers/${user?.username}/edit` : `/users/${user?.username}/buying`
            },
            {
                label: "Orders",
                icon: Package,
                href: isSwitchSellerMode ? `/users/${user?.username}/manage_orders` : `/users/${user?.username}/orders`
            },
            {label: "Messages", icon: Mail, href: `/inbox`},
            {label: "Settings", icon: Settings, href: `/settings`},
        ];

        return [
            {label: switchModeLabel, icon: switchModeIcon, onClick: handleSwitchMode},
            ...commonItems.map(item => ({
                ...item,
                onClick: () => {
                    onClose();
                    router.push(item.href!);
                },
            })),
            {
                label: "Logout",
                icon: LogOut,
                onClick: handleLogout,
                className: "text-red-600 font-semibold border-t border-gray-200 hover:text-red-500",
            },
        ];
    }, [isSwitchSellerMode, user?.username, switchModeLabel, switchModeIcon, handleSwitchMode, handleLogout, onClose, router]);

    if (!user?.username) return null;

    return (
        <>
            <MenuDropdown
                anchorRef={anchorRef}
                isOpen={isOpen}
                onClose={onClose}
                className="flex flex-col w-80 max-w-80" // Set fixed width and max-width
            >
                <div className="p-4 border-b border-gray-200 flex items-start gap-3"> {/* Changed to items-start */}
                    <Avatar
                        src={user.profilePicture ?? ""}
                        username={user.username}
                        className="w-10 h-10 flex-shrink-0" // Smaller avatar, prevent shrinking
                    />
                    <div className="min-w-0 flex-1"> {/* Allow this div to take remaining space */}
                        <p className="font-bold text-gray-800 truncate">{user.username}</p> {/* Truncate username if too long */}
                        <p
                            className="text-sm text-gray-600 truncate" // Truncate email
                            title={user.email} // Show full email on hover
                            style={{maxWidth: '200px'}} // Limit width for email
                        >
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="py-2 max-h-96 overflow-y-auto"> {/* Add scroll for long menus */}
                    {menuItems.map((item, idx) => (
                        <MenuItem
                            key={idx}
                            label={item.label}
                            icon={item.icon}
                            onClick={item.onClick}
                            className={item.className}
                        />
                    ))}
                </div>
            </MenuDropdown>

            <LoadingWrapper
                isLoading={isLoggingOut}
                fullScreen
                zIndex={9999}
                overlayClassName="bg-black/40 backdrop-blur-[2px]"
            />
        </>
    );
}