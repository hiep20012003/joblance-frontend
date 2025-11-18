'use client'

import {IOrderDocument} from "@/types/order";
import {formatISOTime} from "@/lib/utils/time";
import {
    FileText,
    Edit,
    Rocket,
    Calendar,
    Truck,
    Star,
    ChevronUp,
    ChevronDown, Download, RefreshCcw, CheckCircle, XCircle
} from "lucide-react";
import React, {JSX, useState} from "react";
import {useUserContext} from "@/context/UserContext";
import {OrderDeliveryDetails} from "@/components/features/order/OrderDeliveryDetails";
import AddReviewForm from "@/components/features/review/AddReviewForm";
import Modal from "@/components/shared/Modal";
import Avatar from "@/components/shared/Avatar";
import {useOrder} from "@/components/features/order/OrderContext";

// --- 1. ENUM và Interface Định nghĩa Sự kiện ---

export enum OrderEventType {
    ORDER_PLACED = "ORDER_PLACED",
    ORDER_STARTED = "ORDER_STARTED",
    REQUIREMENTS_SUBMITTED = "REQUIREMENTS_SUBMITTED",
    REQUEST_EXTENDED_DELIVERY = "REQUEST_EXTENDED_DELIVERY",
    DELIVERY_DATE_UPDATED = "DELIVERY_DATE_UPDATED",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    SELLER_REVIEW = "SELLER_REVIEW",
    BUYER_REVIEW = "BUYER_REVIEW",
}

// Interface EventDetail KHÔNG chứa trường JSX details tĩnh
interface EventDetail {
    buyerText: string;
    sellerText: string;
    icon: JSX.Element;
    borderColorClass: string;
}

function isOrderEventType(type: string): type is OrderEventType {
    return Object.values(OrderEventType).includes(type as OrderEventType);
}

// Hàm kiểm tra xem sự kiện có thể mở rộng (accordion) hay không
const hasToggleableDetails = (type: OrderEventType) => {
    return [
        OrderEventType.BUYER_REVIEW,
        OrderEventType.SELLER_REVIEW,
        OrderEventType.ORDER_DELIVERED,
        OrderEventType.DELIVERY_DATE_UPDATED,
        OrderEventType.REQUEST_EXTENDED_DELIVERY,
    ].includes(type);
};

const eventDetails: Record<OrderEventType, EventDetail> = {
    [OrderEventType.ORDER_PLACED]: {
        buyerText: "You placed the order",
        sellerText: "Buyer placed the order",
        icon: <FileText size={20} className="text-purple-500"/>,
        borderColorClass: "border-purple-500",
    },
    [OrderEventType.REQUIREMENTS_SUBMITTED]: {
        buyerText: "You submitted the requirements",
        sellerText: "Buyer submitted the requirements",
        icon: <Edit size={20} className="text-blue-500"/>,
        borderColorClass: "border-blue-500",
    },
    [OrderEventType.ORDER_STARTED]: {
        buyerText: "Your order started",
        sellerText: "The order started",
        icon: <Rocket size={20} className="text-green-500"/>,
        borderColorClass: "border-green-500",
    },
    [OrderEventType.REQUEST_EXTENDED_DELIVERY]: {
        buyerText: "Seller requested an extended delivery",
        sellerText: "You requested an extended delivery",
        icon: <Calendar size={20} className="text-yellow-500"/>,
        borderColorClass: "border-yellow-500",
    },
    [OrderEventType.DELIVERY_DATE_UPDATED]: {
        buyerText: "Your delivery date was updated",
        sellerText: "Delivery date was updated",
        icon: <Calendar size={20} className="text-teal-500"/>,
        borderColorClass: "border-teal-500",
    },
    [OrderEventType.ORDER_DELIVERED]: {
        buyerText: "Your order was delivered",
        sellerText: "You delivered the order",
        icon: <Truck size={20} className="text-indigo-500"/>,
        borderColorClass: "border-indigo-500",
    },
    [OrderEventType.SELLER_REVIEW]: {
        buyerText: "Seller left a review",
        sellerText: "You left a review",
        icon: <Star size={20} className="text-orange-500"/>,
        borderColorClass: "border-orange-500",
    },
    [OrderEventType.BUYER_REVIEW]: {
        buyerText: "You left a review",
        sellerText: "Buyer left a review",
        icon: <Star size={20} className="text-orange-500"/>,
        borderColorClass: "border-orange-500",
    },
};

// --- 2. Sub-Component EventHeader ---
// (Giữ nguyên)
interface EventHeaderProps {
    title: string;
    event: { icon: JSX.Element; timestamp: string };
    isOpen: boolean;
    onToggle: () => void;
    isToggleable: boolean;
}

const EventHeader: React.FC<EventHeaderProps> = ({title, event, isOpen, onToggle, isToggleable}) => (
    <div
        className={`flex justify-between items-center select-none ${isToggleable ? 'cursor-pointer' : ''}`}
        onClick={isToggleable ? onToggle : undefined}
    >
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                {event.icon}
            </div>
            <div className="flex gap-4 items-center">
                <h3 className="text-gray-700 font-medium">{title}</h3>
                <span className="text-gray-500 text-sm italic">
                    {formatISOTime(event.timestamp, "short")}
                </span>
            </div>
        </div>
        {isToggleable && (
            isOpen ? (
                <ChevronUp className={'text-gray-600'} strokeWidth={2} size={18}/>
            ) : (
                <ChevronDown className={'text-gray-600'} strokeWidth={2} size={18}/>
            )
        )}
    </div>
);


interface OrderActivityProps {
    setCurrentTab: (tab: string) => void;
}

export default function OrderActivity({setCurrentTab}: OrderActivityProps) {
    const {order, seller, buyer, isSeller, reviews} = useOrder();

    const [openIndices, setOpenIndices] = useState<number[]>(() =>
        [...order.events.keys()].filter((index) =>
            isOrderEventType(order.events[index].type) &&
            hasToggleableDetails(order.events[index].type)
        )
    );


    const toggleAccordion = (index: number) => {
        setOpenIndices((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const sortedEvents = [...order.events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const EventDetails = (event: any): JSX.Element => {

        switch (event.type as OrderEventType) {
            case OrderEventType.ORDER_DELIVERED:
                // Sử dụng Component mới
                return (<OrderDeliveryDetails
                    deliveredEvent={event}
                    isSeller={isSeller}
                />);

            case OrderEventType.REQUEST_EXTENDED_DELIVERY:
                return (
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold">Reason for extension:</p>
                        <p className="italic text-gray-700">{event.reason || "No reason provided."}</p>
                        <p className="mt-2">
                            New Delivery Date Requested:
                            <span className="font-medium text-teal-600 ml-1">
                                {event.newDate ? formatISOTime(event.newDate, "datetime") : "N/A"}
                            </span>
                        </p>
                    </div>
                );

            case OrderEventType.DELIVERY_DATE_UPDATED:
                return (
                    <div className="text-sm">
                        <p>
                            Updated by: <span className="font-medium">{event.updatedBy || "System"}</span>
                        </p>
                        <p className="mt-1">
                            New Deadline:
                            <span className="font-medium text-teal-600 ml-1">
                                {event.newDate ? formatISOTime(event.newDate, "datetime") : "N/A"}
                            </span>
                        </p>
                    </div>
                );

            // case OrderEventType.SELLER_REVIEW:
            // case OrderEventType.BUYER_REVIEW:
            //     return (
            //         <div className="space-y-2 text-sm">
            //             <p className="flex items-center gap-1 font-semibold text-yellow-600">
            //                 Rating:
            //                 <span className="text-lg">
            //                     {event.rating ? '★'.repeat(event.rating) + '☆'.repeat(5 - event.rating) : 'N/A'}
            //                 </span>
            //             </p>
            //             {event.comment && (
            //                 <>
            //                     <p className="font-semibold mt-1">Comment:</p>
            //                     <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-700">
            //                         &#34;{event.comment}&#34;
            //                     </blockquote>
            //                 </>
            //             )}
            //         </div>
            //     );

            default:
                return (
                    <p className="italic text-sm">
                        No additional details are available for this event.
                    </p>
                );
        }
    };

    return (
        <>
            <div className="p-6 py-8 border border-gray-200 rounded-lg shadow-sm space-y-6">
                <h2 className="text-sm font-semibold text-gray-600">Order History</h2>

                <div className="space-y-4">
                    {sortedEvents.map((event, index) => {
                        if (!isOrderEventType(event.type)) return null;

                        const details = eventDetails[event.type];
                        const isToggleable = hasToggleableDetails(event.type);
                        const isOpen = isToggleable && openIndices.includes(index);

                        return (
                            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                <EventHeader
                                    title={isSeller ? details.sellerText : details.buyerText}
                                    event={{icon: details.icon, timestamp: event.timestamp}}
                                    isOpen={isOpen}
                                    onToggle={() => toggleAccordion(index)}
                                    isToggleable={isToggleable}
                                />

                                {event.type === OrderEventType.REQUIREMENTS_SUBMITTED && (
                                    <div className="w-full -mt-2">
                                        <button
                                            onClick={() => {
                                                setCurrentTab('requirements');
                                                window.scrollTo({top: 0, behavior: 'smooth'})
                                            }}
                                            className={'block ml-auto btn btn-text text-sm hover:underline text-primary-600'}>View
                                            requirements
                                        </button>
                                    </div>
                                )}

                                {/* Render nội dung chi tiết động */}
                                {isToggleable && isOpen && (
                                    <div
                                        className={`mt-3 ml-4 text-gray-600 border-l-2 ${details.borderColorClass} pl-4`}
                                    >
                                        {EventDetails(event)}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {reviews?.length > 0 && reviews.map((review, index) => (
                        <div key={review.reviewerId} className="flex flex-col gap-4">
                            {review.reviewerId === seller._id && (
                                <div className="p-4 bg-primary-50 rounded-lg flex gap-4">
                                    {/* Avatar */}
                                    <Avatar src={seller.profilePicture} username={seller.username} size={40}
                                            className={"mt-1 flex-shrink-0"}/>

                                    {/* Text + Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Message */}
                                        <div className="mb-4">
                                            <p className="text-base text-gray-600">
                                                Review from{' '}
                                                <span className="font-medium text-primary-500">
                                                        {(isSeller ? 'You' : seller.username)}
                                                    </span>
                                            </p>
                                            <p className="mt-1 break-words text-gray-800 leading-relaxed italic">
                                                &#34;{review.review}&#34;
                                            </p>
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
                                                    }`}
                                                />
                                            ))}
                                            <span
                                                className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                                        </div>

                                    </div>
                                </div>
                            )}
                            {review.reviewerId === buyer._id && (
                                <div className="p-4 bg-primary-50 rounded-lg flex gap-4">
                                    {/* Avatar */}
                                    <Avatar src={buyer.profilePicture!} username={buyer.username!} size={40}
                                            className={"mt-1 flex-shrink-0"}/>
                                    {/* Text + Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Message */}
                                        <div className="mb-4">
                                            <p className="text-base text-gray-600">
                                                Review from{' '}
                                                <span className="font-medium text-primary-500">
                                                        {(!isSeller ? 'You' : buyer.username)}
                                                    </span>
                                            </p>
                                            <p className="mt-1 break-words text-gray-800 leading-relaxed italic">
                                                &#34;{review.review}&#34;
                                            </p>
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
                                                    }`}
                                                />
                                            ))}
                                            <span
                                                className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}


