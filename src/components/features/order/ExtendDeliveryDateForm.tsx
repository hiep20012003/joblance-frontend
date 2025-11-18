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
import {useOrder} from "@/components/features/order/OrderContext";

interface ExtendDeliveryDateFormProps {
    onClose: () => void;
}

export default function ExtendDeliveryDateForm({onClose}: ExtendDeliveryDateFormProps) {
    const {order} = useOrder();
    const [extendReason, setExtendReason] = useState('');
    const [additionalDays, setAdditionalDays] = useState<number>(0);
    const router = useRouter();

    const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors>({});

    const {parse} = useDirectValidation(createNegotiationSchema);

    const {mutate, loading} = useFetchMutation(
        createNegotiation,
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
                onClose?.();
                router.refresh();
            },
        }
    );

    const getBodyData = () => {
        return {
            orderId: order._id,
            type: NegotiationType.EXTEND_DELIVERY,
            requesterId: order?.sellerId as string,
            requesterRole: 'seller' as const,
            message: extendReason,
            payload: {
                newDeliveryDays: additionalDays,
                originalDeliveryDate: order.dueDate
            }
        };
    };

    const validateForm = () => {
        const bodyData = getBodyData();

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
                <h2 className="text-xl font-semibold mb-4">Request: Extend delivery date</h2>
                <div
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm">
                        Sometimes you just need more time, but keep in mind this can affect buyer satisfaction.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <FormLabel label="How many days do you want to add to original date?" required/>
                        <Input
                            type="number"
                            value={additionalDays === 0 ? '' : additionalDays}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setAdditionalDays(isNaN(value) || value < 0 ? 0 : value);
                            }}
                            min="0"
                            max="60"
                            placeholder="e.g., 3 days"
                            className={'max-w-1/2'}
                            error={formErrors?.properties?.payload?.properties?.newDeliveryDays?.errors?.[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">You can ask up to 60 days</p>
                    </div>
                    <div
                        className="mb-4 text-gray-800 flex items-center gap-8 p-4 bg-gray-50 rounded-md">
                        <div className="flex flex-col">
                            <p className="text-sm text-gray-600">Original date</p>
                            <p className="text-base font-medium">
                                {formatISOTime(order.dueDate, 'month_day_year')}
                            </p>
                        </div>
                        <MoveRight className="w-5 h-5 text-gray-500"/>
                        <div className="flex flex-col">
                            <p className="text-sm text-gray-600">New date</p>
                            <p className="text-base font-medium">
                                {(() => {
                                    const originalDate = new Date(order.dueDate);
                                    const newDate = new Date(originalDate);
                                    newDate.setDate(originalDate.getDate() + additionalDays);
                                    return formatISOTime(newDate.toISOString(), 'month_day_year');
                                })()}
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <FormLabel label="Help the buyer understand" required/>
                        <Textarea
                            placeholder="Following our discussion, please accept this request"
                            value={extendReason}
                            onChange={(e) => setExtendReason(e.target.value)}
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
                            className="btn bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
