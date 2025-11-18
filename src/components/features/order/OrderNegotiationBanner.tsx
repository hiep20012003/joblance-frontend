'use client'

import {INegotiationDocument, IOrderDocument} from "@/types/order";
import React from "react";
import {AlertCircle} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import {NegotiationStatus, NegotiationType} from "@/lib/constants/constant";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {approveNegotiation, rejectNegotiation} from "@/lib/services/client/order.client";
import {useRouter} from "next/navigation";
import {useUserContext} from "@/context/UserContext";
import {useOrder} from "@/components/features/order/OrderContext";

interface OrderNegotiationBannerProps {
    getNegotiationDisplayName: (type: NegotiationType) => string;
    onApprove: () => void;
    onReject: () => void;
}

export default function OrderNegotiationBanner({
                                                   getNegotiationDisplayName,
                                                   onApprove,
                                                   onReject,
                                               }: OrderNegotiationBannerProps) {
    const router = useRouter();
    const {user} = useUserContext();
    const {order, isSeller} = useOrder();
    const negotiation = order.negotiation as Required<INegotiationDocument>;

    const {mutate: rejectMutate, loading: rejectLoading} = useFetchMutation(
        (body: any) => rejectNegotiation(negotiation._id, body),
        {
            successMessage: "Requested delivery extension. Waiting for buyer approval.",
            onSuccess: () => {
                // const gig = result as Required<IOrderDocument>;
                // if (!gig) return;
                //
                // setGigs((prev) => {
                //     const shouldAdd =
                //         (gigStatus.value === "active" && gig.active) ||
                //         (gigStatus.value === "inactive" && !gig.active);
                //     return shouldAdd ? [...prev, gig] : prev;
                // });
                onReject?.();
                console.log(12345);
                router.refresh();
            },
        }
    );

    const {mutate: approveMutate, loading: approveLoading} = useFetchMutation(
        (body: any) => approveNegotiation(negotiation._id, body),
        {
            successMessage: "Requested delivery extension. Waiting for buyer approval.",
            onSuccess: () => {
                // const gig = result as Required<IOrderDocument>;
                // if (!gig) return;
                //
                // setGigs((prev) => {
                //     const shouldAdd =
                //         (gigStatus.value === "active" && gig.active) ||
                //         (gigStatus.value === "inactive" && !gig.active);
                //     return shouldAdd ? [...prev, gig] : prev;
                // });

                onApprove?.();
                router.refresh();
            },
        }
    );

    if (!negotiation || negotiation.status !== NegotiationStatus.PENDING) {
        return null;
    }

    async function handleApprove() {
        await approveMutate({actorId: user?.id});
    }

    async function handleReject() {
        await rejectMutate({actorId: user?.id});
    }

    return (
        <>
            <LoadingWrapper isLoading={rejectLoading || approveLoading} fullScreen={true}/>
            <section className="bg-primary-50 py-4 border-b border-primary-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary-800"/>
                            <h2 className="text-lg font-semibold text-primary-800">
                                {getNegotiationDisplayName(negotiation.type)}
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <Avatar
                                src={order.sellerPicture}
                                username={order.sellerUsername}
                                size={44}
                                className="mt-1 flex-shrink-0"/>

                            {/* Text + Details + Action Note */}
                            <div className="flex-1 min-w-0">
                                {/* Message */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">
                                        Request from{' '}
                                        <span className="font-medium text-primary-500">
                                        {negotiation.requesterRole === 'seller'
                                            ? (isSeller ? 'You' : order.sellerUsername)
                                            : (!isSeller ? 'You' : order.buyerUsername)}
                                    </span>
                                    </p>
                                    <p className="mt-1 break-words text-gray-800 leading-relaxed italic">
                                        &#34;{negotiation.message}&#34;
                                    </p>
                                </div>

                                {/* Details Card */}
                                <div className="rounded-lg bg-primary-100 p-3 mb-4">
                                    <h3 className="mb-2 text-sm font-medium text-primary-900">
                                        Request Details
                                    </h3>

                                    <div className="space-y-2 text-sm">
                                        {negotiation.type === NegotiationType.EXTEND_DELIVERY &&
                                            negotiation.payload.newDeliveryDays && (
                                                <p className="text-primary-700">
                                                    <span className="font-medium">New deadline:</span>{' '}
                                                    <strong>{negotiation.payload.newDeliveryDays} days</strong>
                                                    <span className="text-primary-600">
                                                    {' '}
                                                        (Original due: {' '}
                                                        {new Date(
                                                            negotiation.payload.originalDeliveryDate!
                                                        ).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                        )
                                                </span>
                                                </p>
                                            )}

                                        {negotiation.type === NegotiationType.CANCEL_ORDER &&
                                            negotiation.payload.reason && (
                                                <p className="text-primary-700">
                                                    <span className="font-medium">Reason:</span>{' '}
                                                    <span className="italic">“{negotiation.payload.reason}”</span>
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/* Message for the requester */}
                                {((isSeller && negotiation.requesterRole === 'seller') || (!isSeller && negotiation.requesterRole === 'buyer')) && (
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-800 mt-4">
                                        <p className="leading-relaxed text-sm">
                                            You have sent
                                            a {getNegotiationDisplayName(negotiation.type).toLowerCase()}. Awaiting
                                            a response from the{' '}
                                            <span className="font-medium">
                                            {isSeller ? `Buyer (${order.buyerUsername})` : `Seller (${order.sellerUsername})`}
                                        </span>.
                                        </p>
                                    </div>
                                )}

                                {/* Action Note for the recipient */}
                                {((isSeller && negotiation.requesterRole === 'buyer') || (!isSeller && negotiation.requesterRole === 'seller')) && (
                                    <div
                                        className="p-3 bg-yellow-50 rounded-lg text-yellow-800 mt-4">
                                        {negotiation.type === NegotiationType.EXTEND_DELIVERY && (
                                            <p className="text-sm leading-relaxed">
                                                <span className="font-medium">Approving</span> will immediately
                                                extend the deadline and restart the clock. <span
                                                className="font-medium">Rejecting</span> will resume the original
                                                clock.
                                            </p>
                                        )}
                                        {negotiation.type === NegotiationType.CANCEL_ORDER && (
                                            <p className="text-sm leading-relaxed">
                                                <span className="font-medium">Approving</span> means you agree to
                                                cancel the order and the full amount will be refunded to the
                                                Buyer. <span className="font-medium">Rejecting</span> will return
                                                the order to its active state.
                                            </p>
                                        )}
                                        <p className="text-sm leading-relaxed mt-1">
                                            <span className="font-medium">No action:</span> If no action is taken
                                            within 1 days, the request will be automatically rejected.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {((isSeller && negotiation.requesterRole === 'buyer') || (!isSeller && negotiation.requesterRole === 'seller')) && (
                        <div className="flex gap-3 justify-end w-full mt-4">
                            <button
                                onClick={handleReject}
                                className="btn btn-soft text-gray-950 rounded-md">
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className="btn btn-soft bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2 rounded-md">
                                Approve
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
