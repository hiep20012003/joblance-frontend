// components/OrderSummary.tsx
import React, {useState} from 'react';
import Image from 'next/image';
import {formatISOTime} from "@/lib/utils/time";
import {Check, ChevronDown, ChevronUp} from "lucide-react";
import {formatPrice, toSlug} from "@/lib/utils/helper";
import {OrderStatus} from "@/lib/constants/constant";
import {useUserContext} from "@/context/UserContext";
import Link from "next/link";
import {encodeUUID} from "@/lib/utils/uuid";
import {useOrder} from "@/components/features/order/OrderContext";

export enum OrderStage {
    OrderPlaced = 'Order placed',
    RequirementsSubmitted = 'Requirements submitted',
    OrderInProgress = 'Order in progress',
    OrderDelivered = 'Order delivered',
    Complete = 'Complete',
}

const getCurrentStage = (status: OrderStatus): OrderStage | null => {
    switch (status) {
        case OrderStatus.PENDING:
            return OrderStage.OrderPlaced;
        case OrderStatus.ACTIVE:
            return OrderStage.OrderPlaced;
        case OrderStatus.IN_PROGRESS:
            return OrderStage.OrderInProgress;
        case OrderStatus.DELIVERED:
            return OrderStage.OrderDelivered;
        case OrderStatus.COMPLETED:
            return OrderStage.Complete;
        default:
            return null;
    }
};

const SectionHeader: React.FC<{
    title: string;
    isOpen: boolean;
    onToggle: () => void;
}> = ({title, isOpen, onToggle}) => (
    <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={onToggle}
    >
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {isOpen ? <ChevronUp strokeWidth={2} size={20}/> : <ChevronDown strokeWidth={2} size={20}/>}
    </div>
);

export default function OrderSummary() {
    const [show, setShow] = useState({details: true, tracker: true});
    const {order, isSeller} = useOrder();

    const toggle = (key: 'details' | 'tracker') =>
        setShow(prev => ({...prev, [key]: !prev[key]}));

    const orderStages = [
        OrderStage.OrderPlaced,
        OrderStage.RequirementsSubmitted,
        OrderStage.OrderInProgress,
        OrderStage.OrderDelivered,
        OrderStage.Complete,
    ];

    const gigUrl = `/${order.sellerUsername}/${toSlug(order.gigTitle)}-${encodeUUID(order.gigId)}`;

    return (
        <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 rounded-lg max-w-sm mx-auto">
            {/* Order Details */}
            <SectionHeader
                title="Order Details"
                isOpen={show.details}
                onToggle={() => toggle('details')}
            />
            {show.details && (
                <>
                    <div className="flex items-start mb-4">
                        <div className="relative w-20 h-20 flex-shrink-0 mr-4 rounded-md overflow-hidden">
                            {order.gigCoverImage && (
                                <Image
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                                    src={order.gigCoverImage}
                                    alt={order.gigTitle}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            )}
                        </div>
                        <div>
                            <p className="text-gray-900 font-medium">{order.gigTitle}</p>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium order-status ${(order.status.toLowerCase().replace('_', '-'))}`}
                            >
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        {isSeller ? (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Purchased by</span>
                                <span className="text-primary-600 font-medium">{order.buyerUsername}</span>
                            </div>

                        ) : (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Provided by</span>
                                <span className="text-primary-600 font-medium">{order.sellerUsername}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery due date</span>
                            <span
                                className="text-gray-800">{formatISOTime(order.expectedDeliveryDate, 'datetime')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price</span>
                            <span className="text-gray-800">{formatPrice(order.price)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-600 shrink-0">Order ID</span>
                            <span className="text-gray-800">{order._id}</span>
                        </div>
                    </div>
                    {[OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(order.status) && !isSeller && (
                        <Link href={gigUrl} target={"_blank"}
                              className={"my-2 btn btn-soft bg-primary-600 text-white rounded-md hover:bg-primary-700"}>Order
                            This Gig Again
                        </Link>
                    )}
                </>
            )}
            <div className="border-b border-gray-200"></div>
            {/* Order Tracker */}
            {
                ![OrderStatus.CANCELLED, OrderStatus.CANCEL_PENDING, OrderStatus.DISPUTED].includes(order.status) && (
                    <>
                        <SectionHeader
                            title="Order Tracker"
                            isOpen={show.tracker}
                            onToggle={() => toggle('tracker')}
                        />
                        {show.tracker && (
                            <ol className="relative ml-3">
                                {orderStages.map((stage, index) => {
                                    const currentStage = getCurrentStage(order.status);
                                    const isCompleted = currentStage && orderStages.indexOf(stage) < orderStages.indexOf(currentStage);
                                    const isCurrent = currentStage === stage;
                                    const isActive = isCompleted || isCurrent;

                                    return (
                                        <li key={stage} className="mb-4 ml-6">
                                            <div
                                                className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ${
                                                    isActive
                                                        ? 'bg-primary-600 ring-primary-100'
                                                        : 'bg-gray-200 ring-gray-50'
                                                }`}
                                            >
                                                {isActive
                                                    ? <Check className="text-white" size={16} strokeWidth={2}/>
                                                    : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                                            </div>
                                            <p className={`text-sm ${isCurrent ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                                                {stage}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </>
                )
            }
        </div>
    );
};

