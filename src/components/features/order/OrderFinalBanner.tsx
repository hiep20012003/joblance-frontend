'use client'

import {INegotiationDocument, IOrderDocument} from "@/types/order";
import React from "react";
import {AlertCircle, CheckCircle, XCircle} from "lucide-react"; // Added CheckCircle and XCircle
import {OrderStatus} from "@/lib/constants/constant"; // Import OrderStatus
import {useUserContext} from "@/context/UserContext";
import Link from "next/link";
import {useOrder} from "@/components/features/order/OrderContext"; // Keep useUserStore if needed for isSeller logic

interface OrderFinalBannerProps {
    onGiveReview?: () => void; // New prop for review action
}

export default function OrderFinalBanner({
                                             onGiveReview,
                                         }: OrderFinalBannerProps) {
    // Determine if a review is pending
    const {order, isSeller, reviews} = useOrder();
    const needsReview = order.status === OrderStatus.COMPLETED && reviews.length === 0

    // Only render if the order is completed or cancelled
    if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED) {
        return null;
    }

    let bannerBgClass = "";
    let icon = null;
    let title = "";
    let message = "";
    let textColorClass = "";
    let borderColorClass = "";

    if (order.status === OrderStatus.COMPLETED) {
        bannerBgClass = "bg-green-50";
        icon = <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-800"/>;
        title = "Order Completed";
        message = "This order has been successfully completed.";
        textColorClass = "text-green-800";
        borderColorClass = "border-green-200";
    } else if (order.status === OrderStatus.CANCELLED) {
        bannerBgClass = "bg-red-50";
        icon = <XCircle className="h-5 w-5 flex-shrink-0 text-red-800"/>;
        title = "Order Cancelled";
        message = "This order has been cancelled.";
        textColorClass = "text-red-800";
        borderColorClass = "border-red-200";
    } else {
        return null; // Should not happen due to initial check, but for safety
    }

    return (
        <section className={`${bannerBgClass} py-4 border-b ${borderColorClass}`}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        {icon}
                        <h2 className={`text-lg font-semibold ${textColorClass}`}>
                            {title}
                        </h2>
                    </div>

                    {/* Body */}
                    <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                            <p className={`${textColorClass}`}>
                                {message} {needsReview ? isSeller
                                ? "Share your experience working with this buyer"
                                : "Share your experience working with this seller" : ''}
                            </p>

                            {needsReview && (
                                <div
                                    className="rounded-md mt-2">
                                    <Link
                                        href={`/orders/${order._id}/reviews/new`}
                                        className="btn btn-text text-base text-primary-600 hover:underline"
                                        // onClick={onGiveReview}
                                    >
                                        Leave a Review
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
