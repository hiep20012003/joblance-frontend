'use client'

import React, {useState} from 'react';
import FormLabel from '@/components/shared/FormLabel';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import {AlertCircle, MoveRight} from "lucide-react";
import {formatISOTime} from '@/lib/utils/time';
import {IOrderDocument} from '@/types/order';
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useDirectValidation, ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {createNegotiationSchema} from "@/lib/schemas/order.schema";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {createNegotiation} from "@/lib/services/client/order.client";
import {NegotiationType} from "@/lib/constants/constant";
import {useUserContext} from "@/context/UserContext";
import {useRouter} from "next/navigation";

interface RequestCancelFormProps {
    order: Required<IOrderDocument>;
    onClose: () => void;
}

export default function RequestCancelForm({onClose, order}: RequestCancelFormProps) {
    const {user} = useUserContext();
    const [reason, setReason] = useState(''); // State for the cancellation reason (for payload)
    const [message, setMessage] = useState(''); // State for the message (for negotiation object)
    const router = useRouter();

    const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors>({});

    const {parse} = useDirectValidation(createNegotiationSchema);

    const {mutate, loading} = useFetchMutation(
        createNegotiation,
        {
            successMessage: "Cancellation request sent. Waiting for approval.",
            onSuccess: () => {
                onClose?.();
                router.refresh();
            },
        }
    );

    const getBodyData = () => {
        const requesterRole = user?.id === order.sellerId ? 'seller' as const : 'buyer' as const;
        return {
            orderId: order._id,
            type: NegotiationType.CANCEL_ORDER,
            requesterId: user?.id as string,
            requesterRole: requesterRole,
            message: message, // Use the separate message state
            payload: {
                reason: reason // Use the separate reason state for the payload
            }
        };
    };

    const validateForm = () => {
        const bodyData = getBodyData();

        // Assuming createNegotiationSchema has validation for 'reason' under 'message' or 'payload.reason'
        const {valid, treeifyError} = parse(bodyData);
        setFormErrors(treeifyError);
        return valid;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        await mutate(getBodyData());
    };

    const handleCancel = () => {
        onClose?.();
    };

    return (
        <>
            <LoadingWrapper isLoading={loading} fullScreen/>
            <div className="flex-1 overflow-y-auto scrollbar-beautiful p-6">
                <h2 className="text-xl font-semibold mb-4">Request: Cancel Order</h2>
                <div
                    className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm">
                        Are you sure you want to cancel this order? This action cannot be undone and requires the other
                        party&#39;s approval.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <FormLabel label="Cancellation Reason" required/>
                        <Textarea
                            placeholder="Provide a brief reason for this cancellation (e.g., project changes, mutual agreement)."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={200}
                            minLength={5}
                            showCounter
                            error={formErrors?.properties?.payload?.properties?.reason?.errors?.[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter at least 5 characters</p>
                    </div>
                    <div className="mb-4">
                        <FormLabel label={user?.id === order.sellerId ? "Message to Buyer" : "Message to Seller"}
                                   required/>
                        <Textarea
                            placeholder="Write your message to the other party explaining the cancellation request."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            maxLength={400}
                            minLength={5}
                            showCounter
                            error={formErrors?.properties?.message?.errors?.[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter at least 5 characters</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Send Cancellation Request
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
