'use client';

import React, {useMemo} from 'react';
import Image from 'next/image';
import {Clock3, Star} from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import {IGigDocument} from '@/types/gig';
import clsx from "clsx";
import {formatPrice} from "@/lib/utils/helper";

type GigRowVariant = 'default' | 'compact' | 'inline' | 'card';

type GigRowProps = Required<IGigDocument> & {
    className?: string;
    actionNode?: React.ReactNode;
    variant?: GigRowVariant;
};

function GigRowComponent({
                             className,
                             actionNode,
                             variant = 'default',
                             _id,
                             title,
                             description,
                             basicTitle,
                             coverImage,
                             username,
                             profilePicture,
                             sellerId,
                             ratingSum,
                             expectedDeliveryDays,
                             ratingsCount,
                             price,
                         }: GigRowProps) {
    const rating = useMemo(() => {
        return ratingsCount > 0 ? Number((ratingSum / ratingsCount).toFixed(1)) : 0;
    }, [ratingSum, ratingsCount]);

    const imageSrc = coverImage || '/images/placeholder.png';

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
                <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                    />
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                        {title}
                    </h3>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Avatar src={profilePicture} username={username} size={16}/>
                    <span className="text-xs text-gray-600">{username}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/>
                    <span className="text-xs font-medium text-gray-900">{rating}</span>
                </div>

                {/* Price */}
                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {formatPrice(price)}
                </div>

                {/* Action */}
                {actionNode && <div className="flex-shrink-0">{actionNode}</div>}
            </div>
        );
    }

    // Compact variant - smaller version
    if (variant === 'compact') {
        return (
            <div
                className={clsx(
                    'flex flex-row gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow',
                    className
                )}
            >
                {/* Image */}
                <div className="rounded relative w-20 h-20 overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium truncate">{basicTitle}</span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                            <Clock3 className="w-3 h-3"/>
                            <span>{expectedDeliveryDays}d</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <Avatar src={profilePicture} username={username} size={16}/>
                            <span className="text-gray-700">{username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                            <span className="font-semibold text-gray-900">{rating}</span>
                        </div>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col justify-between items-end flex-shrink-0">
                    <div className="text-base font-semibold text-gray-900">
                        {formatPrice(price)}
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
                        alt={title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{basicTitle}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Avatar src={profilePicture} username={username} size={20}/>
                            <span className="text-gray-700 font-medium">{username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>
                            <span className="font-semibold text-gray-900">{rating}</span>
                            <span className="text-gray-500">({ratingsCount})</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock3 className="w-4 h-4"/>
                            <span>{expectedDeliveryDays} days</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(price)}
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
            {/* Cover Image */}
            <div
                className="rounded-lg relative w-1/3 max-w-[200px] aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/logo-brand.webp';
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{title}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-gray-700 text-sm mt-2">
                        <span className="font-semibold">{basicTitle}</span>
                        <div className="flex items-center gap-1">
                            <Clock3 className="h-4 w-4" strokeWidth={2}/>
                            <span>{expectedDeliveryDays} day delivery</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center mt-2 gap-4">
                    <div className="flex justify-center items-center gap-2">
                        <Avatar src={profilePicture} username={username} size={20}/>
                        <span className="font-semibold text-gray-900">
                            {username}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-900 font-bold">
                        <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                        <span>{rating}</span>
                    </div>
                </div>
            </div>

            {actionNode && (
                <div className="flex items-center justify-center flex-shrink-0">
                    {actionNode}
                </div>
            )}
        </div>
    );
}

export default React.memo(GigRowComponent);

// ================= Skeleton Components =================
export function GigRowSkeleton({
                                   variant = 'default',
                                   className
                               }: {
    variant?: GigRowVariant;
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
                <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-gray-200"/>
                    <div className="w-6 h-3 bg-gray-200 rounded"/>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"/>
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gray-200"/>
                            <div className="w-16 h-3 bg-gray-200 rounded"/>
                        </div>
                        <div className="w-8 h-3 bg-gray-200 rounded"/>
                    </div>
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
                    <div>
                        <div className="h-5 w-full bg-gray-200 rounded mb-1"/>
                        <div className="h-4 w-2/3 bg-gray-200 rounded"/>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-200"/>
                            <div className="w-20 h-4 bg-gray-200 rounded"/>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-gray-200"/>
                            <div className="w-8 h-4 bg-gray-200 rounded"/>
                        </div>
                    </div>
                    <div className="flex justify-between pt-3">
                        <div className="h-4 w-20 bg-gray-200 rounded"/>
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
                "flex flex-row gap-4 p-4 rounded-lg border border-gray-200 animate-pulse",
                className
            )}
        >
            {/* Cover Image Skeleton */}
            <div className="rounded-lg w-1/3 max-w-[200px] aspect-[16/9] bg-gray-200 flex-shrink-0"/>

            {/* Content Skeleton */}
            <div className="flex-1 flex flex-col gap-2">
                {/* Title + Basic Info */}
                <div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"/>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"/>
                        <div className="flex items-center gap-1">
                            <div className="h-4 w-4 bg-gray-200 rounded-full"/>
                            <div className="h-4 w-28 bg-gray-200 rounded"/>
                        </div>
                    </div>
                </div>

                {/* Seller + Rating */}
                <div className="flex items-center mt-2 gap-4">
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200"/>
                        <div className="h-4 w-24 bg-gray-200 rounded"/>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"/>
                        <div className="h-4 w-6 bg-gray-200 rounded"/>
                    </div>
                </div>
            </div>

            {/* Action Node Skeleton */}
            <div className="flex flex-col justify-center items-end flex-shrink-0">
                <div className="h-5 w-20 bg-gray-200 rounded"/>
            </div>
        </div>
    );
}