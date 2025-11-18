'use client'

import clsx from "clsx";
import React, {JSX, useCallback, useEffect, useRef, useState} from "react";
import OrderActivity from "@/components/features/order/OrderActivity"; // Re-add import
import OrderOverview from "@/components/features/order/OrderOverview"; // Re-add import
import OrderSummary from "@/components/features/order/OrderSumary";
import OrderNegotiationBanner from "@/components/features/order/OrderNegotiationBanner";
import {AlertCircle, CheckCircle, Download, Ellipsis, EllipsisVertical, FileText, Package} from "lucide-react";
import {useUserContext} from "@/context/UserContext";
import Modal from "@/components/shared/Modal";
import OrderDeliveryForm from "@/components/features/order/OrderDeliveryForm";
import ExtendDeliveryDateForm from "@/components/features/order/ExtendDeliveryDateForm";
import {NegotiationType, OrderStatus} from "@/lib/constants/constant";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import OrderFinalBanner from "@/components/features/order/OrderFinalBanner";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {INegotiationDocument, IOrderDocument} from "@/types/order";
import OrderMoreActionMenu from "@/components/features/order/OrderMoreActionMenu";
import ContactForm from "@/components/features/chat/ContactForm";
import {ISellerDocument} from "@/types/seller";
import {IBuyerDocument} from "@/types/buyer";
import {useOrder} from "@/components/features/order/OrderContext";

// --- Time Calculation Types ---
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLate: boolean;
    isPaused: boolean;
    pausedDifference?: number;
}

// Helper function to get display names for negotiation types (moved to OrderNegotiationBanner or passed as prop)
const getNegotiationDisplayName = (type: NegotiationType) => {
    switch (type) {
        case NegotiationType.EXTEND_DELIVERY:
            return "Delivery Extension Request";
        case NegotiationType.MODIFY_ORDER:
            return "Order Modification Request";
        case NegotiationType.CANCEL_ORDER:
            return "Order Cancellation Request";
        default:
            return "Pending Negotiation";
    }
};

export default function OrderWorkspace() {
    const router = useRouter();
    const {setMode} = useUserContext();
    const {isSeller, order, seller, buyer} = useOrder();

    useEffect(() => {
        if (isSeller) {
            setMode('seller')
        } else setMode('buyer')
    }, [isSeller, setMode]);


    const [currentTab, setCurrentTab] = useState('activity'); // Default to 'activity'
    const [openMenu, setOpenMenu] = useState(false); // Default to 'activity'

    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
    const [isExtendDeliveryModalOpen, setIsExtendDeliveryModalOpen] = useState(false);

    const [contactMessage, setContactMessage] = useState('');
    const [contactFiles, setContactFiles] = useState<File[]>([]);

    const moreBtnRef = useRef<HTMLButtonElement>(null);

    // Helper function to convert milliseconds to days/hours/minutes/seconds
    const msToTime = (ms: number) => ({
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
        hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((ms / 1000 / 60) % 60),
        seconds: Math.floor((ms / 1000) % 60),
    });

    const calculateTimeLeft = useCallback((): TimeLeft => {
        if (!order.dueDate) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isLate: false,
                isPaused: false,
                pausedDifference: undefined,
            };
        }
        let differenceMs: number;
        let isLate = false;
        let isPaused = false;
        let pausedDifference: number | undefined = undefined;

        // Determine if the timer should be paused
        // It's paused if there's an active negotiation OR if timeRemainingBeforePause is set (meaning delivery was paused)
        if (order.negotiation || (order.timeRemainingBeforePause !== null && order.timeRemainingBeforePause !== undefined)) {
            isPaused = true;
            // If paused, use the stored time remaining before pause
            if (order.timeRemainingBeforePause !== null && order.timeRemainingBeforePause !== undefined) {
                differenceMs = order.timeRemainingBeforePause * 60 * 1000; // Convert minutes to milliseconds
            } else {
                // Fallback: if negotiation exists but timeRemainingBeforePause is not set, calculate from dueDate
                const targetDate = +new Date(order.dueDate);
                const now = +new Date();
                differenceMs = targetDate - now;
            }
            pausedDifference = differenceMs; // Store the difference at the point of pause
        } else {
            // Timer is active, calculate based on current time
            const targetDate = +new Date(order.dueDate);
            const now = +new Date();
            differenceMs = targetDate - now;
        }

        // Determine if it's late
        if (differenceMs <= 0 && !isPaused) { // Only consider late if not paused and time has run out
            isLate = true;
            differenceMs = Math.abs(differenceMs); // Display absolute difference for overdue
        } else if (differenceMs < 0 && isPaused) { // If paused and already late
            isLate = true;
            differenceMs = Math.abs(differenceMs);
        }


        return {
            ...msToTime(differenceMs),
            isLate,
            isPaused,
            pausedDifference,
        };
    }, [order.dueDate, order.timeRemainingBeforePause, order.negotiation]);

    // Initialize timeLeft with a default, non-time-dependent value to prevent hydration mismatch
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLate: false,
        isPaused: false,
    });

    useEffect(() => {
        if (isDeliveryModalOpen || isContactModalOpen || isFileUploadModalOpen || isExtendDeliveryModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isDeliveryModalOpen, isContactModalOpen, isFileUploadModalOpen, isExtendDeliveryModalOpen]);


    useEffect(() => {
        // Set initial time after component mounts to avoid hydration errors
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]); // Recalculate interval if order.dueDate or negotiation changes

    const intervals: Array<keyof Omit<TimeLeft, 'isLate' | 'isPaused' | 'pausedDifference'>> = ['days', 'hours', 'minutes', 'seconds'];

    // --- Render Timer Components ---
    const timerComponents: JSX.Element[] = intervals.map((interval, index) => {
        const value = timeLeft[interval];
        return (
            <React.Fragment key={interval}>
                <div className="flex flex-col items-center justify-center">
                    <div
                        className={clsx(
                            "font-bold text-lg",
                            timeLeft.isLate
                                ? "text-error-500"
                                : timeLeft.isPaused
                                    ? "text-gray-500"
                                    : "text-primary-600"
                        )}
                    >
                        {String(value || 0).padStart(2, "0")}
                    </div>

                    <div
                        className={clsx(
                            "text-xs capitalize",
                            timeLeft.isLate
                                ? "text-gray-700"
                                : timeLeft.isPaused
                                    ? "text-gray-400"
                                    : "text-primary-500"
                        )}
                    >
                        {interval}
                    </div>
                </div>


                {index < intervals.length - 1 && <div className="h-full border-r border-gray-200"/>}
            </React.Fragment>
        );
    });

    const handleChangeTab = (tab: string) => {
        setCurrentTab(tab);
        // router.refresh();
    }
    // --- Render Main Component ---
    return (
        <LoadingWrapper backgroundTransparent={true} hideSpinner={true} isLoading={false}>
            {order.negotiation ? (
                <OrderNegotiationBanner
                    getNegotiationDisplayName={getNegotiationDisplayName}
                    onApprove={() => console.log('Approve clicked')} // Placeholder
                    onReject={() => console.log('Reject clicked')}   // Placeholder
                />) : (
                <OrderFinalBanner/>)
            }

            <section className={"container mx-auto p-6 pb-16 grid grid-cols-1 lg:grid-cols-3 auto-rows-max"}>
                <div className="col-span-full flex items-center justify-between mt-6">
                    <div className={'pb-4 border-b border-gray-300 w-full lg:w-2/3'}>
                        {/* Tabs */}
                        <ul className={
                            clsx("list-unstyled flex flex-wrap gap-6 font-semibold text-gray-500",
                                "[&>*]:py-1 [&>*]:transition-all [&>*]:duration-200 [&>*]:border-b-2 [&>*]:border-transparent [&>.active]:border-primary-600 [&>.active]:text-primary-600")
                        }>
                            <li className={clsx(currentTab === 'activity' ? 'active' : '')}>
                                <button onClick={() => handleChangeTab('activity')}
                                        className="btn btn-text rounded-none lg:text-base tracking-wide uppercase hover:text-current">
                                    ORDER ACTIVITY
                                </button>
                            </li>
                            <li className={clsx(currentTab === 'details' ? 'active' : '')}>
                                <button onClick={() => handleChangeTab('details')}
                                        className="btn btn-text rounded-none lg:text-base tracking-wide uppercase hover:text-current">
                                    ORDER DETAILS
                                </button>
                            </li>
                            <li className={clsx(currentTab === 'requirements' ? 'active' : '')}>
                                <button onClick={() => handleChangeTab('requirements')}
                                        className="btn btn-text rounded-none lg:text-base tracking-wide uppercase hover:text-current">
                                    REQUIREMENTS
                                </button>
                            </li>
                            <li className={clsx(currentTab === 'delivery' ? 'active' : '')}>
                                <button onClick={() => handleChangeTab('delivery')}
                                        className="btn btn-text rounded-none lg:text-base tracking-wide uppercase hover:text-current">
                                    DELIVERY
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={'flex flex-wrap items-center'}>
                        <button ref={moreBtnRef} className={'btn btn-plain px-2'}
                                onClick={() => setOpenMenu(!openMenu)}
                        >
                            <EllipsisVertical size={16}/>
                        </button>
                        <OrderMoreActionMenu
                            isOpen={openMenu}
                            onClose={() => setOpenMenu(false)}
                            anchorRef={moreBtnRef}
                        />
                    </div>
                </div>
                <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        {(() => {
                            switch (currentTab) {
                                case "activity":
                                    return (<OrderActivity
                                        setCurrentTab={handleChangeTab}/>);
                                case "details":
                                    return (<OrderOverview order={order}/>);
                                case "requirements":
                                    return (
                                        <>
                                            {order.requirements.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {order.requirements.map((req: any) => (
                                                        <li key={req.requirementId}
                                                            className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
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
                                                                                className="text-sm text-primary-600 hover:underline flex items-center gap-2"
                                                                            >
                                                                                <FileText className="w-4 h-4"/>
                                                                                {req.answerFile.fileName} ({(req.answerFile.fileSize / 1024).toFixed(1)} KB)
                                                                            </a>
                                                                            <p className="text-xs text-gray-500">{req.answerFile.fileType}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="flex items-center gap-2 text-xs text-gray-500">
                                                                    {req.required &&
                                                                        <span
                                                                            className="bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                                                                    {req.hasFile && <FileText className="w-4 h-4"/>}
                                                                    {req.answered ? (
                                                                        <CheckCircle
                                                                            className="w-4 h-4 text-green-500"/>
                                                                    ) : (
                                                                        <AlertCircle
                                                                            className="w-4 h-4 text-yellow-500"/>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500">No requirements specified.</p>
                                            )}
                                        </>
                                    );
                                case "delivery":
                                    return (
                                        <>
                                            {order.deliveredWork.length > 0 ? order.deliveredWork.map((delivered: any, index: number) => (
                                                <div key={index}
                                                     className="p-4 bg-gray-50 rounded-lg mb-4 shadow-sm border border-gray-100">
                                                    <div>
                                                        <p className="text-base uppercase font-medium text-gray-900">
                                                            Message
                                                        </p>
                                                        <p className={"text-base"}>{delivered.message}</p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <h3 className={"font-medium text-sm text-gray-700 mb-2"}>DELIVERED
                                                            FILES</h3>
                                                        {delivered ? (
                                                            <div className="flex flex-wrap gap-4">
                                                                {delivered.files.map((file: any, index: number) => (
                                                                    <div
                                                                        onClick={() => window.open(file.downloadUrl, '_blank')}
                                                                        key={index}
                                                                        className="btn btn-soft shrink-0 gap-2 text-sm font-medium px-2 py-3 bg-gray-100 rounded-md w-fit text-primary-500"
                                                                    >
                                                                        <span>
                                                                            {file.fileName} ({(file.fileSize / 1024).toFixed(1)} KB)
                                                                        </span>
                                                                        <Download size={18}
                                                                                  className="cursor-pointer"/>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-red-500">No delivered work
                                                                data
                                                                found.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div
                                                    className="p-6 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                                                    <Package size={40} className="text-primary-500 mb-2"/>
                                                    <h3 className="text-primary-600 font-semibold">No delivery
                                                        yet</h3>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        The seller hasn’t delivered any work for this order yet.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    );
                                default:
                                    return (<OrderActivity
                                        setCurrentTab={handleChangeTab}/>); // Default to activity
                            }
                        })()}
                    </div>

                    {/* Sidebar: Summary Card */}
                    <div className="lg:col-span-1 h-full">
                        {![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status) && (
                            <div
                                className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 p-4 grid grid-cols-1 gap-3">
                                {/* Title dựa trên trạng thái */}
                                <>
                                    <h3 className={clsx("font-semibold text-gray-800")}>
                                        {(() => {
                                            if (isSeller && order.status === OrderStatus.ACTIVE) {
                                                return "Waiting for Buyer Requirements";
                                            }
                                            if (order.negotiation) {
                                                return getNegotiationDisplayName(order.negotiation.type);
                                            }
                                            if (timeLeft.isPaused) {
                                                return "Awaiting Buyer's Review";
                                            }
                                            if (timeLeft.isLate) {
                                                return "Overdue";
                                            }
                                            return isSeller ? "Time to Deliver" : "Time to Receive";
                                        })()}
                                    </h3>
                                    {!(isSeller && order.status === OrderStatus.ACTIVE) && (
                                        <div className="flex justify-between items-center w-full px-1">
                                            {timerComponents}
                                        </div>
                                    )}

                                    {/* Nút hành động */}
                                    <div className="mt-3">
                                        {isSeller ? (
                                            <>
                                                {order.status === OrderStatus.ACTIVE ? (
                                                    // --- Seller view when order is active and awaiting requirements ---
                                                    <div
                                                        className="p-3 bg-blue-50 rounded-lg text-center -mt-3">
                                                        <div
                                                            className="flex items-center justify-center gap-2 text-blue-700 font-semibold">
                                                            <FileText className="w-4 h-4"/>
                                                            <span>Waiting for Buyer Requirements</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            The order will start once the buyer provides the
                                                            necessary
                                                            requirements.
                                                        </p>
                                                    </div>
                                                ) : order.negotiation ? (
                                                    // --- Seller view when there’s an active negotiation ---
                                                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                                                        <div
                                                            className="flex items-center justify-center gap-2 text-yellow-700 font-semibold">
                                                            <AlertCircle className="w-4 h-4"/>
                                                            <span>{getNegotiationDisplayName(order.negotiation.type)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            Awaiting buyer’s response to this request.
                                                        </p>
                                                    </div>
                                                ) : timeLeft.isPaused ? (
                                                    // --- Seller view when delivery is paused (waiting for review) ---
                                                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                                                        <div
                                                            className="flex items-center justify-center gap-2 text-primary-600 font-semibold">
                                                            <CheckCircle className="w-4 h-4"/>
                                                            <span>Waiting for Buyer’s Review</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            You can only deliver a revision if the Buyer
                                                            requests
                                                            one.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // --- Seller normal active actions ---
                                                    <div className="text-center">
                                                        <button
                                                            onClick={() => setIsDeliveryModalOpen(true)}
                                                            className="btn btn-soft text-base w-full py-2.5 text-white font-medium rounded-md bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                                                        >
                                                            {order.delivered ? "Deliver Revision" : "Deliver Now"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setIsExtendDeliveryModalOpen(true)}
                                                            className="mx-auto btn btn-text font-normal text-sm block text-center text-gray-500 mt-3 hover:underline"
                                                        >
                                                            Extend delivery date
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {order.negotiation && (
                                                    // --- Buyer view when there’s an active negotiation ---
                                                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                                                        <div
                                                            className="flex items-center justify-center gap-2 text-yellow-700 font-semibold">
                                                            <AlertCircle className="w-4 h-4"/>
                                                            <span>{getNegotiationDisplayName(order.negotiation.type)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            Please review the active request and respond.
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            </div>
                        )}

                        {/* Always show contact button */}
                        <div
                            className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 p-4 flex flex-col gap-2">
                            {!isSeller && order.status === OrderStatus.ACTIVE && (
                                <Link
                                    href={`/orders/${order._id}/requirements/answer`}
                                    className={clsx(
                                        "btn bg-primary-600 text-white w-full py-2.5 font-semibold",
                                    )}
                                >
                                    Add Requirements
                                </Link>
                            )}
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className={clsx(
                                    "btn btn-outlined w-full py-2.5 font-semibold",
                                    isSeller
                                        ? "text-gray-800"
                                        : "text-primary-600"
                                )}
                            >
                                {isSeller ? "Message Buyer" : "Message Seller"}
                            </button>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <OrderSummary/>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delivery Modal (giữ nguyên) */}
            <Modal
                isOpen={isDeliveryModalOpen}
                onClose={() => setIsDeliveryModalOpen(false)}
                className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[90vh] max-w-md"
                backdropClassName="bg-black/20"
            >
                <OrderDeliveryForm
                    orderId={order._id}
                    onClose={() => {
                        setIsDeliveryModalOpen(false);
                    }}
                />
            </Modal>
            {/* Contact Seller Modal (Secondary Modal) (giữ nguyên) */}
            <Modal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[80vh] w-full max-w-md"
                backdropClassName="bg-black/20"
            >
                <ContactForm receiverId={!isSeller ? order.sellerId : order.buyerId}
                             username={!isSeller ? seller.username! : buyer.username!}
                             profilePicture={!isSeller ? seller.profilePicture! : buyer.profilePicture!}
                             isSeller={isSeller}
                             onCancelAction={() => setIsContactModalOpen(false)} onSubmitAction={() => console.log()}/>
            </Modal>

            {/* Contact Seller Modal (Secondary Modal) (giữ nguyên) */}


            {/* Extend Delivery Date Modal */}
            <Modal
                isOpen={isExtendDeliveryModalOpen}
                onClose={() => setIsExtendDeliveryModalOpen(false)}
                className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[90vh] w-full max-w-md"
                backdropClassName="bg-black/20"
            >
                <ExtendDeliveryDateForm
                    onClose={() => setIsExtendDeliveryModalOpen(false)}
                />
            </Modal>
        </LoadingWrapper>
    )
}
