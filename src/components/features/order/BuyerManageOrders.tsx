'use client';

import React, {useRef, useCallback, useEffect, useMemo} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import clsx from 'clsx';
import Link from 'next/link';
import {ExternalLink, Eye} from 'lucide-react';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';

import OrderTable from '@/components/features/order/OrderTable'; // Assuming this is a client component
import DropdownInput from '@/components/shared/DropdownInput';
import {useSearchOrders} from '@/lib/hooks/useSearchOrders'; // Assuming this is a client hook
import {IOrderDocument} from '@/types/order';
import {OrderStatus} from "@/lib/constants/constant";
import AlertModal from "@/components/shared/AlertModal";
import {cancelOrderDirect} from "@/lib/services/client/order.client";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useUserContext} from "@/context/UserContext";

const ORDER_STATUS_OPTIONS = [
    {label: 'Request action', tab: 'priority', query: {priority: true}},
    {label: 'In progress', tab: 'in_progress', query: {status: ['IN_PROGRESS']}},
    {label: 'Late', tab: 'late', query: {status: ['IN_PROGRESS'], late: true}},
    {label: 'Pending', tab: 'pending', query: {status: ['PENDING', 'ACTIVE']}},
    {label: 'Completed', tab: 'completed', query: {status: ['COMPLETED']}},
    {label: 'Cancelled', tab: 'cancelled', query: {status: ['CANCELLED']}},
]

interface ManageOrdersClientProps {
    initialData?: { orders: Required<IOrderDocument>[], total: number };
    initialPage: number;
    initialTab: string;
}

export default function BuyerManageOrders({
                                              initialData,
                                              initialPage,
                                              initialTab,
                                          }: ManageOrdersClientProps) {
    // The buyerId is now passed as a prop from the SSR component
    // If it's undefined, the SSR component didn't find a user or it's not applicable
    const {user} = useUserContext(); // No longer needed here
    const buyerId = user?.id; // No longer derived here

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // === DÙNG HOOK useSearchOrders ===
    // Initialize with data from props for a smoother transition
    const {orders, total, loading, search} = useSearchOrders({
        initialData: initialData,
        // No need to pass initial page/status here, as `search` will be called in useEffect
    });

    // === URL là source of truth (still) ===
    const currentPage = Number(searchParams.get('page')) || initialPage;
    const currentTab = searchParams.get('tab') || 'priority';

    const [isToggleAlertOpen, setToggleAlertOpen] = React.useState(false);
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | undefined>(undefined);

    const {mutate: cancelOrder, loading: cancelLoading} = useFetchMutation(
        cancelOrderDirect,
        {
            successMessage: "Order cancelled successfully.",
            onSuccess: () => {
                const option = ORDER_STATUS_OPTIONS.find((o) => o.tab === currentTab) || ORDER_STATUS_OPTIONS[0];
                const query = option.query.status ? {
                    ...option.query,
                    status: JSON.stringify(option.query.status)
                } : option.query;
                search({
                    buyerId,
                    ...query,
                    page: currentPage,
                    limit: 4,
                });
            },
        }
    );

    const handleCancelClick = (id: string) => {
        setSelectedOrderId(id);
        console.log(id);
        setToggleAlertOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (selectedOrderId)
            await cancelOrder(selectedOrderId);
        setToggleAlertOpen(false);
    };

    // === NGĂN FETCH DƯ THỪA ===
    const prevFetchRef = useRef<{ tab: string; page: number } | null>(null);

    // === TỰ ĐỘNG LOAD LẦN ĐẦU + KHI URL THAY ĐỔI ===
    useEffect(() => {
        if (!buyerId) return;

        const shouldFetch =
            !prevFetchRef.current ||
            prevFetchRef.current.tab !== currentTab ||
            prevFetchRef.current.page !== currentPage;

        if (shouldFetch) {
            prevFetchRef.current = {tab: currentTab, page: currentPage};

            const option = ORDER_STATUS_OPTIONS.find((o) => o.tab === currentTab) || ORDER_STATUS_OPTIONS[0];
            const query = option.query.status ? {
                ...option.query,
                status: JSON.stringify(option.query.status)
            } : option.query;

            search({
                buyerId,
                ...query,
                page: currentPage,
                limit: 4,
            });
        }
    }, [currentTab, currentPage, buyerId, search]);

    // === TỰ CẬP NHẬT URL ===
    const updateURL = useCallback(
        (tab: string, page: number = 1) => {
            const params = new URLSearchParams(searchParams);
            if (tab === 'all') {
                params.delete('tab');
            } else {
                params.set('tab', tab);
            }
            if (page > 1) {
                params.set('page', page.toString());
            } else {
                params.delete('page');
            }
            router.replace(`${pathname}?${params.toString()}`, {scroll: false});
        },
        [searchParams, pathname, router]
    );

    // === KHI CLICK TAB ===
    const handleTabChange = useDebouncedCallback(
        (tab: string) => {
            updateURL(tab, 1);
        },
        150
    );

    // === KHI ĐỔI TRANG ===
    const handlePageChange = useCallback(
        (page: number) => {
            if (page === currentPage || loading) return;
            updateURL(currentTab, page);
        },
        [currentTab, currentPage, loading, updateURL]
    );

    // === SCROLL KHI ĐỔI TRANG ===
    useEffect(() => {
        containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, [currentPage]);

    // === SOURCE QUAY LẠI ===
    const returnSource = useMemo(() => {
        return encodeURIComponent(`${pathname}?${searchParams.toString()}`);
    }, [pathname, searchParams]);

    // === ACTION BUTTONS ===
    const ActionButtons = useCallback(
        ({order}: { order: IOrderDocument }) => (
            <div className="flex gap-1 text-sm">
                {/*<Link*/}
                {/*    href={`/users/${buyerId}/orders/${order._id}/detail?source=${returnSource}`}*/}
                {/*    className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"*/}
                {/*    title="View"*/}
                {/*    prefetch={false}*/}
                {/*>*/}
                {/*    <Eye size={16}/> View*/}
                {/*</Link>*/}

                {[
                    OrderStatus.PENDING,
                    OrderStatus.ACTIVE,
                ].includes(order.status) && (
                    <button
                        onClick={() => handleCancelClick(order._id)}
                        rel="noopener noreferrer"
                        className="cursor-pointer flex items-center gap-1 p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Cancel"
                    >
                        Cancel
                    </button>
                )}

                {order.status === OrderStatus.PENDING && (
                    <Link
                        href={`/checkout/${order._id}/${order.gigId}?source=${returnSource}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors"
                        title="Payment"
                    >
                        <ExternalLink size={16}/> Payment
                    </Link>
                )}

                {order.status === OrderStatus.ACTIVE && (
                    <Link
                        href={`/orders/${order._id}/requirements/answer?source=${returnSource}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 p-1.5 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                        title="Add requirements"
                    >
                        <ExternalLink size={16}/> Add requirements
                    </Link>
                )}

                {[
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCEL_PENDING,
                ].includes(order.status) && (
                    <Link
                        href={`/orders/${order._id}?source=${returnSource}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 p-1.5 hover:bg-primary-50 rounded text-primary-600 transition-colors"
                        title="Activities"
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
        [buyerId, returnSource]
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
    if (!buyerId) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-lg font-semibold text-gray-900">
                    Please log in to view your orders.
                </p>
            </div>
        );
    }

    return (
        <div>
            <LoadingWrapper isLoading={cancelLoading} fullScreen/>
            <div ref={containerRef} className="container mx-auto px-6 pt-8 pb-16">
                {/* === HEADER === */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">My orders</h2>
                </div>

                {/* === LOADING & COUNT === */}
                <div className="flex justify-between items-end mb-4">
                    <div className={"text-sm text-gray-600"}>
                        {loading ? 'Loading...' : `${total.toLocaleString()} order${total !== 1 ? 's' : ''}`}
                    </div>


                    {/* === TAB BAR (LARGE SCREENS) === */}
                    <div className="hidden lg:block">
                        <ul
                            className={clsx(
                                'flex flex-wrap gap-4 font-semibold text-gray-500',
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
                    <div className="lg:hidden w-full max-w-[180px]">
                        <DropdownInput
                            options={dropdownOptions}
                            value={currentDropdownValue}
                            onChange={handleDropdownChange}
                            placeholder="Select Order Status"
                            className={'text-sm py-2!'}/>
                    </div>
                </div>

                {/* === ORDER TABLE === */}
                <OrderTable
                    key={`${currentTab}-${currentPage}`}
                    variant="default" // Default variant for BuyerManageOrders
                    enableResponsiveVariant={true}
                    orders={orders}
                    isLoading={loading}
                    totalCount={total}
                    currentPage={currentPage}
                    pageSize={4}
                    onPageChange={handlePageChange}
                    actionRenderer={(order) => <ActionButtons order={order}/>}/>

                <AlertModal
                    isOpen={isToggleAlertOpen}
                    onClose={() => {
                        setToggleAlertOpen(false);
                        setSelectedOrderId(undefined);
                    }}
                    type="confirm"
                    title="Cancel Order?"
                    description="Are you sure you want to cancel this order? This action cannot be undone."
                    confirmText="Yes, Cancel Order"
                    cancelText="No, Keep Order"
                    showCancel
                    onConfirm={handleConfirmCancel}/>
            </div>
        </div>
    );
}
