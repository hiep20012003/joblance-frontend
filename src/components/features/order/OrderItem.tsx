'use client';

import React from 'react';
import Image from 'next/image';
import {Clock3, Tag} from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import {IOrderDocument} from '@/types/order';
import clsx from 'clsx';
import {formatPrice} from "@/lib/utils/helper";
import {useUserContext} from "@/context/UserContext";

type OrderRowVariant = 'default' | 'compact' | 'inline' | 'card';

type OrderRowProps = {
    order: IOrderDocument;
    className?: string;
    actionNode?: React.ReactNode;
    variant?: OrderRowVariant;
};

function OrderComponent({order, className, actionNode, variant = 'default'}: OrderRowProps) {
    const {
        gigTitle,
        gigCoverImage,
        sellerUsername,
        sellerPicture,
        buyerUsername,
        buyerPicture,
        price,
        quantity,
        totalAmount,
        status,
        dateOrdered,
        expectedDeliveryDate,
        sellerId
    } = order;
    const {user} = useUserContext();
    const isSeller = user?.id === sellerId;
    const amount = isSeller ? price * quantity : totalAmount;
    const imageSrc = gigCoverImage || '/images/placeholder.png';
    const formattedDate = dateOrdered
        ? new Date(dateOrdered).toLocaleDateString()
        : '—';

    // Calculate if the order is late
    const isLate = expectedDeliveryDate ? new Date(expectedDeliveryDate) < new Date() : false;
    // const isLate = true;

    // Inline variant - single line
    if (variant === 'inline') {
        return (
            <div
                className={clsx(
                    'flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
                    className
                )}
            >
                {/* Small Image */}
                <div className="relative w-12 aspect-[16/9] rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={imageSrc}
                        alt={gigTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                    />
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {gigTitle}
                    </h3>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Avatar src={sellerPicture} username={sellerUsername} size={18}/>
                    <span className="text-xs text-gray-600">{sellerUsername}</span>
                </div>

                {/* Status Badge */}
                <span className={clsx(
                    `px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 order-status status-${(order.status.toLowerCase().replace('_', '-'))}`
                )}>
                    {status.replace(/_/g, ' ')}
                </span>
                {isLate && (
                    <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                        Late
                    </span>
                )}

                {/* Price */}
                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {formatPrice(amount)}
                </div>

                {/* Action */}
                {actionNode && <div className="flex-shrink-0">{actionNode}</div>}
            </div>
        );
    }

    // Compact variant - smaller version of default
    if (variant === 'compact') {
        return (
            <div
                className={clsx(
                    'flex flex-row gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow',
                    className
                )}
            >
                {/* Image */}
                <div
                    className="rounded-lg relative w-1/3 max-w-[100px] aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={imageSrc}
                        alt={gigTitle}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {gigTitle}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <Avatar src={sellerPicture} username={sellerUsername} size={16}/>
                            <span>{sellerUsername}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-1.5">
                            <Avatar src={buyerPicture} username={buyerUsername} size={16}/>
                            <span>{buyerUsername}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formattedDate}</span>
                        <span className="text-gray-400">•</span>
                        <span
                            className={`inline-flex items-center px-1.5 rounded-full text-xs font-medium order-status status-${(order.status.toLowerCase().replace('_', '-'))}`}>{status.replace(/_/g, ' ')}</span>
                        {isLate && (
                            <span
                                className="inline-flex items-center px-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Late
                            </span>
                        )}
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col justify-between items-end flex-shrink-0">
                    <div className="text-base font-semibold text-gray-900">
                        {formatPrice(amount)}
                    </div>
                    {actionNode && <div>{actionNode}</div>}
                </div>
            </div>
        );
    }

    // Card variant - vertical layout
    if (variant === 'card') {
        return (
            <div
                className={clsx(
                    'flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white',
                    className
                )}
            >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
                    <Image
                        src={imageSrc}
                        alt={gigTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                        className="object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {gigTitle}
                    </h3>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Avatar src={sellerPicture} username={sellerUsername} size={20}/>
                            <span className="text-gray-700">{sellerUsername}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Avatar src={buyerPicture} username={buyerUsername} size={20}/>
                            <span className="text-gray-700">{buyerUsername}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Clock3 className="w-3.5 h-3.5"/>
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold text-gray-800">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium order-status status-${(order.status.toLowerCase().replace('_', '-'))}`}>{status.replace(/_/g, ' ')}</span>
                                {isLate && (
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Late
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(amount)}
                        </div>
                    </div>

                    {actionNode && (
                        <div className="pt-2 border-t border-gray-100">
                            {actionNode}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default variant - original design
    return (
        <div
            className={clsx(
                "flex flex-row gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow bg-white",
                className
            )}
        >
            <div
                className="rounded-lg relative w-1/3 max-w-[200px] aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                    src={imageSrc}
                    alt={gigTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {gigTitle}
                </h2>

                <div className="flex items-center gap-3 text-sm text-gray-700 mt-1">
                    <div className="flex items-center gap-2">
                        <Avatar src={sellerPicture} username={sellerUsername} size={20}/>
                        <span className="font-medium">{sellerUsername}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-2">
                        <Avatar src={buyerPicture} username={buyerUsername} size={20}/>
                        <span className="font-medium">{buyerUsername}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-gray-700 text-sm">
                    <div className="flex items-center gap-1">
                        <Clock3 className="w-4 h-4"/>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium order-status status-${(order.status.toLowerCase().replace('_', '-'))}`}>{status.replace(/_/g, ' ')}</span>
                        {isLate && (
                            <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Late
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Price / Action */}
            <div className="flex flex-col justify-between items-end text-right flex-shrink-0">
                <div className="text-lg font-semibold text-gray-900">
                    {formatPrice(amount)}
                </div>
                {actionNode && <div className="mt-2">{actionNode}</div>}
            </div>
        </div>
    );
}

export default React.memo(OrderComponent);

// Skeleton Components
export function OrderSkeleton({variant = 'default', className}: {
    variant?: OrderRowVariant;
    className?: string;
}) {
    // Inline skeleton
    if (variant === 'inline') {
        return (
            <div
                className={clsx(
                    'flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 animate-pulse',
                    className
                )}
            >
                <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 h-4 bg-gray-200 rounded"/>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-gray-200"/>
                    <div className="w-16 h-3 bg-gray-200 rounded"/>
                </div>
                <div className="w-16 h-5 bg-gray-200 rounded"/>
                <div className="w-20 h-4 bg-gray-200 rounded"/>
            </div>
        );
    }

    // Compact skeleton
    if (variant === 'compact') {
        return (
            <div
                className={clsx(
                    'flex flex-row gap-3 p-3 rounded-lg border border-gray-200 animate-pulse',
                    className
                )}
            >
                <div className="w-20 h-20 rounded bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"/>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"/>
                    <div className="h-3 w-1/3 bg-gray-200 rounded"/>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <div className="h-5 w-16 bg-gray-200 rounded"/>
                </div>
            </div>
        );
    }

    // Card skeleton
    if (variant === 'card') {
        return (
            <div
                className={clsx(
                    'flex flex-col rounded-lg border border-gray-200 overflow-hidden animate-pulse',
                    className
                )}
            >
                <div className="w-full aspect-video bg-gray-200"/>
                <div className="p-4 flex flex-col gap-3">
                    <div className="h-5 w-full bg-gray-200 rounded"/>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-200"/>
                            <div className="w-16 h-4 bg-gray-200 rounded"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-200"/>
                            <div className="w-16 h-4 bg-gray-200 rounded"/>
                        </div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <div className="h-3 w-24 bg-gray-200 rounded"/>
                        <div className="h-5 w-16 bg-gray-200 rounded"/>
                    </div>
                </div>
            </div>
        );
    }

    // Default skeleton
    return (
        <div
            className={clsx(
                'flex flex-row gap-4 p-4 rounded-lg border border-gray-200 animate-pulse',
                className
            )}
        >
            <div className="rounded-lg w-1/3 max-w-[200px] aspect-[16/9] bg-gray-200 flex-shrink-0"/>
            <div className="flex-1 flex flex-col gap-2">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"/>
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200"/>
                        <div className="h-4 w-20 bg-gray-200 rounded"/>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-200"/>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200"/>
                        <div className="h-4 w-20 bg-gray-200 rounded"/>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"/>
                    <div className="h-4 w-20 bg-gray-200 rounded"/>
                </div>
            </div>
            <div className="flex flex-col justify-center items-end flex-shrink-0">
                <div className="h-5 w-24 bg-gray-200 rounded mb-2"/>
                <div className="h-5 w-16 bg-gray-200 rounded"/>
            </div>
        </div>
    );
}
