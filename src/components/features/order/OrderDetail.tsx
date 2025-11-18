'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import {Clock3, FileText, Calendar, User, CheckCircle, XCircle, AlertCircle, Eye, ExternalLink} from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import {IOrderDocument} from '@/types/order';
import clsx from 'clsx';
import {formatPrice} from "@/lib/utils/helper";
import Link from "next/link";
import {usePathname} from "next/navigation";

type OrderDetailProps = {
    order: Required<IOrderDocument>;
    className?: string;
};

function OrderDetail({order, className}: OrderDetailProps) {
    const {
        invoiceId,
        gigId,
        gigTitle,
        gigDescription,
        gigCoverImage,
        buyerUsername,
        buyerPicture,
        sellerUsername,
        sellerPicture,
        quantity,
        price,
        serviceFee,
        totalAmount,
        status,
        requirements,
        dateOrdered,
        expectedDeliveryDate,
        expectedDeliveryDays,
        events,
        approved,
        cancelled,
        delivered,
    } = order;

    const imageSrc = gigCoverImage || '/images/placeholder.png';
    const formattedDateOrdered = dateOrdered ? new Date(dateOrdered).toLocaleString() : '—';
    const formattedExpectedDelivery = expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleString() : `${expectedDeliveryDays} days`;

    const [showFullDescription, setShowFullDescription] = useState(false);
    const maxDescriptionLength = 150;
    const isLongDescription = gigDescription.length > maxDescriptionLength;

    const displayedDescription = showFullDescription
        ? gigDescription
        : gigDescription.slice(0, maxDescriptionLength);

    const pathname = usePathname();

    const ActionButtons = ({order}: { order: IOrderDocument }) => (
        <div className={clsx(
            "flex gap-1",
            "rounded-md",
        )}>

            {/* Delete */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // handleDelete();
                }}
                className={clsx(
                    "p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600 btn btn-plain disabled:hover:bg-transparent disabled:hover:text-gray-600",
                )}
                title="Cancel"
                disabled={order.status === "CANCELLED" || order.status === "COMPLETED"}
            >
                Cancel
            </button>

            {/* Activities */}
            {order.status === "PENDING" ? undefined : (
                <Link
                    href={`/users/${order.b?.username}/orders/${order._id}?source=${encodeURIComponent(pathname)}`}
                    target="_blank"
                    className={clsx(
                        "flex justify-center items-center gap-1 p-1.5 hover:bg-primary-50 transition-colors text-primary-600 disabled:hover:text-gray-600 btn btn-plain disabled:hover:bg-transparent",
                    )}
                    title="Activities"
                    prefetch
                >
                    <ExternalLink size={16}/>
                    Activities
                </Link>
            )}
        </div>
    );

    return (
        <div className={clsx('w-full bg-transparent rounded-lg', className)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column */}
                <div className="space-y-8">

                    {/* Header */}
                    <div className="flex justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                            <p className="text-sm text-gray-500 mt-1">Invoice ID: {invoiceId}</p>
                            <p className="text-sm text-gray-500 mt-1">Gig ID: {gigId}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <span
                                className={clsx(
                                    'px-4 py-2 rounded-full text-sm font-medium',
                                    status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-700',
                                    status === 'COMPLETED' && 'bg-green-100 text-green-700',
                                    status === 'ACTIVE' && 'bg-yellow-100 text-yellow-700',
                                    status === 'CANCELLED' && 'bg-red-100 text-red-700',
                                    status === 'PENDING' && 'bg-gray-100 text-gray-700'
                                )}
                            >
                                {status.toUpperCase()}
                            </span>
                            <ActionButtons order={order}/>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        {/* Gig Image */}
                        <div className="relative w-full rounded-lg overflow-hidden aspect-[16/9] lg:h-40">
                            <Image
                                src={imageSrc}
                                alt={gigTitle}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/logo-brand.webp";
                                }}
                            />
                        </div>

                        {/* Gig Info */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{gigTitle}</h3>
                            <p className="text-sm text-gray-700">
                                {displayedDescription}
                                {isLongDescription && (
                                    <button
                                        className="ml-2 text-blue-500 underline cursor-pointer"
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                    >
                                        {showFullDescription ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </p>
                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock3 className="w-4 h-4"/>
                                    <span>Ordered: {formattedDateOrdered}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4"/>
                                    <span>Expected Delivery: {formattedExpectedDelivery}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buyer and Seller */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties Involved</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar src={buyerPicture} username={buyerUsername} size={40}/>
                                <div>
                                    <h4 className="font-medium text-gray-900">Buyer: {buyerUsername}</h4>
                                    <p className="text-sm text-gray-600">You</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar src={sellerPicture} username={sellerUsername} size={40}/>
                                <div>
                                    <h4 className="font-medium text-gray-900">Seller: {sellerUsername}</h4>
                                    <p className="text-sm text-gray-600">Provider of the service</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Pricing */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Breakdown</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                                <span>Price (x{quantity})</span>
                                <span>{formatPrice(price)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                                <span>Service Fee</span>
                                <span>{formatPrice(serviceFee)}</span>
                            </div>
                            <div
                                className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                                <span>Total Amount</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Requirements */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                        {requirements.length > 0 ? (
                            <ul className="space-y-4">
                                {requirements.map((req) => (
                                    <li key={req.requirementId} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{req.question}</p>
                                                {req.answerText &&
                                                    <p className="text-sm text-gray-600 mt-1">Answer: {req.answerText}</p>}
                                                {req.answerFile && (
                                                    <div className="mt-1 flex flex-col gap-1">
                                                        <a
                                                            href={req.answerFile.downloadUrl || req.answerFile.secureUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                                                        >
                                                            {/* File icon */}
                                                            <FileText className="w-4 h-4"/>
                                                            {req.answerFile.fileName} ({(req.answerFile.fileSize / 1024).toFixed(1)} KB)
                                                        </a>
                                                        <p className="text-xs text-gray-500">{req.answerFile.fileType}</p>
                                                    </div>
                                                )}

                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {req.required &&
                                                    <span
                                                        className="bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                                                {req.hasFile && <FileText className="w-4 h-4"/>}
                                                {req.answered ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-yellow-500"/>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No requirements specified.</p>
                        )}
                    </div>

                    {/* Events Timeline */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                                        <User className="w-4 h-4 text-blue-700"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{event.type}</p>
                                        <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default React.memo(OrderDetail);

// Skeleton Component - cập nhật overlay gig description
export function OrderDetailSkeleton({className}: { className?: string }) {
    return (
        <div className={clsx('w-full bg-transparent rounded-lg animate-pulse', className)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column */}
                <div className="space-y-8">

                    {/* Header Skeleton */}
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-gray-200 rounded-md"/>
                            <div className="h-4 w-32 bg-gray-200 rounded-md"/>
                            <div className="h-4 w-24 bg-gray-200 rounded-md"/>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <div className="h-6 w-20 bg-gray-200 rounded-full"/>
                            <div className="h-6 w-30 bg-gray-200 rounded-md"/>
                        </div>
                    </div>

                    {/* Gig Information Skeleton */}
                    <div className="w-full flex flex-col gap-2">
                        {/* Image */}
                        <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg lg:h-40"/>

                        {/* Text skeleton below image */}
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="h-5 w-3/4 bg-gray-200 rounded-md"/>
                            <div className="h-4 w-full bg-gray-200 rounded-md"/>
                            <div className="h-4 w-full bg-gray-200 rounded-md"/>
                            <div className="h-4 w-5/6 bg-gray-200 rounded-md"/>
                        </div>
                    </div>

                    {/* Buyer & Seller */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array(2).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-200 rounded-lg">
                                <div className="h-10 w-10 bg-gray-200 rounded-full"/>
                                <div className="flex-1 space-y-1">
                                    <div className="h-4 w-24 bg-gray-200 rounded-md"/>
                                    <div className="h-3 w-16 bg-gray-200 rounded-md"/>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-8">

                    {/* Pricing */}
                    <div className="bg-gray-200 rounded-lg p-4 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded-md"/>
                        <div className="h-4 w-24 bg-gray-200 rounded-md"/>
                        <div className="h-4 w-20 bg-gray-200 rounded-md"/>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg"/>
                        ))}
                    </div>

                    {/* Timeline / Events */}
                    <div className="space-y-2">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-200 rounded-lg">
                                <div className="h-8 w-8 bg-gray-200 rounded-full"/>
                                <div className="flex-1 space-y-1">
                                    <div className="h-4 w-32 bg-gray-200 rounded-md"/>
                                    <div className="h-3 w-24 bg-gray-200 rounded-md"/>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
