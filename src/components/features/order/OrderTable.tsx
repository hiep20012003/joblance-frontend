'use client';

import React, {useState, useEffect} from 'react';
import clsx from 'clsx';
import {IOrderDocument} from '@/types/order';
import OrderItem, {OrderSkeleton} from "@/components/features/order/OrderItem";
import Pagination from "@/components/shared/Pagination";

type OrderRowVariant = 'default' | 'compact' | 'inline' | 'card';

type OrderTableProps = {
    orders?: IOrderDocument[];
    isLoading?: boolean;
    className?: string;
    variant?: OrderRowVariant;
    actionRenderer?: (order: IOrderDocument) => React.ReactNode;
    // Pagination props
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    enableResponsiveVariant?: boolean; // New prop to enable/disable responsive behavior
};

export default function OrderTable({
                                       orders = [],
                                       isLoading = false,
                                       className,
                                       variant = 'default',
                                       actionRenderer,
                                       totalCount = 0,
                                       currentPage = 1,
                                       pageSize = 10,
                                       onPageChange,
                                       enableResponsiveVariant = false, // Default to false
                                   }: OrderTableProps) {
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getResponsiveVariant = (currentWidth: number): OrderRowVariant => {
        if (currentWidth < 640) { // Tailwind's 'sm' breakpoint is 640px
            return 'card';
        }
        if (currentWidth < 768) { // Tailwind's 'md' breakpoint is 768px
            return 'compact';
        }
        return variant; // Use the provided variant for larger screens
    };

    const currentVariant = enableResponsiveVariant ? getResponsiveVariant(screenWidth) : variant;

    const hasOrders = !isLoading && orders.length > 0;
    const isEmpty = !isLoading && orders.length === 0;

    return (
        <div className={clsx('flex flex-col gap-3', className)}>
            {/* Table Content */}
            <div className="flex flex-col gap-4">
                {/* Loading State */}
                {isLoading && (
                    <>
                        {Array.from({length: pageSize > 5 ? 5 : pageSize}).map((_, i) => (
                            <OrderSkeleton key={i} variant={currentVariant}/>
                        ))}
                    </>
                )}

                {/* Empty State */}
                {isEmpty && (
                    <div
                        className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <svg
                            className="w-16 h-16 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500">
                            There are no orders to display at this time.
                        </p>
                    </div>
                )}

                {/* Data Rows */}
                {hasOrders && (
                    <>
                        {orders.map((order) => (
                            <OrderItem
                                key={order._id?.toString() || order.invoiceId}
                                order={order}
                                variant={currentVariant}
                                actionNode={actionRenderer ? actionRenderer(order) : null}
                                className="hover:shadow-md transition-shadow"
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Results Info */}
            <p className="text-sm text-gray-600 flex flex-col items-center">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{' '}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} orders
            </p>

            {/* Pagination */}
            {onPageChange && totalCount > pageSize && (
                <Pagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    siblingCount={1}
                />

            )}
        </div>
    );
}

// Export variant for easy access
export type {OrderRowVariant};
