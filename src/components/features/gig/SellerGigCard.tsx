'use client';

import Image from "next/image";
import {Star, Edit3, Trash2, Power, Clock} from "lucide-react";
import {IGigDocument} from "@/types/gig";
import {useState, useMemo} from "react";
import AlertModal from "@/components/shared/AlertModal";
import {fromSlug, formatPrice} from "@/lib/utils/helper";
import clsx from "clsx";

type SellerGigCardVariant = 'default' | 'compact' | 'inline';

interface SellerGigCardProps {
    gig: IGigDocument;
    variant?: SellerGigCardVariant;
    className?: string;
    onDelete?: (id: string) => void;
    onClick?: () => void;
    onEdit?: () => void;
    onToggleStatus?: (id: string, currentStatus: boolean) => void;
}

export default function SellerGigCard({
                                          gig,
                                          variant = 'default',
                                          className,
                                          onDelete,
                                          onClick,
                                          onEdit,
                                          onToggleStatus,
                                      }: SellerGigCardProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isToggleAlertOpen, setIsToggleAlertOpen] = useState(false);

    const rating = useMemo(() => {
        return gig.ratingSum && gig.ratingsCount ? Number((gig.ratingSum / gig.ratingsCount).toFixed(1)) : 0;
    }, [gig.ratingSum, gig.ratingsCount]);

    const handleDelete = () => setIsDeleteAlertOpen(true);
    const confirmDelete = () => {
        if (gig._id && onDelete) onDelete(gig._id);
        setIsDeleteAlertOpen(false);
    };

    const handleToggleStatus = () => setIsToggleAlertOpen(true);
    const confirmToggleStatus = () => {
        if (gig._id && onToggleStatus) onToggleStatus(gig._id, Boolean(gig.active));
        setIsToggleAlertOpen(false);
    };

    const imageSrc = gig.coverImage ?? '/images/logo-brand.webp';

    // Status badge component
    const StatusBadge = () => {
        if (gig.isDeleted) {
            return (
                <span className={clsx("font-medium text-red-600", variant === 'default' ? 'text-sm' : 'text-xs')}>
                    Deleted
                </span>
            );
        }
        if (gig.active) {
            return (
                <span className={clsx("font-medium text-green-600", variant === 'default' ? 'text-sm' : 'text-xs')}>
                    Active
                </span>
            );
        }
        return (
            <span className={clsx(" font-medium text-gray-500", variant === 'default' ? 'text-sm' : 'text-xs')}>
                Inactive
            </span>
        );
    };

    // Action buttons component
    const ActionButtons = ({compact = false}: { compact?: boolean }) => (
        <div className={clsx(
            "flex gap-1.5",
            !compact && "opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-50 border border-gray-200 rounded-md shadow",
        )}>
            {/* Toggle Status */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus();
                }}
                className={clsx(
                    "p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    compact && "p-1", gig.active ? 'hover:text-gray-900' : 'hover:text-green-600'
                )}
                title={gig.active ? 'Deactivate' : 'Activate'}
            >
                <Power className={compact ? "w-3.5 h-3.5" : "w-4 h-4"}/>
            </button>

            {/* Edit */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                }}
                className={clsx(
                    "p-1.5 hover:bg-gray-100 transition-colors text-gray-600 hover:text-primary-500 cursor-pointer rounded-lg",
                    compact && "p-1"
                )}
                title="Edit"
            >
                <Edit3 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"}/>
            </button>

            {/* Delete */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                }}
                className={clsx(
                    "p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600 cursor-pointer",
                    compact && "p-1"
                )}
                title="Delete"
            >
                <Trash2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"}/>
            </button>
        </div>
    );

    // Inline variant - single line
    if (variant === 'inline') {
        return (
            <>
                <div
                    className={clsx(
                        'flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white',
                        className
                    )}
                    onClick={onClick}
                >
                    {/* Small Image */}
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                            src={imageSrc}
                            alt={gig.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => (e.currentTarget.src = '/images/logo-brand.webp')}
                        />

                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {gig.title}
                        </h3>
                    </div>

                    {/* Category */}
                    <span className="text-xs text-gray-600 flex-shrink-0">
                        {fromSlug(gig.categories)}
                    </span>

                    {/* Rating */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900"/>
                        <span className="text-xs font-semibold text-gray-900">{rating}</span>
                    </div>

                    {/* Status */}
                    <StatusBadge/>

                    {/* Price */}
                    <div className="text-sm font-semibold text-gray-900 flex-shrink-0 min-w-[80px] text-right">
                        {formatPrice(gig.price)}
                    </div>

                    {/* Actions */}
                    <ActionButtons compact/>
                </div>

                {/* Modals */}
                <AlertModal
                    isOpen={isDeleteAlertOpen}
                    onClose={() => setIsDeleteAlertOpen(false)}
                    type="confirm"
                    title="Delete Gig?"
                    description="Are you sure you want to delete this gig? This action cannot be undone."
                    confirmText="Yes, Delete"
                    cancelText="Cancel"
                    showCancel
                    onConfirm={confirmDelete}
                />

                <AlertModal
                    isOpen={isToggleAlertOpen}
                    onClose={() => setIsToggleAlertOpen(false)}
                    type="confirm"
                    title={gig.active ? "Deactivate Gig?" : "Activate Gig?"}
                    description={
                        gig.active
                            ? "This gig will be hidden from buyers and won't appear in search results."
                            : "This gig will be visible to buyers and appear in search results."
                    }
                    confirmText={gig.active ? "Yes, Deactivate" : "Yes, Activate"}
                    cancelText="Cancel"
                    showCancel
                    onConfirm={confirmToggleStatus}
                />
            </>
        );
    }

    // Compact variant
    if (variant === 'compact') {
        return (
            <>
                <div
                    className={clsx(
                        'flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white cursor-pointer group',
                        className
                    )}
                    onClick={onClick}
                >
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                            src={imageSrc}
                            alt={gig.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            
                            onError={(e) => (e.currentTarget.src = '/images/logo-brand.webp')}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {gig.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{fromSlug(gig.categories)}</span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3"/>
                                <span>{gig.expectedDeliveryDays}d</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-gray-900 text-gray-900"/>
                                <span className="text-xs font-semibold text-gray-900">{rating}</span>
                                <span className="text-xs text-gray-500">({gig.ratingsCount || 0})</span>
                            </div>
                            <StatusBadge/>
                        </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-col justify-between items-end flex-shrink-0">
                        <div className="text-base font-bold text-gray-900">
                            {formatPrice(gig.price)}
                        </div>
                        <ActionButtons compact/>
                    </div>
                </div>

                {/* Modals */}
                <AlertModal
                    isOpen={isDeleteAlertOpen}
                    onClose={() => setIsDeleteAlertOpen(false)}
                    type="confirm"
                    title="Delete Gig?"
                    description="Are you sure you want to delete this gig? This action cannot be undone."
                    confirmText="Yes, Delete"
                    cancelText="Cancel"
                    showCancel
                    onConfirm={confirmDelete}
                />

                <AlertModal
                    isOpen={isToggleAlertOpen}
                    onClose={() => setIsToggleAlertOpen(false)}
                    type="confirm"
                    title={gig.active ? "Deactivate Gig?" : "Activate Gig?"}
                    description={
                        gig.active
                            ? "This gig will be hidden from buyers and won't appear in search results."
                            : "This gig will be visible to buyers and appear in search results."
                    }
                    confirmText={gig.active ? "Yes, Deactivate" : "Yes, Activate"}
                    cancelText="Cancel"
                    showCancel
                    onConfirm={confirmToggleStatus}
                />
            </>
        );
    }

    // Default variant - full card
    return (
        <>
            <div
                className={clsx(
                    "relative flex flex-col h-full bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group overflow-hidden cursor-pointer",
                    className
                )}
                onClick={onClick}
            >
                {/* Category Badge - subtle */}
                <div className="absolute top-3 left-3 z-10">
                    <span
                        className="bg-gray-50 backdrop-blur-sm text-gray-800 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200">
                        {fromSlug(gig.categories)}
                    </span>
                </div>

                {/* Action Buttons */}
                <div
                    className="absolute top-3 right-3 z-10 rounded-md">
                    <ActionButtons/>
                </div>

                {/* Cover Image */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 border-b border-gray-200">
                    <Image
                        src={imageSrc}
                        alt={gig.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = '/images/logo-brand.webp')}
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-1">
                    <div className={"mb-3"}>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {gig.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1.5">{gig.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-4 h-4"/>
                            <span>
                                {gig.expectedDeliveryDays} day{gig.expectedDeliveryDays !== 1 ? "s" : ""}
                            </span>
                        </div>
                        {/* Status */}
                        <StatusBadge/>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                            <span className="font-bold text-gray-900">{rating}</span>
                            <span className="text-gray-500">({gig.ratingsCount || 0})</span>
                        </div>

                        <span className="text-lg font-bold text-gray-900">
                                {formatPrice(gig.price)}
                            </span>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertModal
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                type="confirm"
                title="Delete Gig?"
                description="Are you sure you want to delete this gig? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                showCancel
                onConfirm={confirmDelete}
            />

            {/* Toggle Status Confirmation */}
            <AlertModal
                isOpen={isToggleAlertOpen}
                onClose={() => setIsToggleAlertOpen(false)}
                type="confirm"
                title={gig.active ? "Deactivate Gig?" : "Activate Gig?"}
                description={
                    gig.active
                        ? "This gig will be hidden from buyers and won't appear in search results."
                        : "This gig will be visible to buyers and appear in search results."
                }
                confirmText={gig.active ? "Yes, Deactivate" : "Yes, Activate"}
                cancelText="Cancel"
                showCancel
                onConfirm={confirmToggleStatus}
            />
        </>
    );
}

// ================= Skeleton Component =================
export function SellerGigCardSkeleton({
                                          variant = 'default',
                                          className
                                      }: {
    variant?: SellerGigCardVariant;
    className?: string;
}) {
    // Inline skeleton
    if (variant === 'inline') {
        return (
            <div
                className={clsx(
                    'flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 animate-pulse bg-white',
                    className
                )}
            >
                <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 h-4 bg-gray-200 rounded"/>
                <div className="w-16 h-3 bg-gray-200 rounded"/>
                <div className="w-8 h-3 bg-gray-200 rounded"/>
                <div className="w-12 h-3 bg-gray-200 rounded"/>
                <div className="w-20 h-4 bg-gray-200 rounded"/>
                <div className="flex gap-1.5">
                    <div className="w-7 h-7 rounded-md bg-gray-200"/>
                    <div className="w-7 h-7 rounded-md bg-gray-200"/>
                    <div className="w-7 h-7 rounded-md bg-gray-200"/>
                </div>
            </div>
        );
    }

    // Compact skeleton
    if (variant === 'compact') {
        return (
            <div
                className={clsx(
                    'flex gap-3 p-3 rounded-lg border border-gray-200 animate-pulse bg-white',
                    className
                )}
            >
                <div className="w-24 h-24 rounded bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-full bg-gray-200 rounded"/>
                    <div className="h-3 w-2/3 bg-gray-200 rounded"/>
                    <div className="flex justify-between mt-auto">
                        <div className="h-3 w-16 bg-gray-200 rounded"/>
                        <div className="h-3 w-12 bg-gray-200 rounded"/>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <div className="h-5 w-16 bg-gray-200 rounded"/>
                    <div className="flex gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-gray-200"/>
                        <div className="w-6 h-6 rounded-md bg-gray-200"/>
                        <div className="w-6 h-6 rounded-md bg-gray-200"/>
                    </div>
                </div>
            </div>
        );
    }

    // Default skeleton
    return (
        <div
            className={clsx(
                'flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse',
                className
            )}
        >
            <div className="relative w-full aspect-[16/9] bg-gray-200"/>
            <div className="p-4 flex flex-col gap-2.5">
                <div className="h-5 w-full bg-gray-200 rounded"/>
                <div className="h-4 w-3/4 bg-gray-200 rounded"/>
                <div className="space-y-2 mt-auto">
                    <div className="h-4 w-24 bg-gray-200 rounded"/>
                    <div className="flex justify-between pt-2">
                        <div className="h-4 w-16 bg-gray-200 rounded"/>
                        <div className="h-3 w-12 bg-gray-200 rounded"/>
                    </div>
                    <div className="flex justify-between pt-1">
                        <div className="h-4 w-20 bg-gray-200 rounded"/>
                        <div className="h-5 w-16 bg-gray-200 rounded"/>
                    </div>
                </div>
            </div>
        </div>
    );
}