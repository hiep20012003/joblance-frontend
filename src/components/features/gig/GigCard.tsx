'use client';

import React, {useMemo} from "react";
import Image from "next/image";
import Link from "next/link";
import {Star, Clock3} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import {IGigDocument} from "@/types/gig";
import {encodeUUID} from "@/lib/utils/uuid";
import {formatPrice, toSlug} from "@/lib/utils/helper";
import clsx from "clsx";

type GigCardVariant = 'default' | 'compact' | 'inline' | 'card';

type GigCardProps = Required<IGigDocument> & {
    variant?: GigCardVariant;
    className?: string;
    actionNode?: React.ReactNode;
};

function GigComponent({
                          _id,
                          title,
                          description,
                          coverImage,
                          username,
                          profilePicture,
                          sellerId,
                          ratingSum,
                          ratingsCount,
                          price,
                          expectedDeliveryDays,
                          variant = 'default',
                          className,
                          actionNode,
                      }: GigCardProps) {
    const gigUrl = useMemo(() => `/${username}/${toSlug(title)}-${encodeUUID(_id)}`, [username, title, _id]);
    const sellerUrl = useMemo(() => `/${username}`, [username]);

    const rating = useMemo(() => {
        return ratingsCount > 0 ? Number((ratingSum / ratingsCount).toFixed(1)) : 0;
    }, [ratingSum, ratingsCount]);

    const imageSrc = useMemo(() => coverImage || "/images/placeholder.png", [coverImage]);

    // Inline variant - single line
    if (variant === 'inline') {
        return (
            <div
                className={clsx(
                    'flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
                    className
                )}
            >
                <Link
                    href={gigUrl}
                    className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0"
                >
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/images/logo-brand.webp";
                        }}
                        sizes="48px"
                        priority={false}
                        loading="lazy"
                    />
                </Link>

                <Link
                    href={gigUrl}
                    className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate hover:underline"
                >
                    {title}
                </Link>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Avatar src={profilePicture} username={username} size={16}/>
                    <Link href={sellerUrl} className="text-xs text-gray-600 hover:underline">
                        {username}
                    </Link>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900"/>
                    <span className="text-xs font-medium text-gray-900">{rating}</span>
                </div>

                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {formatPrice(price)}
                </span>

                {actionNode && <div className="flex-shrink-0">{actionNode}</div>}
            </div>
        );
    }

    // Compact variant - smaller horizontal card
    if (variant === 'compact') {
        return (
            <div
                className={clsx("flex gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow bg-white", className)}>
                <Link
                    href={gigUrl}
                    className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 flex-shrink-0"
                >
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = "/images/logo-brand.webp";
                        }}
                        sizes="96px"
                        priority={false}
                        loading="lazy"
                    />
                </Link>

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <Link
                        href={gigUrl}
                        className="text-sm font-semibold text-gray-900 line-clamp-2 hover:underline"
                    >
                        {title}
                    </Link>

                    <div className="flex items-center gap-2 text-xs">
                        <Avatar src={profilePicture} username={username} size={16}/>
                        <Link href={sellerUrl} className="text-gray-700 hover:underline">
                            {username}
                        </Link>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gray-900 text-gray-900"/>
                            <span className="text-xs font-semibold text-gray-900">{rating}</span>
                            <span className="text-xs text-gray-500">({ratingsCount})</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {formatPrice(price)}
                        </span>
                    </div>
                </div>

                {actionNode && <div className="flex items-center flex-shrink-0">{actionNode}</div>}
            </div>
        );
    }

    // Card variant - full card with more details
    if (variant === 'card') {
        return (
            <div
                className={clsx("flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white", className)}>
                <Link
                    href={gigUrl}
                    className="relative w-full aspect-video overflow-hidden bg-gray-100"
                >
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = "/images/logo-brand.webp";
                        }}
                        priority={false}
                        loading="lazy"
                    />
                </Link>

                <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className={"flex-1 mb-2"}>
                        <Link
                            href={gigUrl}
                            className="text-base font-semibold text-gray-900 line-clamp-2 hover:underline leading-tight"
                        >
                            {title}
                        </Link>
                        {description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">{description}</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar src={profilePicture} username={username} size={20}/>
                            <Link
                                href={sellerUrl}
                                className="text-sm text-gray-700 font-medium hover:underline"
                            >
                                {username}
                            </Link>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock3 className="w-4 h-4"/>
                            <span>{expectedDeliveryDays}d</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                            <span className="font-semibold text-gray-900">{rating}</span>
                            <span className="text-gray-500 text-sm">({ratingsCount})</span>
                        </div>
                        <span className="text-base font-bold text-gray-900">
                            {formatPrice(price)}
                        </span>
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

    // Default variant - Fiverr style vertical card
    return (
        <div className={clsx("flex flex-col gap-2 h-full bg-transparent rounded-lg overflow-hidden", className)}>
            <Link
                prefetch
                target={"_blank"}
                href={gigUrl}
                className="peer/image rounded-lg relative w-full aspect-[16/9] overflow-hidden bg-gray-100"
            >
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover peer-hover/image:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.currentTarget.src = "/images/logo-brand.webp";
                    }}
                    priority={false}
                    loading="lazy"
                />
            </Link>

            <div className="flex items-center gap-2 -mb-2">
                <Avatar src={profilePicture} username={username} size={24}/>
                <Link
                    href={sellerUrl}
                    className="text-sm font-semibold text-gray-900 hover:underline"
                >
                    {username}
                </Link>
            </div>

            <Link
                prefetch
                target={"_blank"}
                href={gigUrl}
                className="self-start order-last peer/price mt-auto text-base font-bold text-gray-900"
            >
                From {formatPrice(price)}
            </Link>

            <Link
                href={gigUrl}
                prefetch
                target={"_blank"}
                className="self-start flex-1 text-base text-gray-800 line-clamp-2 leading-normal tracking-wide hover:underline peer-hover/price:underline peer-hover/image:underline transition-colors"
            >
                {title}
            </Link>

            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                <span className="font-bold text-gray-900">{rating}</span>
                <span className="text-gray-500">({ratingsCount})</span>
            </div>

            {actionNode && <div className="mt-2">{actionNode}</div>}
        </div>
    );
}

export default React.memo(GigComponent);

// ================= Skeleton Components =================
export function GigSkeleton({
                                variant = 'default',
                                className
                            }: {
    variant?: GigCardVariant;
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
            <div className={clsx("flex gap-3 p-3 rounded-lg border border-gray-200 animate-pulse bg-white", className)}>
                <div className="w-24 h-24 rounded bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-full bg-gray-200 rounded"/>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-200"/>
                        <div className="h-3 w-16 bg-gray-200 rounded"/>
                    </div>
                    <div className="flex justify-between mt-auto">
                        <div className="h-3 w-8 bg-gray-200 rounded"/>
                        <div className="h-4 w-16 bg-gray-200 rounded"/>
                    </div>
                </div>
            </div>
        );
    }

    // Card skeleton
    if (variant === 'card') {
        return (
            <div
                className={clsx("flex flex-col rounded-lg border border-gray-200 overflow-hidden animate-pulse bg-white", className)}>
                <div className="w-full aspect-video bg-gray-200"/>
                <div className="p-4 flex flex-col gap-3">
                    <div className="h-5 w-full bg-gray-200 rounded"/>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"/>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-200"/>
                            <div className="h-4 w-20 bg-gray-200 rounded"/>
                        </div>
                        <div className="h-4 w-10 bg-gray-200 rounded"/>
                    </div>
                    <div className="flex justify-between pt-2">
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
            className={clsx("flex flex-col gap-2 h-full bg-transparent rounded-lg overflow-hidden animate-pulse", className)}>
            <div className="rounded-lg w-full aspect-[16/9] bg-gray-200"/>
            <div className="flex items-center gap-2 -mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200"/>
                <div className="h-4 w-20 bg-gray-200 rounded"/>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded order-last mt-auto"/>
            <div className="h-5 w-3/4 bg-gray-200 rounded"/>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"/>
                <div className="h-4 w-6 bg-gray-200 rounded"/>
                <div className="h-4 w-8 bg-gray-200 rounded"/>
            </div>
        </div>
    );
}