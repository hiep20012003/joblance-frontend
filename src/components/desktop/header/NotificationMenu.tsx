import MenuDropdown from "@/components/shared/MenuDropdown";
import {Bell, Package, Settings} from "lucide-react";
import {formatISOTime} from "@/lib/utils/time";
import {useEffect} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {INotificationDocument} from "@/types/notification";

const notificationIcons: Record<string, React.ReactNode> = {
    ORDER: <Package className="w-5 h-5 text-primary-600"/>,
    SYSTEM: <Settings className="w-5 h-5 text-primary-600"/>,
};

const MAX_VISIBLE_NOTIFICATIONS = 5; // Define a threshold for visible notifications

export default function NotificationMenu({
                                             notifications,
                                             isOpen,
                                             onClose,
                                             onRead,
                                             anchorRef,
                                         }: {
    notifications: INotificationDocument[];
    isOpen: boolean;
    onClose: () => void;
    onRead: (id: string) => void
    anchorRef: React.RefObject<Element | null>;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fullPath = `${pathname}?${searchParams.toString()}`;
    const router = useRouter();

    const notificationItems = notifications?.map((item) => ({
        id: item._id,
        message: (
            <span>
                <strong className="font-semibold">{item.actor.username}</strong>{" "}
                {item.payload.message}
            </span>
        ),
        time: formatISOTime(item.timestamp as string, "relative"),
        read: item.read,
        type: item.type,
        link:
            item.type === "ORDER"
                // ? `/users/${item.recipient.username}/orders/${item.payload.extra?.orderId}/detail`
                ? `/orders/${item.payload.extra?.orderId}`
                : `/orders/${item.payload.extra?.orderId}`
    }));

    useEffect(() => onClose?.(), [fullPath]);

    const displayedNotifications = notificationItems?.slice(0, MAX_VISIBLE_NOTIFICATIONS);
    const hasMoreNotifications = (notificationItems?.length || 0) >= MAX_VISIBLE_NOTIFICATIONS;

    async function handleNotificationClick(id: string) {
        onRead?.(id);
    }

    return (
        <MenuDropdown
            anchorRef={anchorRef}
            isOpen={isOpen}
            onClose={onClose}
            className="flex flex-col w-100 min-h-120"
        >
            <div className="p-4 border-b border-gray-200 bg-background z-10">
                <h3 className="text-lg font-bold text-gray-700">Notifications</h3>
            </div>

            {notificationItems?.length > 0 ? (
                <>
                    <ul className="flex flex-col flex-1 overflow-y-auto divide-y divide-gray-100 scrollbar-beautiful">
                        {displayedNotifications.map((notif) => (
                            <Link
                                prefetch
                                href={notif.link}
                                onClick={() => handleNotificationClick(notif.id)}
                                key={notif.id}
                                className="flex gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer items-stretch"
                            >
                                <div
                                    className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    {notificationIcons[notif.type]}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm text-gray-800 break-words whitespace-normal line-clamp-2">
                                            {notif.message}
                                        </p>
                                        {!notif.read && (
                                            <span
                                                className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2 mt-[2px]"/>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">{notif.time}</p>
                                </div>
                            </Link>

                        ))}
                    </ul>

                    {hasMoreNotifications && (
                        <Link
                            href="/"
                            className="block p-2 text-center text-sm text-primary-600 hover:bg-gray-50 font-semibold border-t border-gray-200 bg-background"
                            onClick={onClose}
                        >
                            View All Notifications
                        </Link>
                    )}
                </>
            ) : (
                <div
                    className="flex flex-col items-center justify-center flex-1 p-6 text-center text-gray-500">
                    <Bell className="w-8 h-8 mb-2 text-gray-400"/>
                    <p className="text-sm">No notifications</p>
                </div>
            )}
        </MenuDropdown>
    );
}
