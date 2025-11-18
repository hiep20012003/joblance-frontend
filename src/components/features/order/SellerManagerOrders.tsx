// components/SellerManageOrders.tsx
'use client';

import React, {useRef, useCallback, useEffect, useMemo} from 'react';
import Link from 'next/link';
import {ExternalLink, Eye} from 'lucide-react';
import {useSearchParams, usePathname} from 'next/navigation';
import clsx from 'clsx';

import OrderTable from '@/components/features/order/OrderTable';
import DropdownInput from '@/components/shared/DropdownInput';
import {useSearchOrders} from '@/lib/hooks/useSearchOrders';
import {IOrderDocument} from '@/types/order';
import {OrderStatus} from "@/lib/constants/constant";
import {useUserContext} from "@/context/UserContext";

// === TAB CONFIG ===
const ORDER_STATUS_OPTIONS = [
    {label: 'Priority', tab: 'priority', query: {status: ['IN_PROGRESS', 'CANCEL_PENDING'], priority: true}},
    {label: 'Active', tab: 'active', query: {status: ['ACTIVE']}},
    {label: 'Late', tab: 'late', query: {status: ['IN_PROGRESS'], late: true}},
    {label: 'Delivered', tab: 'delivered', query: {status: ['DELIVERED']}},
    {label: 'Completed', tab: 'completed', query: {status: ['COMPLETED']}},
    {label: 'Cancelled', tab: 'cancelled', query: {status: ['CANCELLED']}},
];

interface SellerManageOrdersProps {
    initialData?: {
        orders: IOrderDocument[];
        total: number;
    };
    disableScrollOnPageChange?: boolean;
}

export default function SellerManageOrders({initialData, disableScrollOnPageChange}: SellerManageOrdersProps) {
    const {orders, total, loading, search} = useSearchOrders({initialData});
    const {user} = useUserContext();
    const sellerId = user?.id;

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    // === URL là source of truth ===
    const currentTab = searchParams.get('tab') || 'priority';
    const currentPage = Number(searchParams.get('page')) || 1;

    // === NGĂN FETCH DƯ THỪA ===
    const prevFetchRef = useRef<{ tab: string; page: number } | null>(null);

    // === TỰ ĐỘNG LOAD LẦN ĐẦU + KHI URL THAY ĐỔI ===
    useEffect(() => {
        if (!sellerId) return;

        const shouldFetch =
            !prevFetchRef.current ||
            prevFetchRef.current.tab !== currentTab ||
            prevFetchRef.current.page !== currentPage;

        if (shouldFetch) {
            prevFetchRef.current = {tab: currentTab, page: currentPage};

            const option = ORDER_STATUS_OPTIONS.find((o) => o.tab === currentTab) || ORDER_STATUS_OPTIONS[0];
            const query = {
                ...option.query,
                status: JSON.stringify(option.query.status),
            };


            search({
                sellerId,
                ...query,
                page: currentPage,
                limit: 4,
            });
        }
    }, [currentTab, currentPage, sellerId, search]);

    // === TỰ CẬP NHẬT URL ===
    const updateURL = useCallback(
        (tab: string, page: number = 1) => {
            const params = new URLSearchParams(searchParams);
            if (tab === 'priority') {
                params.delete('tab');
            } else {
                params.set('tab', tab);
            }
            if (page > 1) {
                params.set('page', page.toString());
            } else {
                params.delete('page');
            }
            const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            window.history.replaceState(null, '', newURL);
        },
        [searchParams, pathname]
    );

    // === KHI CLICK TAB ===
    const handleTabChange = useCallback(
        (tab: string) => {
            updateURL(tab, 1);
            // search() sẽ được gọi tự động qua useEffect
        },
        [updateURL]
    );

    // === KHI ĐỔI TRANG ===
    const handlePageChange = useCallback(
        (page: number) => {
            if (page === currentPage || loading) return;
            updateURL(currentTab, page);
            // search() sẽ được gọi tự động qua useEffect
        },
        [currentTab, currentPage, loading, updateURL]
    );

    // === SCROLL KHI ĐỔI TRANG ===
    useEffect(() => {
        if (disableScrollOnPageChange) return;
        containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, [currentPage, disableScrollOnPageChange]);

    // === SOURCE QUAY LẠI ===
    const returnSource = useMemo(() => {
        return encodeURIComponent(`/seller/orders?${searchParams.toString()}`);
    }, [searchParams]);

    // === ACTION BUTTONS ===
    const ActionButtons = useCallback(
        ({order}: { order: IOrderDocument }) => (
            <div className="flex gap-1 text-sm">
                {/*<Link*/}
                {/*    href={`/users/${user?.username}/orders/${order._id}/detail?source=${returnSource}`}*/}
                {/*    className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"*/}
                {/*>*/}
                {/*    <Eye size={16}/> View*/}
                {/*</Link>*/}

                {[
                    OrderStatus.PENDING,
                    OrderStatus.ACTIVE,
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCEL_PENDING,
                ].includes(order.status) && (
                    <Link
                        href={`/orders/${order._id}?source=${returnSource}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 p-1.5 hover:bg-primary-50 rounded text-primary-600 transition-colors"
                    >
                        <ExternalLink size={16}/> Activities
                    </Link>
                )}

                {![
                    OrderStatus.PENDING,
                    OrderStatus.ACTIVE,
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCEL_PENDING,
                ].includes(order.status) && (
                    <Link
                        href={`/orders/${order._id}?source=${returnSource}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                        title="View order details"
                    >
                        <ExternalLink size={16}/> View
                    </Link>
                )}
            </div>
        ),
        [user?.username, returnSource]
    );

    // === DROPDOWN OPTIONS ===
    const dropdownOptions = useMemo(() => {
        return ORDER_STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: option.tab,
        }));
    }, []);

    const currentDropdownValue = useMemo(() => {
        const selectedOption = ORDER_STATUS_OPTIONS.find((o) => o.tab === currentTab);
        return selectedOption ? {label: selectedOption.label, value: selectedOption.tab} : null;
    }, [currentTab]);

    const handleDropdownChange = useCallback(
        (option: { label: string; value: string }) => {
            const selectedTabOption = ORDER_STATUS_OPTIONS.find((o) => o.tab === option.value);
            if (selectedTabOption) {
                handleTabChange(selectedTabOption.tab);
            }
        },
        [handleTabChange]
    );


    // === NOT LOGGED IN ===
    if (!user?.id) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-semibold">Please log in to manage your orders.</p>
            </div>
        );
    }


    return (
        <div ref={containerRef} className="container mx-auto px-6 py-6">
            {/* === TAB BAR (LARGE SCREENS) === */}
            <div className="mb-6 hidden md:block">
                <ul
                    className={clsx(
                        'flex flex-wrap gap-6 font-semibold text-gray-500',
                        '[&>*]:py-1 [&>*]:transition-all [&>*]:duration-200',
                        '[&>*]:border-b-2 [&>*]:border-transparent',
                        '[&>.active]:border-primary-500 [&>.active]:text-primary-500'
                    )}
                >
                    {ORDER_STATUS_OPTIONS.map((option) => {
                        const isActive = option.tab === currentTab;
                        return (
                            <li
                                key={option.tab}
                                onClick={() => handleTabChange(option.tab)}
                                className={clsx(
                                    'cursor-pointer text-sm tracking-wide uppercase px-1',
                                    isActive ? 'active' : 'hover:text-primary-500'
                                )}
                            >
                                {option.label}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* === DROPDOWN (SMALL SCREENS) === */}
            <div className={'flex justify-start'}>
                <div className="mb-4 md:hidden max-w-[120px]">
                    <DropdownInput
                        options={dropdownOptions}
                        value={currentDropdownValue}
                        onChange={handleDropdownChange}
                        placeholder="Select Order Status"
                        className={'text-sm py-2!'}
                    />
                </div>
            </div>

            {/* === BẢNG ĐƠN HÀNG === */}
            <OrderTable
                variant="compact" // Default variant for SellerManagerOrders
                enableResponsiveVariant={true}
                orders={orders}
                isLoading={loading}
                totalCount={total}
                currentPage={currentPage}
                pageSize={4}
                onPageChange={handlePageChange}
                actionRenderer={(order) => <ActionButtons order={order}/>}
            />
        </div>
    );
}
