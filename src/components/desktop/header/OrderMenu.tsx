import MenuDropdown from "@/components/shared/MenuDropdown";
import Link from "next/link";
import {RefObject} from "react";

export default function OrderMenu({
                                      isOpen,
                                      onClose,
                                      anchorRef,
                                  }: {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<Element | null>;
}) {
    const orders = [
        {id: 1, title: "Logo Design", seller: "Jane Doe", status: "In Progress", progress: 60},
        {id: 2, title: "Website Development", seller: "John Smith", status: "Delivered", progress: 100},
        {id: 3, title: "Content Writing", seller: "Mike Johnson", status: "Pending", progress: 20},
        {id: 4, title: "Video Editing", seller: "Anna Lee", status: "In Review", progress: 80},
        {id: 5, title: "SEO Optimization", seller: "Tom White", status: "Pending", progress: 30},
    ];

    return (
        <MenuDropdown
            anchorRef={anchorRef}
            isOpen={isOpen}
            onClose={onClose}
            className="flex flex-col max-h-120 min-w-96"
        >
            <div className="p-4 border-b border-gray-200 bg-background z-10">
                <h3 className="text-lg font-bold text-gray-800">Orders</h3>
            </div>

            <div
                className="flex-1 overflow-y-auto divide-y divide-gray-100
                           scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                           hover:scrollbar-thumb-gray-400"
            >
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/src/app/orders/${order.id}`}
                        className="block p-4 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                    >
                        <div className="mb-2">
                            <p className="font-semibold text-gray-800">{order.title}</p>
                            <p className="text-sm text-gray-600">Seller: {order.seller}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary-600">{order.status}</span>
                            <span className="text-xs text-gray-500">{order.progress}%</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-primary-500 h-1.5 rounded-full transition-all"
                                style={{width: `${order.progress}%`}}
                            ></div>
                        </div>
                    </Link>
                ))}
            </div>

            <Link
                href="/orders"
                className="block p-2 text-sm text-center text-primary-600 hover:bg-gray-50 font-semibold border-t border-gray-200 bg-background"
                onClick={onClose}
            >
                View All Orders
            </Link>
        </MenuDropdown>
    );
}
