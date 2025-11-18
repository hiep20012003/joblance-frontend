// File: components/features/order/OrderDeliveryDetails.tsx

'use client'
import React from 'react';
import {CheckCircle, Download, RefreshCcw, XCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {approveOrderDelivery, reviseOrderDelivery} from "@/lib/services/client/order.client";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import Avatar from "@/components/shared/Avatar";
import {OrderStatus} from "@/lib/constants/constant";
import {useOrder} from "@/components/features/order/OrderContext";

interface OrderDeliveryDetailsProps {
    deliveredEvent: any; // Event object chứa timestamp
    isSeller: boolean;
}

export const OrderDeliveryDetails: React.FC<OrderDeliveryDetailsProps> = ({deliveredEvent}) => {
    const {order, isSeller} = useOrder();

    const router = useRouter();

    const {mutate: approveMutate, loading: approveLoading} = useFetchMutation(
        approveOrderDelivery,
        {
            successMessage: "Delivery approved successfully",
            onSuccess: () => router.refresh(),
        }
    );

    const {mutate: reviseMutate, loading: reviseLoading} = useFetchMutation(
        reviseOrderDelivery,
        {
            successMessage: "Revision requested successfully",
            onSuccess: () => router.refresh(),
        }
    );

    const delivered = order.deliveredWork.find((item) => item.deliveredAt === deliveredEvent.timestamp);

    if (!delivered) return <p className="text-red-500 text-sm">Error: Delivery data not found.</p>;

    const isApproved = delivered.approved === true;
    const isRejected = delivered.approved === false;
    const isPending = delivered.approved === null;

    async function handleRevise() {
        await reviseMutate(order._id);
    }

    async function handleApprove() {
        await approveMutate(order._id);
    }

    return (
        <>
            <LoadingWrapper isLoading={reviseLoading || approveLoading} fullScreen/>
            <div className="flex gap-4">
                {/* Avatar */}
                <Avatar src={order.sellerPicture} username={order.sellerUsername} size={40}
                        className={"mt-1 flex-shrink-0"}/>

                {/* Text + Details */}
                <div className="flex-1 min-w-0">
                    {/* Message */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Message from{' '}
                            <span className="font-medium text-primary-500">
                                {(isSeller ? 'You' : order.sellerUsername)}
                            </span>
                        </p>
                        <p className="italic mt-1 break-words text-gray-800 leading-relaxed">
                            {delivered.message}
                        </p>
                    </div>

                    {/* Files đính kèm */}
                    <div className="mt-4">
                        <h3 className={"font-medium text-sm text-gray-700 mb-2"}>DELIVERED FILES</h3>
                        {delivered.files && delivered.files.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {delivered.files.map((file: any, index: number) => (
                                    <div
                                        onClick={() => window.open(file.downloadUrl, '_blank')}
                                        key={index}
                                        className="flex items-center shrink-0 gap-2 text-sm font-medium px-4 py-2 bg-gray-100 rounded-md w-fit text-primary-500 hover:bg-gray-200 transition duration-150 cursor-pointer"
                                    >
                                        <span>
                                            {file.fileName} ({((file.fileSize || 0) / 1024).toFixed(1)} KB)
                                        </span>
                                        <Download size={18}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No files were attached.</p>
                        )}
                    </div>

                    {/* Action Buttons / Status - Chỉ hiển thị cho Buyer */}
                    {(![OrderStatus.CANCEL_PENDING, OrderStatus.DISPUTED].includes(order.status) || order.currentNegotiationId) && (
                        <div className="mt-4">
                            {/* 1. HÀNH ĐỘNG CỦA BUYER: Đang chờ duyệt (isPending) */}
                            {!isSeller && isPending && (
                                <div className="mt-4">
                                    <div
                                        className="flex justify-end gap-3 py-4 border-t border-gray-100"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleRevise}
                                            className="btn btn-soft text-gray-700 bg-gray-100 hover:bg-gray-200"
                                        >
                                            <RefreshCcw className="w-4 h-4"/> Request Revisions
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            className="btn btn-soft bg-primary-600 text-white hover:bg-primary-700"
                                        >
                                            <CheckCircle className="w-4 h-4"/> Approve Delivery
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-1 text-right italic">
                                        If no action is taken, the order will be automatically marked as
                                        complete in 3 days.
                                    </p>
                                </div>
                            )}

                            {/* 2. TRẠNG THÁI BUYER: Đã duyệt (isApproved) */}
                            {isApproved && (
                                <div
                                    className="flex justify-start items-center gap-2 p-4 bg-green-50 rounded-lg mt-4">
                                    <CheckCircle className="w-4 h-4 text-green-600"/>
                                    <p className="text-green-700 font-semibold text-sm">Delivery Approved</p>
                                </div>
                            )}

                            {/* 3. TRẠNG THÁI BUYER: Đã từ chối (isRejected) */}
                            {isRejected && (
                                <div
                                    className="flex justify-start items-center gap-2 p-4 bg-red-50 rounded-lg mt-4">
                                    <XCircle className="w-4 h-4 text-red-600"/>
                                    <p className="text-red-700 font-semibold text-sm">Delivery Rejected</p>
                                </div>
                            )}

                            {/* 4. THÔNG BÁO UX CHO SELLER: Đã giao và đang chờ Buyer */}
                            {isSeller && isPending && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div
                                        className="flex items-center gap-2 text-blue-800 font-semibold">
                                        <CheckCircle className="w-4 h-4"/>
                                        <p className="text-sm">Waiting for your Buyer to review</p>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-1 ml-6">
                                        The clock is paused. You will be notified if the Buyer approves
                                        or requests revisions.
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                    }
                </div>
            </div>
        </>
    );
};